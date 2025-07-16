FROM ubuntu:latest
LABEL authors="dipkorimon"

FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install system dependencies (psycopg2 needs libpq-dev)
RUN apt-get update \
    && apt-get install -y build-essential libpq-dev gcc curl \
    && apt-get clean

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Collect static files (optional: if you're serving static from backend)
# RUN python manage.py collectstatic --noinput

CMD ["gunicorn", "synerprise.wsgi:application", "--bind", "0.0.0.0:8000"]
