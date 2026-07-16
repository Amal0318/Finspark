# CyberSense AI - Installation Guide

This guide provides step-by-step instructions to configure and run the CyberSense AI platform locally on your development machine.

---

## 1. Prerequisites

Ensure your system has the following software components installed:
*   **Python:** Version `3.11` (or `3.12` slim).
*   **Node.js:** Version `18` or newer (npm included).
*   **PostgreSQL:** Version `15` or newer.
*   **Docker & Docker Compose:** Required for containerized execution.

---

## 2. Manual Backend Setup

1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Initialize and activate a virtual environment:
    ```bash
    python -m venv venv
    # Windows:
    venv\Scripts\activate
    # macOS/Linux:
    source venv/bin/activate
    ```
3.  Install the required packages from `requirements.txt`:
    ```bash
    pip install -r requirements.txt
    ```
4.  Configure Environment variables:
    ```bash
    cp .env.example .env
    ```
    Open `.env` and set:
    *   `DATABASE_URL`: Connection string targeting your PostgreSQL.
    *   `JWT_SECRET`: Hex secret for JWT OAuth validations.
    *   `GEMINI_API_KEY`: Google generative AI key.
5.  Launch development server:
    ```bash
    uvicorn app.main:app --reload
    ```
    The server starts at `http://localhost:8000`.

---

## 3. Manual Frontend Setup

1.  Navigate to the frontend directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Run Vite development environment:
    ```bash
    npm run dev
    ```
    The client starts at `http://localhost:5173`.
