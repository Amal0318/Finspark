import pandas as pd
import numpy as np
from typing import Dict, Any, List


class TelemetryPreprocessor:
    def __init__(self):
        # severity numerical encoder
        self.severity_map = {
            "LOW": 0.0,
            "MEDIUM": 1.0,
            "HIGH": 2.0,
            "CRITICAL": 3.0
        }
        
    def encode_severity(self, severity_str: str) -> float:
        return self.severity_map.get(severity_str.upper(), 0.0)

    def extract_features(
        self, 
        transaction: Dict[str, Any], 
        concurrent_logs: List[Dict[str, Any]]
    ) -> np.ndarray:
        """
        Ingests a banking transaction and a list of concurrent security logs to produce
        a structured feature vector.
        
        Features:
        1. amount (float)
        2. hour of day (0-23)
        3. number of concurrent security logs
        4. max severity of concurrent logs (0-3)
        5. failed logins flag (0 or 1)
        """
        # 1. Amount
        amount = float(transaction.get("amount", 0.0))
        
        # 2. Hour of day
        timestamp = transaction.get("timestamp")
        if isinstance(timestamp, str):
            try:
                dt = pd.to_datetime(timestamp)
                hour = float(dt.hour)
            except Exception:
                hour = 12.0 # Default
        elif hasattr(timestamp, "hour"):
            hour = float(timestamp.hour)
        else:
            hour = 12.0

        # 3. Concurrent logs count
        logs_count = float(len(concurrent_logs))
        
        # 4. Max severity and 5. Failed login check
        max_severity = 0.0
        has_failed_login = 0.0
        
        for log in concurrent_logs:
            sev_val = self.encode_severity(log.get("severity", "LOW"))
            if sev_val > max_severity:
                max_severity = sev_val
            
            event_type = str(log.get("event_type", "")).lower()
            if "login_failed" in event_type or "unauthorized" in event_type:
                has_failed_login = 1.0

        # Build feature vector [amount, hour, logs_count, max_severity, has_failed_login]
        features = np.array([amount, hour, logs_count, max_severity, has_failed_login], dtype=np.float32)
        return features.reshape(1, -1)
        
    def batch_extract_features(
        self, 
        correlations: List[Dict[str, Any]]
    ) -> np.ndarray:
        """
        Extracts features from multiple correlated records.
        """
        features_list = []
        for record in correlations:
            tx = record.get("transaction", {})
            logs = record.get("logs", [])
            vec = self.extract_features(tx, logs)
            features_list.append(vec.flatten())
            
        if not features_list:
            return np.empty((0, 5), dtype=np.float32)
            
        return np.array(features_list, dtype=np.float32)
