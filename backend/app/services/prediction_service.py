import json
import datetime
from typing import Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.prediction import MlPrediction
from app.ml.risk_engine import RiskScoreEngine
from app.services.llm_service import LLMService
from app.utils.logger import logger

class PredictionService:
    @staticmethod
    def extract_inference_features(
        transaction: Dict[str, Any], 
        concurrent_logs: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Extracts and aligns runtime inputs to the exact feature formats
        required by the serialized Isolation Forest and Random Forest models.
        """
        # Parse timestamp
        tx_time_str = transaction.get("timestamp") or datetime.datetime.now().isoformat()
        try:
            tx_time = datetime.datetime.fromisoformat(str(tx_time_str).replace("Z", "+00:00"))
        except Exception:
            tx_time = datetime.datetime.now()

        hour = tx_time.hour
        working_hour = 1 if 9 <= hour <= 17 else 0
        weekend_login = 1 if tx_time.weekday() in [5, 6] else 0
        abnormal_login_time = 1 if hour >= 22 or hour <= 5 else 0

        # Calculate logon counts and failures from concurrent_logs
        failed_logins = 0
        multiple_failed_login = 0
        login_failed = 0
        login_success = 1

        for log in concurrent_logs:
            event = str(log.get("event_type", "")).upper()
            if "LOGIN_FAIL" in event or "AUTH_FAIL" in event:
                failed_logins += 1
                login_failed = 1
                login_success = 0
        
        if failed_logins >= 3:
            multiple_failed_login = 1

        # Insider activity counts
        usb_activity_score = 0.0
        email_activity_score = 0.0
        file_access_score = 0.0
        network_attack_detected = 0
        ip_reputation = 95.0

        for log in concurrent_logs:
            event = str(log.get("event_type", "")).upper()
            severity = str(log.get("severity", "")).upper()
            
            if "USB" in event or "DEVICE_CONNECT" in event:
                usb_activity_score += 1.0
            if "EMAIL" in event or "ATTACHMENT" in event:
                email_activity_score += 1.0
            if "FILE" in event or "EXPORT" in event:
                file_access_score += 1.0
            if severity == "CRITICAL" or "ATTACK" in event or "EXPLOIT" in event:
                network_attack_detected = 1
                ip_reputation = 15.0

        # Caps scores at max normalization ceiling
        usb_activity_score = min(10.0, usb_activity_score)
        email_activity_score = min(10.0, email_activity_score)
        file_access_score = min(10.0, file_access_score)

        # Mapping dict
        mapped = {
            "transaction_amount": float(transaction.get("amount") or transaction.get("transaction_amount") or 0.0),
            "transaction_deviation": float(transaction.get("transaction_deviation") or 0.0),
            "device_changed": int(transaction.get("device_changed") or 0),
            "is_new_device": int(transaction.get("is_new_device") or 0),
            "browser_changed": int(transaction.get("browser_changed") or 0),
            "country_changed": int(transaction.get("country_changed") or 0),
            "vpn_detected": int(transaction.get("vpn_detected") or 0),
            "failed_login_count": failed_logins,
            "multiple_failed_login": multiple_failed_login,
            "login_failed": login_failed,
            "Login Successful": login_success,
            "usb_activity_score": usb_activity_score,
            "email_activity_score": email_activity_score,
            "file_access_score": file_access_score,
            "network_attack_detected": network_attack_detected,
            "ip_reputation": ip_reputation,
            "working_hour": working_hour,
            "weekend_login": weekend_login,
            "abnormal_login_time": abnormal_login_time,
            "transaction_velocity": float(transaction.get("transaction_velocity") or 1.0)
        }
        return mapped

    @classmethod
    async def classify_transaction(
        cls,
        db: AsyncSession, 
        transaction: Dict[str, Any], 
        concurrent_logs: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Executes dual-model inference on transaction profiles:
        1. Isolation Forest for behavioral anomaly scores.
        2. Random Forest for supervised fraud prediction probabilities.
        Logs prediction event context to the database.
        """
        # 1. Feature translation
        features = cls.extract_inference_features(transaction, concurrent_logs)

        # 2. Run Risk Engine Assessment
        risk_res = RiskScoreEngine.assess_risk(features)
        risk_score = risk_res["risk_score"]
        risk_level = risk_res["risk_level"]
        breakdown = risk_res["breakdown"]

        is_anomaly = risk_res["is_anomaly"]
        is_fraud = risk_res["is_fraud"]

        # 3. Call LLM Service for incident narration
        explanation = await LLMService.explain_threat(
            db=db,
            prediction_result={
                "risk_score": risk_score,
                "output_label": risk_level,
                "fraud_probability": breakdown["fraud_probability"],
                "anomaly_score": breakdown["anomaly_score"]
            },
            features=features
        )

        # Log prediction to DB (include explanation in input features json for storage audit)
        features_to_store = features.copy()
        features_to_store["explanation"] = explanation

        prediction_log = MlPrediction(
            model_name="RiskEngine_IForest_RF",
            input_features_json=features_to_store,
            output_label=risk_level,
            confidence=float(risk_score / 100.0)
        )
        db.add(prediction_log)
        await db.commit()
        await db.refresh(prediction_log)

        return {
            "prediction_id": prediction_log.id,
            "output_label": risk_level,
            "risk_score": risk_score,
            "anomaly_score": breakdown["anomaly_score"],
            "is_anomaly": is_anomaly,
            "fraud_probability": breakdown["fraud_probability"],
            "is_fraud": is_fraud,
            "confidence": risk_score,
            "breakdown": breakdown,
            "explanation": explanation,
            "timestamp": prediction_log.timestamp
        }

    @staticmethod
    async def get_history(db: AsyncSession, limit: int = 100) -> List[MlPrediction]:
        from sqlalchemy import desc
        from sqlalchemy.future import select
        
        result = await db.execute(
            select(MlPrediction)
            .order_by(desc(MlPrediction.timestamp))
            .limit(limit)
        )
        return list(result.scalars().all())
