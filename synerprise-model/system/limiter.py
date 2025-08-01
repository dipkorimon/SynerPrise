from slowapi import Limiter
from redis import Redis
from system.auth import get_user_id_from_token
from starlette.requests import Request
from decouple import config

# Connect Redis
redis_client = Redis(host=config('REDIS_HOST'), port=config('REDIS_PORT'), db=0, decode_responses=True)

REDIS_HOST = config('REDIS_HOST')
REDIS_PORT = config('REDIS_PORT')

def custom_key(request: Request) -> str:
    ip = request.client.host
    auth = request.headers.get("Authorization")
    if auth and auth.startswith("Token "):
        token = auth[6:]
        user_id = get_user_id_from_token(token)
        if user_id:
            return f"user:{user_id}:ip:{ip}"
    return f"anon:{ip}"

limiter = Limiter(key_func=custom_key, storage_uri=f"redis://{REDIS_HOST}:{REDIS_PORT}")
