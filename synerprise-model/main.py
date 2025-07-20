from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import os


# Allow frontend access
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # You can replace "*" with frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 👇 Define request schema
class UserMessage(BaseModel):
    userMessage: str


# 👇 Accept JSON and return response
@app.post("/api/generate-code/")
async def generate_code(message: UserMessage):
    user_input = message.userMessage.strip()

    # Fake model output (replace later with real MT5)
    generated_code = f"for i in range(5):\n    print(i)"

    return {
        "userMessage": user_input,
        "generated_code": generated_code
    }