import pandas as pd
import numpy as np
from typing import Dict, Any, List
from app.ml.model_loader import ModelLoader
from app.utils.logger import logger

class ModelPredictor:
    """
    Inference client to execute live anomaly detection and fraud classifications
    using saved scikit-learn models. Uses pandas DataFrames to maintain feature names
    and suppress serialization shape warnings.
    """

    def __init__(self):
        pass

    def predict_anomaly(self, input_features: Dict[str, Any]) -> Dict[str, Any]:
        """
        Executes Isolation Forest anomaly scoring on behavioral features.
        """
        iforest = ModelLoader.get_model("isolation_forest")
        if not iforest:
            return {"anomaly_score": 50.0, "is_anomaly": False, "status": "model_unavailable"}

        # Align with exact training column feature names
        features = pd.DataFrame([{
            "failed_login_count": float(input_features.get("failed_login_count", 0)),
            "multiple_failed_login": float(input_features.get("multiple_failed_login", 0)),
            "login_failed": float(input_features.get("login_failed", 0)),
            "abnormal_login_time": float(input_features.get("abnormal_login_time", 0)),
            "is_new_device": float(input_features.get("is_new_device", 0)),
            "device_changed": float(input_features.get("device_changed", 0)),
            "browser_changed": float(input_features.get("browser_changed", 0)),
            "country_changed": float(input_features.get("country_changed", 0)),
            "vpn_detected": float(input_features.get("vpn_detected", 0)),
            "transaction_velocity": float(input_features.get("transaction_velocity", 0)),
            "working_hour": float(input_features.get("working_hour", 1)),
            "weekend_login": float(input_features.get("weekend_login", 0))
        }])

        try:
            # Isolation Forest decision_function outputs negative values for anomalies
            raw_score = iforest.decision_function(features)[0]
            # Convert decision boundary to a 0-100% anomaly score
            anomaly_score = (0.5 - raw_score) * 100.0
            anomaly_score = float(np.clip(anomaly_score, 0.0, 100.0))

            # -1 represents an anomaly prediction
            prediction = iforest.predict(features)[0]
            is_anomaly = bool(prediction == -1)

            return {
                "anomaly_score": round(anomaly_score, 2),
                "is_anomaly": is_anomaly,
                "status": "success"
            }
        except Exception as e:
            logger.error(f"Error predicting anomaly: {e}")
            return {"anomaly_score": 50.0, "is_anomaly": False, "status": f"prediction_error: {str(e)}"}

    def predict_fraud(self, input_features: Dict[str, Any]) -> Dict[str, Any]:
        """
        Executes Random Forest binary classification for payment transaction fraud.
        """
        rf_clf = ModelLoader.get_model("random_forest")
        if not rf_clf:
            return {"fraud_probability": 0.0, "is_fraud": False, "status": "model_unavailable"}

        # Align with exact training column feature names
        features = pd.DataFrame([{
            "transaction_amount": float(input_features.get("transaction_amount", 0.0)),
            "transaction_deviation": float(input_features.get("transaction_deviation", 0.0)),
            "device_changed": float(input_features.get("device_changed", 0)),
            "is_new_device": float(input_features.get("is_new_device", 0)),
            "browser_changed": float(input_features.get("browser_changed", 0)),
            "country_changed": float(input_features.get("country_changed", 0)),
            "failed_login_count": float(input_features.get("failed_login_count", 0)),
            "Login Successful": float(input_features.get("Login Successful", 1)),
            "login_failed": float(input_features.get("login_failed", 0)),
            "usb_activity_score": float(input_features.get("usb_activity_score", 0.0)),
            "email_activity_score": float(input_features.get("email_activity_score", 0.0)),
            "file_access_score": float(input_features.get("file_access_score", 0.0)),
            "network_attack_detected": float(input_features.get("network_attack_detected", 0)),
            "ip_reputation": float(input_features.get("ip_reputation", 95.0))
        }])

        try:
            prob = rf_clf.predict_proba(features)[0, 1]
            pred = rf_clf.predict(features)[0]
            is_fraud = bool(pred == 1)

            return {
                "fraud_probability": round(float(prob) * 100.0, 2),
                "is_fraud": is_fraud,
                "status": "success"
            }
        except Exception as e:
            logger.error(f"Error predicting fraud: {e}")
            return {"fraud_probability": 0.0, "is_fraud": False, "status": f"prediction_error: {str(e)}"}

# Global singleton predictor client
predictor = ModelPredictor()
