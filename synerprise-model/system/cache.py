# system/cache.py
from redis import Redis
from decouple import config

redis_cache = Redis(
    host=config("REDIS_HOST", default="localhost"),
    port=config("REDIS_PORT", cast=int, default=6379),
    db=config("REDIS_CACHE_DB", cast=int, default=1),
    decode_responses=True
)
