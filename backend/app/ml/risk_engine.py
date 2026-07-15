from typing import Dict, Any
from app.ml.predict import predictor
from app.utils.logger import logger

class RiskScoreEngine:
    """
    Consolidated Risk Assessment Engine. Calculates a final unified risk score
    by weighing Random Forest fraud probabilities, Isolation Forest anomalies,
    cyber-reputation threat levels, and compliance business rules.
    """

    @classmethod
    def calculate_cyber_threat_score(cls, features: Dict[str, Any]) -> float:
        """
        Determines cyber risk (0-100) based on active network attack detections
        and source IP reputation scores.
        """
        # If an active network attack (DDoS, Scan, etc.) is flagged, risk is maxed
        if int(features.get("network_attack_detected", 0)) == 1:
            return 100.0
            
        # Otherwise, scale cyber threat risk inversely with IP reputation (0 to 100 rating)
        ip_rep = float(features.get("ip_reputation", 95.0))
        cyber_score = 100.0 - ip_rep
        return float(max(0.0, min(100.0, cyber_score)))

    @classmethod
    def calculate_business_rules_score(cls, features: Dict[str, Any]) -> float:
        """
        Evaluates deterministic compliance/business risk metrics.
        """
        business_score = 0.0
        
        # 1. Multiple login failures (Weight: 45)
        if int(features.get("multiple_failed_login", 0)) == 1:
            business_score += 45.0
            
        # 2. Out-of-hours anomaly (Weight: 20)
        if int(features.get("abnormal_login_time", 0)) == 1:
            business_score += 20.0
            
        # 3. Geo displacement / Country change (Weight: 25)
        if int(features.get("country_changed", 0)) == 1:
            business_score += 25.0
            
        # 4. Unknown endpoint / first-time device (Weight: 20)
        if int(features.get("is_new_device", 0)) == 1:
            business_score += 20.0
            
        # 5. Active browser switch (Weight: 10)
        if int(features.get("browser_changed", 0)) == 1:
            business_score += 10.0

        return float(max(0.0, min(100.0, business_score)))

    @classmethod
    def assess_risk(cls, features: Dict[str, Any]) -> Dict[str, Any]:
        """
        Synthesizes the weighted composite risk rating and risk level.
        Formula:
          Risk Score = 40% * Fraud Prob + 30% * Anomaly Score + 20% * Cyber Threat + 10% * Business Rules
        """
        # 1. Run ML models
        anomaly_res = predictor.predict_anomaly(features)
        fraud_res = predictor.predict_fraud(features)

        anomaly_score = float(anomaly_res.get("anomaly_score", 50.0))
        fraud_prob = float(fraud_res.get("fraud_probability", 0.0))

        # 2. Calculate auxiliary threat/compliance scores
        cyber_score = cls.calculate_cyber_threat_score(features)
        business_score = cls.calculate_business_rules_score(features)

        # 3. Calculate weighted composite score (0 to 100%)
        composite_score = (
            (0.40 * fraud_prob) +
            (0.30 * anomaly_score) +
            (0.20 * cyber_score) +
            (0.10 * business_score)
        )
        composite_score = round(float(max(0.0, min(100.0, composite_score))), 2)

        # 4. Classify risk level classification boundaries
        if composite_score < 25.0:
            risk_level = "Low"
        elif composite_score < 50.0:
            risk_level = "Medium"
        elif composite_score < 75.0:
            risk_level = "High"
        else:
            risk_level = "Critical"

        # Severity Overrides (Escalations)
        if int(features.get("network_attack_detected", 0)) == 1 or fraud_res.get("is_fraud", False):
            risk_level = "Critical"
        elif anomaly_res.get("is_anomaly", False) and risk_level == "Low":
            # If behavior anomaly is detected, escalate at least to Medium
            risk_level = "Medium"

        logger.info(f"Risk Score Engine output: {composite_score}% ({risk_level})")

        return {
            "risk_score": composite_score,
            "risk_level": risk_level,
            "is_anomaly": anomaly_res.get("is_anomaly", False),
            "is_fraud": fraud_res.get("is_fraud", False),
            "breakdown": {
                "fraud_probability": fraud_prob,
                "anomaly_score": anomaly_score,
                "cyber_threat_score": cyber_score,
                "business_rules_score": business_score
            }
        }
