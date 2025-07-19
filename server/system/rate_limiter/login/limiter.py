import time
from functools import wraps
from rest_framework.response import Response
from rest_framework import status

from system.redis_client import redis_client


def rate_limit_login(ip_limit=5, ip_window=60, user_limit=5):
    def decorator(view_func):
        @wraps(view_func)
        def _wrapped_view(*args, **kwargs):
            request = None
            if len(args) > 1:
                request = args[1]
            elif 'request' in kwargs:
                request = kwargs['request']
            else:
                raise ValueError("Cannot find request object in args or kwargs")

            ip = request.META.get('REMOTE_ADDR', 'unknown')
            username = request.data.get('username') or "anonymous"

            ip_key = f"rate:ip:{ip}"
            user_key = f"rate:user:{username}"
            backoff_key = f"backoff:{username}"

            # Check exponential backoff
            backoff_data = redis_client.hgetall(backoff_key)
            if backoff_data:
                retry_after = float(backoff_data.get("retry_after", 0))
                if time.time() < retry_after:
                    wait_time = int(retry_after - time.time())
                    return Response(
                        {"detail": f"Too many attempts. Try again after {wait_time} seconds."},
                        status=status.HTTP_429_TOO_MANY_REQUESTS
                    )

            # IP-based rate limit
            ip_attempts = redis_client.get(ip_key)
            if ip_attempts and int(ip_attempts) >= ip_limit:
                return Response(
                    {"detail": "Too many login attempts from this IP. Please try later."},
                    status=status.HTTP_429_TOO_MANY_REQUESTS
                )

            # Username-based rate limit
            user_attempts = redis_client.get(user_key)
            if user_attempts and int(user_attempts) >= user_limit:
                return Response(
                    {"detail": "Too many login attempts for this user. Please try later."},
                    status=status.HTTP_429_TOO_MANY_REQUESTS
                )

            # Call the original view
            response = view_func(*args, **kwargs)

            if response.status_code != 200:
                # Failed login attempt
                redis_client.incr(ip_key)
                redis_client.expire(ip_key, ip_window)

                redis_client.incr(user_key)
                redis_client.expire(user_key, ip_window)

                failed_attempts = int(backoff_data.get("attempts", 0)) + 1 if backoff_data else 1
                wait_time = 2 ** failed_attempts

                redis_client.hmset(backoff_key, {
                    "attempts": failed_attempts,
                    "retry_after": time.time() + wait_time
                })
                redis_client.expire(backoff_key, 300)

            else:
                # Success resets all keys
                redis_client.delete(ip_key)
                redis_client.delete(user_key)
                redis_client.delete(backoff_key)

            return response

        return _wrapped_view
    return decorator
