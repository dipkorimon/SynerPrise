from slowapi import Limiter
from redis import Redis
from system.auth import get_user_id_from_token
from starlette.requests import Request
from decouple import config

REDIS_HOST: str = config("REDIS_HOST")
REDIS_PORT: int = int(config("REDIS_PORT"))

# Initialize Redis client with connection options for production stability
redis_client = Redis(
    host=REDIS_HOST,
    port=REDIS_PORT,
    db=0,
    decode_responses=True,
    socket_keepalive=True,
    socket_connect_timeout=5,
    socket_timeout=5,
)

def custom_key(request: Request) -> str:
    """
    Generate a unique rate limiting key based on user authentication and IP address.

    - If request has a valid 'Authorization: Token <token>' header and token is valid,
      key format: 'user:<user_id>:ip:<ip>'
    - Otherwise, fallback to 'anon:<ip>'
    """
    ip: str = request.client.host or "unknown"
    auth_header: str = request.headers.get("Authorization", "")
    token_prefix = "Token "

    if auth_header.startswith(token_prefix):
        token = auth_header[len(token_prefix):].strip()
        user_id = get_user_id_from_token(token)
        if user_id:
            return f"user:{user_id}:ip:{ip}"
    return f"anon:{ip}"

# Configure SlowAPI Limiter with Redis backend and default rate limits
limiter = Limiter(
    key_func=custom_key,
    storage_uri=f"redis://{REDIS_HOST}:{REDIS_PORT}",
    default_limits=["10/minute"],  # Adjust as per your app's traffic needs
)

