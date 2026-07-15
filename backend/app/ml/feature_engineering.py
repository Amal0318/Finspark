import os
import pandas as pd
import numpy as np
from typing import Dict, Any, Optional
from app.utils.logger import logger

class FeatureEngineer:
    """
    Applies data science and cybersecurity domain logic to engineer predictive features
    for fraud detection, insider threat detection, and risk-based authentication.
    """

    @staticmethod
    def engineer_auth_features(df_rba: pd.DataFrame) -> pd.DataFrame:
        """
        Engineers authentication, geo, time, and device-change features
        from the Login Risk-Based Authentication dataset.
        """
        logger.info("Engineering Authentication & Login features from RBA dataset...")
        df = df_rba.copy()

        # Ensure timestamp is parsed and sorted
        df["timestamp"] = pd.to_datetime(df["timestamp"])
        df = df.sort_values(by=["user_id", "timestamp"])

        # Time-based features
        df["hour"] = df["timestamp"].dt.hour
        df["working_hour"] = df["hour"].between(9, 17).astype(int)
        df["weekend_login"] = df["timestamp"].dt.dayofweek.isin([5, 6]).astype(int)
        df["abnormal_login_time"] = df["hour"].between(22, 23) | df["hour"].between(0, 5)
        df["abnormal_login_time"] = df["abnormal_login_time"].astype(int)

        # Device changes (compare with previous row per user)
        df["prev_device"] = df.groupby("user_id")["device"].shift(1)
        df["device_changed"] = (df["device"] != df["prev_device"]) & (df["prev_device"].notnull())
        df["device_changed"] = df["device_changed"].astype(int)

        # Country changes (compare with previous row per user)
        df["prev_country"] = df.groupby("user_id")["Country"].shift(1)
        df["country_changed"] = (df["Country"] != df["prev_country"]) & (df["prev_country"].notnull())
        df["country_changed"] = df["country_changed"].astype(int)

        # Browser changes (extract browser name and version comparison)
        browser_col = "Browser Name and Version" if "Browser Name and Version" in df.columns else "device"
        df["prev_browser"] = df.groupby("user_id")[browser_col].shift(1)
        df["browser_changed"] = (df[browser_col] != df["prev_browser"]) & (df["prev_browser"].notnull())
        df["browser_changed"] = df["browser_changed"].astype(int)

        # New device detection (track set of seen devices per user)
        # Using cumulative unique count via duplicated tracking
        df["cum_device_count"] = df.groupby("user_id")["device"].transform(lambda x: (~x.duplicated()).cumsum())
        df["is_new_device"] = (df["cum_device_count"] > 1) & (df["cum_device_count"] != df.groupby("user_id")["cum_device_count"].shift(1))
        df["is_new_device"] = df["is_new_device"].fillna(False).astype(int)

        # VPN Detection heuristic (checks if country shifts or round-trip time is abnormally high)
        rtt_col = "Round-Trip Time [ms]" if "Round-Trip Time [ms]" in df.columns else None
        if rtt_col and rtt_col in df.columns:
            # High round-trip time combined with a country shift suggests a VPN usage
            df["vpn_detected"] = ((df["country_changed"] == 1) & (df[rtt_col] > 350.0)).astype(int)
        else:
            df["vpn_detected"] = (df["country_changed"] == 1).astype(int)

        # Login Success / Failures
        success_col = "Login Successful" if "Login Successful" in df.columns else None
        if success_col and success_col in df.columns:
            df["login_failed"] = (df[success_col] == False).astype(int)
            # Rolling window sum of failed logins in last 10 minutes
            df = df.set_index("timestamp")
            df["failed_login_count"] = df.groupby("user_id")["login_failed"].rolling("10Min").sum().reset_index(level=0, drop=True)
            df = df.reset_index()
            df["multiple_failed_login"] = (df["failed_login_count"] >= 3).astype(int)
        else:
            df["failed_login_count"] = 0
            df["multiple_failed_login"] = 0

        # Clean intermediate fields
        drop_cols = ["prev_device", "prev_country", "prev_browser", "cum_device_count"]
        df = df.drop(columns=[c for c in drop_cols if c in df.columns])

        return df

    @staticmethod
    def engineer_transaction_features(df_tx: pd.DataFrame) -> pd.DataFrame:
        """
        Engineers transaction velocity, transaction value thresholds,
        and statistical deviations for user account transactions.
        """
        logger.info("Engineering Transaction Deviation & Velocity features...")
        df = df_tx.copy()

        df["timestamp"] = pd.to_datetime(df["timestamp"])
        df = df.sort_values(by=["user_id", "timestamp"])

        # High-value transaction flag (arbitrary threshold of $5000)
        df["high_value_transaction"] = (df["transaction_amount"] > 5000.0).astype(int)

        # Rolling transaction velocity in the last hour
        df = df.set_index("timestamp")
        df["transaction_velocity"] = df.groupby("user_id")["transaction_amount"].rolling("1H").count().reset_index(level=0, drop=True)
        
        # User historical average transaction amount
        df["average_transaction"] = df.groupby("user_id")["transaction_amount"].expanding().mean().reset_index(level=0, drop=True)
        df = df.reset_index()

        # Deviation from average transaction amount
        df["transaction_deviation"] = np.abs(df["transaction_amount"] - df["average_transaction"])
        df["transaction_deviation"] = df["transaction_deviation"].fillna(0.0)

        return df

    @staticmethod
    def engineer_cert_activity_features(
        df_logon: pd.DataFrame, 
        df_device: pd.DataFrame, 
        df_email: pd.DataFrame, 
        df_file: pd.DataFrame
    ) -> pd.DataFrame:
        """
        Aggregates insider threat indicators from logon, device (USBs), emails, and file copy logs,
        producing normalized user activity scores.
        """
        logger.info("Aggregating CERT activity metrics and scores...")

        # Count USB connect activities per user
        df_usb = df_device[df_device["activity"].astype(str).str.upper() == "CONNECT"]
        usb_counts = df_usb.groupby("user_id").size().rename("usb_activity_score")

        # Count emails sent with attachments
        df_email["attachments"] = pd.to_numeric(df_email["attachments"], errors="coerce").fillna(0)
        email_scores = df_email.groupby("user_id")["attachments"].sum().rename("email_activity_score")

        # Count file accesses and copies
        file_scores = df_file.groupby("user_id").size().rename("file_access_score")

        # Combine into user behavior scorecard
        scorecard = pd.DataFrame(index=df_logon["user_id"].unique())
        scorecard = scorecard.join(usb_counts, how="left").fillna(0)
        scorecard = scorecard.join(email_scores, how="left").fillna(0)
        scorecard = scorecard.join(file_scores, how="left").fillna(0)

        # Normalize scorecards from 0 to 10
        for col in ["usb_activity_score", "email_activity_score", "file_access_score"]:
            max_val = scorecard[col].max()
            if max_val > 0:
                scorecard[col] = (scorecard[col] / max_val) * 10.0

        return scorecard.reset_index().rename(columns={"index": "user_id"})

    @staticmethod
    def build_unified_dataset(
        df_auth: pd.DataFrame,
        df_tx: pd.DataFrame,
        df_cert_scores: pd.DataFrame,
        df_net: pd.DataFrame
    ) -> pd.DataFrame:
        """
        Integrates multi-modal features (Login RBA, transactions, CERT scores, network anomalies)
        into a unified tabular format aligned by user_id and timestamp.
        """
        logger.info("Merging processed datasets into one unified feature store...")

        # 1. Start with Auth/RBA features
        unified = df_auth.copy()

        # 2. Add Transaction features by nearest timestamp per user
        # Sort values for pd.merge_asof
        unified = unified.sort_values("timestamp")
        df_tx = df_tx.sort_values("timestamp")

        # Join transaction data with nearest login time within 30 minutes
        unified = pd.merge_asof(
            unified,
            df_tx[["timestamp", "user_id", "transaction_amount", "transaction_velocity", "average_transaction", "transaction_deviation", "high_value_transaction", "fraud"]],
            on="timestamp",
            by="user_id",
            direction="nearest",
            tolerance=pd.Timedelta("30Min")
        )

        # 3. Join CERT insider behavior scorecards
        unified = pd.merge(unified, df_cert_scores, on="user_id", how="left")

        # 4. Extract IP reputation / network attack flags from netflow/IPS datasets (e.g. CICIDS2017)
        # Compute IP reputation based on whether the IP address appeared in attack lists
        attack_ips = set()
        if "cyber_attack" in df_net.columns and "source_ip" in df_net.columns:
            attack_records = df_net[df_net["cyber_attack"] != "BENIGN"]
            attack_ips = set(attack_records["source_ip"].dropna().unique())

        if "source_ip" in unified.columns:
            unified["ip_reputation"] = unified["source_ip"].apply(lambda ip: 15.0 if ip in attack_ips else 95.0)
            unified["network_attack_detected"] = unified["source_ip"].apply(lambda ip: 1 if ip in attack_ips else 0)
        else:
            unified["ip_reputation"] = 90.0
            unified["network_attack_detected"] = 0

        # Fill missing values created from joins
        fill_zeros = [
            "transaction_amount", "transaction_velocity", "average_transaction", 
            "transaction_deviation", "high_value_transaction",
            "usb_activity_score", "email_activity_score", "file_access_score", "fraud"
        ]
        unified[fill_zeros] = unified[fill_zeros].fillna(0.0)

        # 5. Composite Risk Indicator (dynamic threshold weight)
        # Calculates a composite score (0-100) reflecting active indicators
        weights = {
            "device_changed": 10.0,
            "vpn_detected": 15.0,
            "multiple_failed_login": 20.0,
            "abnormal_login_time": 10.0,
            "high_value_transaction": 15.0,
            "network_attack_detected": 30.0,
            "usb_activity_score": 1.0,
            "file_access_score": 1.0
        }

        unified["risk_indicator"] = 0.0
        for col, weight in weights.items():
            if col in unified.columns:
                unified["risk_indicator"] += unified[col] * weight

        # Cap risk score at 100%
        unified["risk_indicator"] = np.clip(unified["risk_indicator"], 0.0, 100.0)

        return unified
