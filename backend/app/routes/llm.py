from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import Dict, Any, List

from app.core.database import get_db
from app.controllers.llm_controller import LLMController
from app.services.llm_service import LLMService
from app.middleware.auth import RoleChecker, get_current_user
from app.models.user import User

router = APIRouter(prefix="/llm")

# Restrict threat narratives to analysts and admins
analyst_only = RoleChecker(allowed_roles=["admin", "investigator"])

class GenerateReportRequest(BaseModel):
    risk_score: float
    fraud_probability: float
    behaviour_score: float
    cyber_threat_score: float
    transaction_details: Dict[str, Any]
    login_details: Dict[str, Any]

@router.get("/narrate/{alert_id}")
async def explain_incident_correlation(
    alert_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Simulates a security LLM brief generation that synthesizes banking log histories
    and concurrent cyber flags into a human-readable mitigation outline.
    """
    return await LLMController.explain_correlation(db, alert_id)

@router.post("/generate-report")
async def generate_threat_report(
    request: GenerateReportRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(analyst_only)
):
    """
    Generates a structured threat assessment using Gemini (or heuristics fallback)
    integrating transaction details, logins, network indicators, and anomalous events.
    Persists the incident record in the PostgreSQL database.
    """
    try:
        # Build features mapping expected by the explainer service
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
        
        # Build prediction dict
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
        raise HTTPException(status_code=500, detail=f"LLM explanation generation failed: {str(e)}")
