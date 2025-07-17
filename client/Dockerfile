FROM ubuntu:latest
LABEL authors="dipkorimon"

FROM node:18-alpine

WORKDIR /app

# Copy package files and install deps
COPY package.json package-lock.json* ./
RUN npm install

# Copy full frontend code
COPY . .

# Build app for production
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
