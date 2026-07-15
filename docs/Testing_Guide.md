# SentinelX AI - Testing Guide

This document describes how to execute automated tests, unit tests, and validation scripts in SentinelX AI.

---

## 1. Running Unit Tests

To run predictor validation scripts (e.g. testing model inference or risk engine configurations):

1.  Activate your python virtual environment:
    ```bash
    cd backend
    source venv/bin/activate
    ```
2.  Run the predictor unit test:
    ```bash
    python C:\Users\amalr\AppData\Local\Temp\test_predictor.py
    ```
3.  Run the risk engine logic test:
    ```bash
    python C:\Users\amalr\AppData\Local\Temp\test_risk_engine.py
    ```
4.  Run the LLM explanation test:
    ```bash
    python C:\Users\amalr\AppData\Local\Temp\test_llm_service.py
    ```

---

## 2. API Endpoint Testing via cURL

### Test live prediction:
```bash
curl -X POST "http://localhost:8000/api/v1/ml/predict" \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>" \
     -d '{
           "transaction": {"amount": 550.0},
           "concurrent_logs": []
         }'
```

### Test model retrieval:
```bash
curl -X GET "http://localhost:8000/api/v1/ml/models" \
     -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>"
```
This returns metadata details of the serialized classifiers.
