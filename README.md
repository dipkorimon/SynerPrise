**SynerPrise** is a multilingual, AI-driven system that translates **Bangla** and **Phonetic** natural language prompts into executable **Python code** using a fully custom Transformer-based Seq2Seq model — built from scratch without pre-trained dependencies.

---

## 🧠 Core Highlights

- 🔤 **Bangla & Phonetic → Python code generation**
- 🧠 **Transformer-based Seq2Seq architecture** with LSTM & Attention to translate Bangla and Phonetic Banglish prompts into executable Python code
- 💡 **Designed and trained the model from scratch** (no pre-trained dependencies)
- 📊 **Preprocessing:** Handled tokenization with `<unk>` tokens, padded sequences to uniform length, and applied one-hot encoding for model input preparation
- 🔢 **Training:** Teacher Forcing, Categorical Cross-Entropy Loss, Adam optimizer
- 🧮 **Inference:** Custom encoder–decoder pipeline with Attention and token-by-token decoding for real-time code synthesis
- ⚙️ **Model Architecture:** Seq2Seq with LSTM layers and Attention
- 🧰 **Loss & Optimization:** Categorical Cross-Entropy, Adam optimizer
- 🌐 **Fullstack Architecture:**
  - **Frontend:** Next.js
  - **Backend:** Django REST Framework (DRF)
  - **Model Service:** FastAPI
- 🧪 **Redis-powered** rate limiting and response caching
- 🧱 **Bloom Filter** for fast username/email existence checks (reduces DB queries)
- 🪵 **Custom logger** for structured logs
- 🐳 **Fully Dockerized** for deployment
- 🗃️ **PostgreSQL** for persistent storage

---

## 🚀 SynerPrise Model Summary

- Dataset: Paired Bengali/Phonetic commands and Python code.
- Preprocessing: Tokenization with `<unk>`, sequence padding.
- Architecture: Seq2Seq model with attention using LSTM layers.
- Training: Teacher forcing, categorical cross-entropy loss, Adam optimizer.
- Evaluation: Loss reported; further unseen data evaluation suggested.
- Inference: Separate encoder-decoder with attention; token-by-token decoding.
- Usage: Bengali command input → Python code output.

*This model provides a foundational approach for neural code generation from Bengali natural language commands.*

---

## 🏗️ Architecture Overview

```
            ┌────────────┐
            │  Next.js   │
            │ Frontend   │
            └────┬───────┘
                 │
     ┌───────────▼─────────────┐
     │  Django REST Framework  │◄──── Authentication, APIs
     └───────────┬─────────────┘
                 │
         ┌───────▼────────┐
         │   FastAPI      │  ◄──── Inference service (Tokenization → Encoder → Decoder → Output)
         │ Model Inference│
         └──────┬─────────┘
                │
         ┌──────▼──────────┐
         │  Custom Model   │
         │  (Seq2Seq)      │
         └─────────────────┘

  🔁 Redis (Rate limiting + Response caching)
  🪵 Custom Logging
  🗄️ PostgreSQL (via Django ORM)
```
---

## 🧩 Microservice Architecture

SynerPrise is composed of two independent microservices, each running in separate containers. This separation enables independent scaling, deployment, and fault isolation.

| Service       | Framework       | Responsibility                               |
|---------------|-----------------|----------------------------------------------|
| Django API    | Django REST     | Handles authentication, user management, and other API routing |
| Model Server  | FastAPI         | Exposes a public HTTP API for Bangla/Phonetic → Python code inference using a custom Transformer model |

### Communication Flow

- Clients communicate **directly with the FastAPI Model Server** for inference requests.
- The Django API service handles user authentication, authorization, and other management endpoints separately.
- The two services operate independently and do not require internal HTTP communication, though internal calls can be added if needed in the future.

---

## ⚙️ Technology Stack

| Layer       | Technology                 |
|-------------|----------------------------|
| Frontend    | **Next.js** (React)        |
| Backend API | **Django REST Framework**  |
| Inference   | **FastAPI** + **SQLAlchemy ORM** |
| Model       | **Custom Transformer**     |
| Model       | **Custom Seq2Seq with LSTM & Attention** |
| Preprocessing | **pandas, NumPy, Keras Tokenizer, pad_sequences** |
| Training     | **Categorical Cross-Entropy, Adam Optimizer, Teacher Forcing** |
| Inference    | **Encoder-Decoder with Attention, Token-by-Token Generation** |
| Database    | **PostgreSQL**             |
| Cache/Rate  | **Redis**                  |
| DevOps      | **Docker**, Docker Compose |
| Logging     | **Custom Python Logger**   |

---

## 🚦 Redis Usage

Redis is used extensively in SynerPrise to ensure high performance, security, and smooth user experience:

| Purpose             | Description                                                                   |
|---------------------|-------------------------------------------------------------------------------|
| 🔁 Caching           | Stores model responses for repeated input queries (FastAPI model service)     |
| 🚦 Rate Limiting     | Controls request frequency from users/IPs at two levels:                      |
|                     | • FastAPI service level (using SlowAPI)                                      |
|                     | • Django REST Framework login endpoint (custom token bucket + backoff)        |
| 🛡️ Auth Throttling   | Implements failed login attempt throttling with exponential backoff (DRF)     |

### 🧱 Login Rate Limiting Details (DRF)

- Rate limits based on both IP address (`REMOTE_ADDR`) and username (`username`)
- Limits enforced:
  - Max 5 failed attempts per IP per minute
  - Max 5 failed attempts per user per minute
- Uses **Token Bucket algorithm** with atomic Redis Lua scripting for burst control
- Implements **exponential backoff**: wait time doubles (2ⁿ seconds) after each consecutive failed login, capped at 5 minutes
- Automatically resets counters and backoff on successful login

> Example: After 3 failed logins, the user must wait 8 seconds before retrying.  
> Backoff resets immediately after a successful login.

### 🚀 API Rate Limiting Details (FastAPI)

- Rate limiting via **SlowAPI** using Redis as backend storage
- Generates composite rate limit key based on authenticated user ID + IP address, else IP alone for anonymous users
- Default limits typically set to 10 requests per minute per user/IP (configurable)
- Ensures fair usage and prevents abuse at the API request level

---

## 🔐 Bloom Filter Integration

- **Purpose:** Reduce unnecessary database queries for username/email existence checks and improve registration, login & password reset efficiency.
- **Implementation:** Using [PyBloom](https://pypi.org/project/pybloom/):
  - `username_bloom` → Tracks existing usernames
  - `email_bloom` → Tracks existing user emails
  - False positives are handled with a fallback **database verification**.
- **Usage:**
  - **User Registration:** Checks Bloom Filter before querying DB; adds new entries after successful registration.
  - **User Login:** Checks username/email in Bloom Filter before authenticating; reduces unnecessary DB hits.
  - **Password Reset:** Checks email in Bloom Filter before generating reset token.
- **Parameters:** Capacity=10,000, False positive rate=1%

> Bloom Filter ensures high-performance lookups and reduces load on PostgreSQL, while still guaranteeing correctness via DB fallback.

---

## 🪵 Custom Logging

SynerPrise includes a structured, timestamped logging system built using a custom Python logger (e.g., via `pythonjsonlogger`).

Example:
```json
{
  "level": "INFO",
  "time": "2025-08-07T10:15:32Z",
  "module": "inference",
  "message": "Generated code for prompt ID abc123"
}
```
---

## 🧪 Sample Prompt

**Input (Phonetic):**
```
amar jonno ekta function likho ja factorial return kore
```

**Output (Python):**
```python
def factorial(n):
    if n == 0:
        return 1
    return n * factorial(n - 1)
```
**Input preprocessing:**
- Convert text to sequence with Keras Tokenizer
- Pad sequences to max length

**Output:**
- Generated Python code using trained Seq2Seq model with attention
---

## 🏗️ SynerPrise System Architecture (Text-Based Diagram)

```
                        +-------------------+
                        |     CLIENT        |
                        |  (Browser/User)   |
                        +---------+---------+
                                  |
                                  v
                        +-------------------+
                        |     Next.js       |
                        |   (Frontend)      |
                        +---------+---------+
                                  |
                       +----------+----------+
                       |                     |
                       v                     v
            +-------------------+    +--------------------+
            |   Django REST     |    |     FastAPI        |
            |   (API Backend)   |    |  (Model Inference) |
            +--------+----------+    +---------+----------+
                     |                         |
                     v                         v
            +-------------------+    +-------------------------+
            |   Auth (via DRF)  |    |    Redis (Cache + RL)   |
            | + Rate Limiter    |    | - Model Rate Limiting   |
            |   (via Redis)     |    | - Response Caching      |
            +-------------------+    +-------------------------+
                     |                         |
                     v                         v
            +-------------------+     +------------------------+
            |  Custom Logger    |<--->|  FastAPI/Django Logging|
            +-------------------+     +------------------------+

                    All components containerized using:
                          +-------------------+
                          |      Docker       |
                          +-------------------+
```

---

## 🚀 Local Setup

### Requirements

- Python 3.10+
- Docker & Docker Compose
- Redis & PostgreSQL running

### Step-by-step

```bash
git clone https://github.com/dipkorimon/SynerPrise.git
cd SynerPrise

# Start the whole system
docker-compose up --build
```
### ML Model:
- Load trained Keras model (.keras)
- Load input & target tokenizers (Pickle files)
- Seq2Seq inference with attention

---

## 🔌 API Reference (FastAPI)

### `POST /generate-code`
```json
{
  "input_text": "loop likho ja 1 theke 10 print kore"
}
```

**Response:**
```json
{
  "output_text": "for i in range(1, 11):\n    print(i)"
}
```

---

## 📬 Contact

- GitHub: [github.com/dipkorimon/SynerPrise](https://github.com/dipkorimon/SynerPrise)
- Email: dipkorimon@gmail.com

---

## Code and Dataset Availability

The source code and dataset used to develop the SynerPrise model are currently maintained in a private repository and are not publicly accessible. Access may be granted upon request for academic and research purposes, subject to approval.

This approach ensures the integrity of ongoing research while enabling potential collaborations in the future.

---

## 📜 License

This project is licensed under **MIT License**.