# Stage 1: Build the React Application
FROM node:18-alpine AS build

WORKDIR /app/frontend

COPY frontend/package.json frontend/package-lock.json* ./
RUN npm install

COPY frontend/ ./
RUN npm run build

# Stage 2: Setup Python Flask & Serve Static Build
FROM python:3.11-slim AS production

ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install isolated API dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt gunicorn

# Migrate Backend App
COPY backend/app.py .

# Mount the static React deployment artifacts into the correct Flask view root
COPY --from=build /app/frontend/dist ./dist

# Bind to Cloud Run's automatically mapped port
EXPOSE 8080

CMD exec gunicorn --bind :$PORT --workers 1 --threads 8 --timeout 0 app:app
