import os
import pandas as pd
import numpy as np
from typing import Dict, Any
from app.utils.logger import logger
from app.ml.anomaly_detector import AnomalyDetector
from app.ml.preprocessor import TelemetryPreprocessor

class DatasetMerger:
    """
    Correlates multiple independent cyber-telemetry and transaction datasets
    into a unified security event ledger using multi-key temporal joins.
    """

    @staticmethod
    def merge_and_correlate(
        df_auth: pd.DataFrame,
        df_tx: pd.DataFrame,
        df_net: pd.DataFrame,
        df_cert_scores: pd.DataFrame
    ) -> pd.DataFrame:
        """
        Merges datasets using temporal and entity-based joins (User, Timestamp, IP, Device, Country).
        Guarantees final schema maps to user-requested target columns.
        """
        logger.info("Executing multi-dimensional merge strategy...")

        # Copy dataframes to avoid mutating original states
        auth = df_auth.copy().sort_values("timestamp")
        tx = df_tx.copy().sort_values("timestamp")
        net = df_net.copy().sort_values("timestamp")

        # 1. Temporal merge between Transactions (Fraud) and Login (RBA/Authentication)
        # We align transactions to their nearest preceding logon session for that user
        logger.info("Performing Asof join on (timestamp, user_id)...")
        merged = pd.merge_asof(
            tx,
            auth,
            on="timestamp",
            by="user_id",
            direction="backward",
            tolerance=pd.Timedelta("30Min"),
            suffixes=("", "_auth")
        )

        # 2. Correlate with Network attacks (CICIDS2017) based on IP address
        # Aligns transactions to nearest network telemetry log within the active window
        logger.info("Performing Asof join on (timestamp, source_ip) with network flow logs...")
        
        # Ensure we have clean source_ip in both
        if "source_ip" in merged.columns and "source_ip" in net.columns:
            # Drop empty IPs to prevent joining on nulls
            merged_clean = merged.dropna(subset=["source_ip"])
            net_clean = net.dropna(subset=["source_ip"])
            
            merged_net = pd.merge_asof(
                merged_clean,
                net_clean[["timestamp", "source_ip", "cyber_attack"]],
                on="timestamp",
                by="source_ip",
                direction="backward",
                tolerance=pd.Timedelta("15Min")
            )
            # Combine back with unmatched rows
            unmatched = merged[~merged.index.isin(merged_clean.index)]
            merged = pd.concat([merged_net, unmatched]).sort_values("timestamp")
        else:
            merged["cyber_attack"] = "BENIGN"

        # 3. Join with CERT insider scorecards on user_id
        logger.info("Merging user behavior scorecards on user_id...")
        merged = pd.merge(merged, df_cert_scores, on="user_id", how="left")

        # 4. Handle unmatched records (impute logically instead of fabricating data)
        logger.info("Intelligently resolving unmatched join records...")
        
        # If no login match, default status to unsuccessful login context
        if "Login Successful" in merged.columns:
            merged["login_success"] = merged["Login Successful"].fillna(False).astype(int)
        else:
            merged["login_success"] = 0

        # If no RTT/Country changes, vpn is 0
        if "vpn_detected" in merged.columns:
            merged["vpn"] = merged["vpn_detected"].fillna(0).astype(int)
        else:
            merged["vpn"] = 0

        # Roll failed logins
        if "failed_login_count" in merged.columns:
            merged["failed_logins"] = merged["failed_login_count"].fillna(0).astype(int)
        else:
            merged["failed_logins"] = 0

        # Network attack mapping
        if "cyber_attack" in merged.columns:
            # Map network classification to binary: 1 if attack is flagged, 0 if BENIGN
            merged["network_attack"] = merged["cyber_attack"].apply(
                lambda x: 0 if pd.isna(x) or str(x).upper() == "BENIGN" or str(x) == "0" else 1
            )
        else:
            merged["network_attack"] = 0

        # Device fallback
        if "device" not in merged.columns:
            merged["device"] = "UNKNOWN_ENDPOINT"
        else:
            merged["device"] = merged["device"].fillna("UNKNOWN_ENDPOINT")

        # Country fallback
        if "country" not in merged.columns and "Country" in merged.columns:
            merged["country"] = merged["Country"]
        if "country" not in merged.columns:
            merged["country"] = "UNKNOWN"
        else:
            merged["country"] = merged["country"].fillna("UNKNOWN")

        # Fraud label map
        if "fraud" not in merged.columns:
            merged["fraud"] = 0
        else:
            merged["fraud"] = merged["fraud"].fillna(0).astype(int)

        # 5. Compute Anomaly Score using the ML anomaly detector
        logger.info("Generating anomaly scores using the fitted Isolation Forest detector...")
        detector = AnomalyDetector()
        preprocessor = TelemetryPreprocessor()
        
        # Reconstruct standard feature arrays: [amount, hour, logs_count, max_severity, has_failed_login]
        scores = []
        for idx, row in merged.iterrows():
            # Build mini-feature vector
            features = np.array([[
                float(row.get("transaction_amount", 0.0)),
                float(row.get("timestamp", pd.Timestamp.now()).hour),
                float(row.get("network_attack", 0)),
                2.0 if row.get("network_attack") == 1 else 0.0, # severity proxy
                float(row.get("failed_logins", 0))
            ]])
            score = detector.predict_risk_score(features)
            scores.append(score)
            
        merged["anomaly_score"] = scores

        # 6. Assign final risk label
        # Risk label is set to 1 if anomaly score exceeds 70%, or if fraud/network attacks are active
        merged["risk_label"] = (
            (merged["anomaly_score"] > 70.0) | 
            (merged["fraud"] == 1) | 
            (merged["network_attack"] == 1)
        ).astype(int)

        # 7. Select final columns requested by user
        target_columns = [
            "timestamp",
            "user_id",
            "device",
            "country",
            "transaction_amount",
            "fraud",
            "network_attack",
            "login_success",
            "vpn",
            "failed_logins",
            "anomaly_score",
            "risk_label"
        ]
        
        # Filter existing columns
        final_df = merged[[col for col in target_columns if col in merged.columns]]
        
        # If any requested columns are still missing, fill with default placeholders
        for col in target_columns:
            if col not in final_df.columns:
                if col == "transaction_amount":
                    final_df[col] = 0.0
                elif col == "anomaly_score":
                    final_df[col] = 50.0
                else:
                    final_df[col] = 0

        # Rearrange to the exact requested order
        final_df = final_df[target_columns]

        return final_df
