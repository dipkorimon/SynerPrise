import time
from functools import wraps
from rest_framework.response import Response
from rest_framework import status
from system.redis_client import redis_client

# Lua script for atomic token bucket update
TOKEN_BUCKET_LUA = """
local key = KEYS[1]
local capacity = tonumber(ARGV[1])
local refill_rate = tonumber(ARGV[2])
local now = tonumber(ARGV[3])
local tokens
local last_refill

local data = redis.call("GET", key)
if data then
    tokens, last_refill = string.match(data, "([^:]+):([^:]+)")
    tokens = tonumber(tokens)
    last_refill = tonumber(last_refill)
else
    tokens = capacity
    last_refill = now
end

-- refill
local delta = math.max(0, now - last_refill)
tokens = math.min(capacity, tokens + delta * refill_rate)

-- check
if tokens < 1 then
    redis.call("SET", key, tokens .. ":" .. now)
    redis.call("EXPIRE", key, math.ceil(capacity / refill_rate))
    return -1
end

tokens = tokens - 1
redis.call("SET", key, tokens .. ":" .. now)
redis.call("EXPIRE", key, math.ceil(capacity / refill_rate))
return tokens
"""

def rate_limit_login(ip_limit=5, ip_window=60, user_limit=5):
    def decorator(view_func):
        @wraps(view_func)
        def _wrapped_view(*args, **kwargs):
            # Get request object
            request = None
            if len(args) > 1:
                request = args[1]
            elif 'request' in kwargs:
                request = kwargs['request']
            else:
                raise ValueError("Cannot find request object in args or kwargs")

            ip = request.META.get('REMOTE_ADDR', 'unknown')
            username = request.data.get('username') or "anonymous"

            ip_key = f"tokenbucket:ip:{ip}"
            user_key = f"tokenbucket:user:{username}"
            backoff_key = f"backoff:{username}"

            now = time.time()

            # Exponential backoff check
            backoff_data = redis_client.hgetall(backoff_key)
            if backoff_data:
                retry_after = float(backoff_data.get("retry_after", 0))
                if now < retry_after:
                    wait_time = int(retry_after - now)
                    return Response(
                        {"detail": f"Too many attempts. Try again after {wait_time} seconds."},
                        status=status.HTTP_429_TOO_MANY_REQUESTS
                    )

            # IP-level token bucket
            ip_tokens = redis_client.eval(
                TOKEN_BUCKET_LUA, 1, ip_key, ip_limit, ip_limit / ip_window, now
            )
            if ip_tokens == -1:
                return Response(
                    {"detail": "Too many login attempts from this IP."},
                    status=status.HTTP_429_TOO_MANY_REQUESTS
                )

            # User-level token bucket
            user_tokens = redis_client.eval(
                TOKEN_BUCKET_LUA, 1, user_key, user_limit, user_limit / ip_window, now
            )
            if user_tokens == -1:
                return Response(
                    {"detail": "Too many login attempts for this user."},
                    status=status.HTTP_429_TOO_MANY_REQUESTS
                )

            # Call the original view
            response = view_func(*args, **kwargs)

            if response.status_code != 200:
                # Failed login attempt → increase backoff
                failed_attempts = int(backoff_data.get("attempts", 0)) + 1 if backoff_data else 1
                wait_time = min(300, 2 ** failed_attempts)  # max wait 5 min
                redis_client.hset(backoff_key, mapping={
                    "attempts": failed_attempts,
                    "retry_after": now + wait_time
                })
                redis_client.expire(backoff_key, 300)
            else:
                # Success → reset backoff
                redis_client.delete(backoff_key)

            return response
        return _wrapped_view
    return decorator
