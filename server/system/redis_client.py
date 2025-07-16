import redis
from decouple import config

redis_client = redis.Redis(
    host=config('REDIS_HOST'),
    port=config('REDIS_PORT'),
    db=0,
    decode_responses=True
)