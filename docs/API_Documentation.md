# SentinelX AI - API Documentation

The SentinelX API uses standard HTTP JSON endpoints protected by JWT OAuth2 bearer token constraints.

---

## 1. Authentication Endpoints

### `POST /api/v1/auth/login`
Exchanges user credentials for an active token:
*   **Body Content-Type:** `application/x-www-form-urlencoded`
*   **Parameters:** `username` (email), `password`.
*   **JSON Response:**
    ```json
    {
      "access_token": "ey...",
      "token_type": "bearer"
    }
    ```

---

## 2. Core ML & Prediction Endpoints

### `POST /api/v1/ml/upload-dataset`
*   **Allowed Roles:** `admin`
*   **Body Content-Type:** `multipart/form-data`
*   **Payload:** `file` (CSV dataset)

### `POST /api/v1/ml/train`
*   **Allowed Roles:** `admin`
*   **Response:**
    ```json
    {
      "status": "success",
      "message": "Model training task spawned in background."
    }
    ```

### `POST /api/v1/ml/predict`
Runs ML predictions and generates Gemini API narratives:
*   **Allowed Roles:** `admin`, `investigator`
*   **JSON Request:**
    ```json
    {
      "transaction": { "amount": 250.0 },
      "concurrent_logs": []
    }
    ```
*   **Response:**
    ```json
    {
      "prediction_id": 12,
      "output_label": "Medium",
      "risk_score": 38.5,
      "anomaly_score": 45.0,
      "is_anomaly": false,
      "fraud_probability": 12.0,
      "is_fraud": false,
      "explanation": {
        "threat_summary": "Low deviation transaction...",
        "recommended_actions": ["Notify SOC"]
      }
    }
    ```

---

## 3. Incident Feeds

### `GET /api/v1/ml/incidents`
Queries historical LLM threat assessment logs saved inside PostgreSQL:
*   **Response:**
    ```json
    {
      "status": "success",
      "incidents_count": 1,
      "incidents": [
        {
          "id": 1,
          "title": "Outlier transaction...",
          "severity": "HIGH",
          "timestamp": "2026-07-15T11:57:13Z"
        }
      ]
    }
    ```
