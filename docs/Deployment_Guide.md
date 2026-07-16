# CyberSense AI - Deployment Guide

This guide describes how to run CyberSense AI in containerized production mode.

---

## 1. Production Docker Services

CyberSense AI defines three containerized services inside `docker-compose.yml`:
1.  **`cybersense_db` (postgres:15-alpine):** Securely isolates database metrics. Persists storage data to local `pgdata` volumes.
2.  **`cybersense_backend` (fastapi/uvicorn):** Launches the ASGI server on port `8000`. Connects to the database container using PostgreSQL networks.
3.  **`cybersense_frontend` (nginx):** Reverse-proxies endpoints, resolves static build files, and listens on port `80`.

---

## 2. Docker Compose Commands

### Build and Start Containers
From the root workspace directory, run:
```bash
docker-compose up -d --build
```
This builds Vite static assets and constructs python layers.

### Halt Services & Delete Volumes
To stop and clean database persistence volumes:
```bash
docker-compose down -v
```

### Inspect Container Logs
To monitor live API endpoint hits and background training progress:
```bash
docker-compose logs -f backend
```
This prints stdout streams of the FastAPI process.
