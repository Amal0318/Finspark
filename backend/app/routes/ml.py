import os
import datetime
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, UploadFile, File, BackgroundTasks, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import desc
from pydantic import BaseModel, Field

from app.core.database import get_db
from app.services.prediction_service import PredictionService
from app.services.llm_service import LLMService
from app.ml.train import ModelTrainer
from app.ml.risk_engine import RiskScoreEngine
from app.middleware.auth import RoleChecker, get_current_user
from app.models.user import User
from app.models.prediction import MlPrediction
from app.models.threat_report import ThreatReport
from app.models.incident import Incident
from app.ml.predict import predictor
from app.utils.logger import logger

# Initialize router with standard prefix
router = APIRouter(prefix="/ml", tags=["CyberSense AI Core"])

# Authorization check dependencies
analyst_only = RoleChecker(allowed_roles=["admin", "investigator"])
admin_only = RoleChecker(allowed_roles=["admin"])

# ----------------------------------------------------
# PYDANTIC SCHEMAS
# ----------------------------------------------------

class LivePredictionRequest(BaseModel):
    transaction: Dict[str, Any] = Field(..., description="Details of the banking transaction (e.g. amount, deviation, timestamp)")
    concurrent_logs: List[Dict[str, Any]] = Field(..., description="Concurrent security logs captured around the transaction")

class RiskScoreRequest(BaseModel):
    features: Dict[str, Any] = Field(..., description="Dictionary containing mapped feature inputs for the risk formula")

class GenerateReportRequest(BaseModel):
    risk_score: float = Field(..., description="Calculated composite risk score (0-100)")
    fraud_probability: float = Field(..., description="Random Forest fraud prediction probability")
    behaviour_score: float = Field(..., description="Isolation Forest anomaly score")
    cyber_threat_score: float = Field(..., description="Source IP and netflow exploit score")
    transaction_details: Dict[str, Any] = Field(..., description="Active payment details")
    login_details: Dict[str, Any] = Field(..., description="Active session login details")


# ----------------------------------------------------
# BACKGROUND WORKERS
# ----------------------------------------------------

def execute_training_task():
    """Background worker task target to train ML models without locking main execution thread."""
    try:
        logger.info("Background thread starting model training pipeline run...")
        ModelTrainer.train_pipeline()
        logger.info("Background thread successfully completed training pipeline.")
    except Exception as e:
        logger.error(f"Background training task failed: {e}")


# ----------------------------------------------------
# API ENDPOINTS
# ----------------------------------------------------

@router.post("/upload")
async def upload_and_infer(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(analyst_only)
):
    """
    Workflow: Upload CSV -> Validate -> Preprocess -> Feature Eng -> Predict -> Risk Score -> Store Results
    """
    import pandas as pd
    import io
    from app.models.incident import Incident
    import uuid
    import datetime

    try:
        contents = await file.read()
        df = pd.read_csv(io.BytesIO(contents))
        
        # We will loop through the dataframe and run predictions for each row
        # (This is simplified for real-time inference on an uploaded batch)
        # In a real heavy system, this would be a background task, but for instant UI refresh it runs synchronously
        
        incidents_created = 0
        for _, row in df.iterrows():
            features = row.to_dict()
            
            # Predict
            anomaly_res = predictor.predict_anomaly(features)
            fraud_res = predictor.predict_fraud(features)
            
            # Risk Score
            from app.ml.risk_engine import RiskScoreEngine
            risk_result = RiskScoreEngine.assess_risk(features)
            
            # Store Result as Incident
            new_incident = Incident(
                incident_id=f"INC-{uuid.uuid4().hex[:8].upper()}",
                timestamp=datetime.datetime.now(datetime.timezone.utc),
                user_id=str(features.get("customer_id", features.get("user", "Unknown"))),
                transaction_id=str(features.get("transaction_id", "N/A")),
                source_ip=str(features.get("source_ip", "127.0.0.1")),
                destination_ip=str(features.get("destination_ip", "Unknown")),
                fraud_probability=fraud_res.get("fraud_probability", 0.0),
                behaviour_score=anomaly_res.get("anomaly_score", 0.0),
                threat_score=risk_result["breakdown"]["threat_severity"],
                risk_score=risk_result["risk_score"],
                severity=risk_result["risk_level"],
                recommendation="Investigate" if risk_result["risk_score"] > 50 else "Monitor",
                status="Open",
                resolved=False
            )
            db.add(new_incident)
            incidents_created += 1
            
        await db.commit()
        
        return {
            "status": "success",
            "message": f"Processed {incidents_created} records and updated dashboard.",
            "incidents_created": incidents_created
        }
    except Exception as e:
        logger.error(f"Upload and inference failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Inference pipeline failed: {str(e)}"
        )

@router.post("/train")
async def trigger_model_training(
    background_tasks: BackgroundTasks,
    current_user: User = Depends(admin_only)
):
    """
    Triggers the training pipeline for both model architectures
    (SMOTE Random Forest & Isolation Forest) on processed datasets.
    Restricted to Administrator operators.
    """
    background_tasks.add_task(execute_training_task)
    return {
        "status": "success",
        "message": "Model training task spawned in background. Check API logs for progression updates."
    }

@router.post("/predict")
async def predict_threats(
    request: LivePredictionRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(analyst_only)
):
    """
    Performs real-time transaction correlation, runs dual-model inferences (Anomaly & Fraud),
    computes composite risk, and generates LLM-explanations.
    """
    try:
        result = await PredictionService.classify_transaction(
            db, 
            request.transaction, 
            request.concurrent_logs
        )
        return result
    except Exception as e:
        logger.error(f"Prediction inference error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Inference pipeline failed: {str(e)}"
        )

@router.post("/risk-score")
async def compute_risk_score(
    request: RiskScoreRequest,
    current_user: User = Depends(analyst_only)
):
    """
    Computes a composite security risk percentage score and category
    using the weighted hybrid risk score formula.
    """
    try:
        result = RiskScoreEngine.assess_risk(request.features)
        return result
    except Exception as e:
        logger.error(f"Risk calculation failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Risk engine failed: {str(e)}"
        )

@router.post("/generate-report")
async def generate_threat_report(
    request: GenerateReportRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(analyst_only)
):
    """
    Generates a structured threat assessment using Gemini (or heuristics fallback)
    integrating transaction details, logins, and anomalies. Saves the incident record in PostgreSQL.
    """
    try:
        # Build features dict from details
        features = {}
        features.update(request.transaction_details)
        features.update(request.login_details)
        
        # Populate explicit model keys
        features["transaction_amount"] = float(
            request.transaction_details.get("amount") or 
            request.transaction_details.get("transaction_amount") or 
            0.0
        )
        features["failed_login_count"] = int(request.login_details.get("failed_login_count") or 0)
        features["vpn_detected"] = int(request.login_details.get("vpn_detected") or 0)
        features["network_attack_detected"] = int(request.login_details.get("network_attack_detected") or 0)
        features["is_new_device"] = int(request.login_details.get("is_new_device") or 0)
        
        prediction_result = {
            "risk_score": request.risk_score,
            "fraud_probability": request.fraud_probability,
            "anomaly_score": request.behaviour_score,
            "output_label": "Critical" if request.risk_score >= 75.0 else ("High" if request.risk_score >= 50.0 else "Medium")
        }
        
        report = await LLMService.explain_threat(
            db=db,
            prediction_result=prediction_result,
            features=features
        )
        return report
    except Exception as e:
        logger.error(f"Report generation failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"LLM explanation generation failed: {str(e)}"
        )

@router.get("/dashboard")
async def get_dashboard_counts(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieves system aggregated metrics (counts of alerts, frauds, and anomalies)
    to render graphical dashboard indices.
    """
    try:
        # Fetch predictions count
        pred_result = await db.execute(select(MlPrediction))
        predictions = pred_result.scalars().all()
        
        counts = {"Low": 0, "Medium": 0, "High": 0, "Critical": 0}
        anomalies = 0
        frauds = 0
        
        for pred in predictions:
            lbl = pred.output_label
            if lbl in counts:
                counts[lbl] += 1
            elif "fraud" in lbl.lower():
                counts["Critical"] += 1
                frauds += 1
            elif "anomaly" in lbl.lower():
                counts["Medium"] += 1
                anomalies += 1
                
        return {
            "status": "success",
            "total_incidents_analyzed": len(predictions),
            "severity_distribution": counts,
            "anomalies_detected": anomalies,
            "frauds_detected": frauds,
            "active_threats_blocked": int(counts["Critical"] * 2)
        }
    except Exception as e:
        logger.error(f"Dashboard query failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to query dashboard statistics."
        )

@router.get("/metrics")
async def get_ml_metrics(current_user: User = Depends(get_current_user)):
    """Reads and returns the constant evaluation metrics generated during training."""
    try:
        metrics_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "ml", "metrics.json")
        if not os.path.exists(metrics_path):
            return {"status": "error", "message": "Metrics file not found. Models may not be trained."}
        import json
        with open(metrics_path, "r") as f:
            metrics_data = json.load(f)
        return {"status": "success", "metrics": metrics_data}
    except Exception as e:
        logger.error(f"Failed to load metrics: {e}")
        raise HTTPException(status_code=500, detail="Failed to load model metrics.")

@router.get("/quantum")
async def get_quantum_readiness(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Returns the Quantum Readiness configuration."""
    from app.models.quantum import QuantumConfig
    try:
        result = await db.execute(select(QuantumConfig))
        config = result.scalars().first()
        if not config:
            # Fallback real-time empty state if DB empty
            return {
                "status": "success",
                "overall_readiness": 0,
                "migration_progress": 0,
                "legacy_algorithms": 0,
                "compliance_score": 0,
                "risk_score": 0.0
            }
        return {
            "status": "success",
            "overall_readiness": config.overall_readiness,
            "migration_progress": config.migration_progress,
            "legacy_algorithms": config.legacy_algorithms,
            "compliance_score": config.compliance_score,
            "risk_score": config.risk_score
        }
    except Exception as e:
        logger.error(f"Quantum query failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to query quantum configuration.")

@router.get("/behaviour")
async def get_user_behaviour(
    q: str = "",
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Search behaviour profile by IP, Customer ID, or Account Number.
    """
    try:
        # Search the database for incidents matching the query
        # Since we use Incident table, we can search by user_id or source_ip
        from app.models.incident import Incident
        result = await db.execute(
            select(Incident)
            .where(
                (Incident.source_ip == q) | 
                (Incident.user_id == q) | 
                (Incident.transaction_id == q)
            )
            .order_by(desc(Incident.timestamp))
            .limit(1)
        )
        incident = result.scalars().first()
        
        if not incident:
            return {"status": "error", "message": "No behaviour profile found for this entity."}
            
        return {
            "status": "success",
            "profile": {
                "entity": q,
                "previous_logins": 12, # Simplified for demo, normally aggregated from DB
                "known_devices": 2,
                "known_countries": 1,
                "average_transaction": "$450.00",
                "behaviour_score": incident.behaviour_score,
                "anomaly_score": incident.behaviour_score, # They are the same in IF
                "risk_score": incident.risk_score,
                "recommendation": incident.recommendation
            }
        }
    except Exception as e:
        logger.error(f"Behaviour query failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to query user behaviour.")

@router.get("/analytics")
async def get_analytics_trends(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns timeline analytical stats tracking risk indices over time.
    """
    try:
        result = await db.execute(
            select(MlPrediction)
            .order_by(desc(MlPrediction.timestamp))
            .limit(20)
        )
        predictions = result.scalars().all()
        
        trends = []
        for pred in predictions:
            trends.append({
                "timestamp": pred.timestamp,
                "model": pred.model_name,
                "label": pred.output_label,
                "confidence_score": round(pred.confidence * 100, 2)
            })
            
        return {
            "status": "success",
            "time_series_predictions": trends
        }
    except Exception as e:
        logger.error(f"Analytics query failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to query analytics trends."
        )

@router.get("/incidents")
async def get_incidents_list(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Queries historical LLM threat assessment logs saved inside PostgreSQL.
    """
    try:
        result = await db.execute(
            select(Incident)
            .order_by(desc(Incident.timestamp))
            .limit(50)
        )
        incidents = result.scalars().all()
        
        return {
            "status": "success",
            "incidents_count": len(incidents),
            "incidents": [
                {
                    "id": inc.id,
                    "incident_id": inc.incident_id,
                    "timestamp": inc.timestamp,
                    "user_id": inc.user_id,
                    "transaction_id": inc.transaction_id,
                    "source_ip": inc.source_ip,
                    "destination_ip": inc.destination_ip,
                    "fraud_probability": inc.fraud_probability,
                    "behaviour_score": inc.behaviour_score,
                    "threat_score": inc.threat_score,
                    "risk_score": inc.risk_score,
                    "severity": inc.severity,
                    "recommendation": inc.recommendation,
                    "status": inc.status,
                    "resolved": inc.resolved
                }
                for inc in incidents
            ]
        }
    except Exception as e:
        logger.error(f"Incidents query failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to query incidents list."
        )

@router.get("/models")
async def get_models_metadata(
    current_user: User = Depends(get_current_user)
):
    """
    Returns file metadata, serialized sizes, and features lists of active models.
    """
    models_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "ml")
    iforest_path = os.path.join(models_dir, "isolation_forest.pkl")
    rf_path = os.path.join(models_dir, "random_forest.pkl")
    
    models_info = []
    
    for path, name in [(iforest_path, "Isolation Forest"), (rf_path, "Random Forest")]:
        exists = os.path.exists(path)
        size = os.path.getsize(path) if exists else 0
        modified = datetime.datetime.fromtimestamp(os.path.getmtime(path)).isoformat() if exists else None
        
        models_info.append({
            "model_name": name,
            "file_path": path,
            "exists": exists,
            "file_size_bytes": size,
            "last_modified": modified,
            "status": "active" if exists else "missing"
        })
        
    return {
        "status": "success",
        "models": models_info
    }
