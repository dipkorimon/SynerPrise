from fastapi import FastAPI, Request
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from decouple import config
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from starlette.responses import JSONResponse
import hashlib

from inference.model_router import detect_input_type
from inference.synerprise_bangla import generate_code as bangla_model
from inference.synerprise_phonetic import generate_code as phonetic_model
from config import default_model
from system.limiter import limiter
from system.cache import redis_cache
from logs.logger import logger

# Allow frontend access
NEXT_PUBLIC_FRONTEND_BASE_URL = config("NEXT_PUBLIC_FRONTEND_BASE_URL")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[NEXT_PUBLIC_FRONTEND_BASE_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, lambda request, exc: JSONResponse(
    status_code=429,
    content={"detail": "Rate limit exceeded. Try again later."}
))
app.add_middleware(SlowAPIMiddleware)

# Define request schema
class UserMessage(BaseModel):
    userMessage: str


@app.post("/api/generate-code/")
@limiter.limit("10/minute")
async def generate_code(request: Request, message: UserMessage):
    user_input = message.userMessage.strip()
    client_ip = request.client.host

    # Log incoming request
    logger.info(f"Received request from {client_ip}: {user_input}")

    if not user_input:
        logger.warning(f"Empty input received from {client_ip}")
        return {
            "userMessage": "",
            "error": "Input message is empty.",
            "model": default_model
        }

    # Redis cache key
    cache_key = f"gen:{hashlib.sha256(user_input.encode()).hexdigest()}"

    try:
        # Check cache
        cached_output = redis_cache.get(cache_key)
        if cached_output:
            logger.info(f"Cache HIT for key: {cache_key}, user: {client_ip}")
            return {
                "userMessage": user_input,
                "generated_code": cached_output,
                "model": "cached"
            }
        else:
            logger.info(f"Cache MISS for key: {cache_key}, user: {client_ip}")

        # Detect input type and select model
        selected_model = detect_input_type(user_input)
        logger.info(f"Input type detected: {selected_model}, user: {client_ip}")

        model_fn = bangla_model if selected_model == "synerprise-bangla" else phonetic_model

        # Generate code
        logger.info(f"Starting code generation using {selected_model}, user: {client_ip}")
        generated_code = model_fn(user_input)
        logger.info(f"Code generation completed for user: {client_ip}, input preview: {user_input[:50]}")

        # Handle generation errors
        if generated_code.startswith("[ERROR]"):
            logger.error(f"Code generation error for user: {client_ip}, details: {generated_code}")
            return {
                "userMessage": user_input,
                "error": "Code generation failed.",
                "model": selected_model,
                "details": generated_code
            }

        # Cache the result (24 hours)
        redis_cache.setex(cache_key, 86400, generated_code)
        logger.info(f"Cached generated code for key: {cache_key}, user: {client_ip}")

        return {
            "userMessage": user_input,
            "generated_code": generated_code,
            "model": selected_model
        }

    except Exception as e:
        logger.exception(f"Internal server error during code generation for user: {client_ip}")
        return {
            "userMessage": user_input,
            "error": "Internal server error during generation.",
            "model": default_model,
            "details": str(e)
        }
