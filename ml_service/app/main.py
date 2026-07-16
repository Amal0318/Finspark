from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, Any
from app.predictor import predictor

app = FastAPI(title="SentinelX ML Service", version="1.0.0")

class PredictRequest(BaseModel):
    features: Dict[str, Any]

@app.post("/predict")
async def predict_combined(request: PredictRequest):
    try:
        anomaly_res = predictor.predict_anomaly(request.features)
        fraud_res = predictor.predict_fraud(request.features)
        
        return {
            "anomaly": anomaly_res,
            "fraud": fraud_res
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference failed: {str(e)}")

@app.get("/health")
async def health_check():
    iforest_loaded = predictor.iforest is not None
    rf_loaded = predictor.rf_clf is not None
    return {
        "status": "healthy" if (iforest_loaded and rf_loaded) else "unhealthy",
        "iforest_loaded": iforest_loaded,
        "rf_loaded": rf_loaded
    }
