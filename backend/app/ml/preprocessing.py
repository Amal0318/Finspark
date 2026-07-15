import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from typing import Tuple, Dict, Any
from app.utils.logger import logger


class DatasetPreprocessor:
    def __init__(self):
        self.scaler = StandardScaler()
        self.fitted_numeric_cols = []
        
    def fit_transform_features(
        self, 
        df: pd.DataFrame
    ) -> Tuple[pd.DataFrame, Dict[str, Any]]:
        """
        Normalizes the unified merged dataframe:
        1. Numerical Scaling: standardizes numerical values (TransactionAmt, Flow_Duration etc).
        2. Categorical Encoding: performs One-Hot encoding on product, auth status, cert activity, and labels.
        3. Excludes metadata columns (timestamps, IDs, account codes).
        """
        logger.info("Executing final preprocessing steps...")
        df_processed = df.copy()

        # Step 1: Identify metadata columns to exclude from training features
        metadata_cols = [
            "TransactionID", "TransactionDT", "timestamp", "ip_address", 
            "sender_account", "receiver_account", "id", "pc", "FlowID", 
            "Destination_IP", "LogID", "raw_auth_timestamp", "raw_cert_timestamp", 
            "raw_cicids_timestamp", "User_Agent"
        ]
        
        feature_df = df_processed.drop(columns=[col for col in metadata_cols if col in df_processed.columns])
        
        # Step 2: Scale Numerical Columns
        # Extract numerical columns
        numeric_cols = feature_df.select_dtypes(include=[np.number]).columns.tolist()
        self.fitted_numeric_cols = numeric_cols
        
        logger.info(f"Normalizing numerical features (StandardScaler): {numeric_cols}")
        if numeric_cols:
            scaled_vals = self.scaler.fit_transform(feature_df[numeric_cols])
            feature_df[numeric_cols] = scaled_vals

        # Step 3: One-Hot Encode Categorical Columns
        categorical_cols = feature_df.select_dtypes(exclude=[np.number]).columns.tolist()
        logger.info(f"One-Hot encoding categorical columns: {categorical_cols}")
        
        # Apply dummy encoding
        feature_df = pd.get_dummies(feature_df, columns=categorical_cols, drop_first=True)
        
        # Combine processed feature dataframe with timestamp metadata for tracking
        if "timestamp" in df_processed.columns:
            feature_df["timestamp"] = df_processed["timestamp"]
            
        logger.info(f"Preprocessing completed. Shape: {feature_df.shape}")
        
        explanations = {
            "step_1_feature_selection": "Removed identifier attributes and timestamp metadata columns to avoid model overfitting.",
            "step_2_numerical_scaling": f"Applied StandardScaler to numerical fields {numeric_cols} to remove offset bias.",
            "step_3_categorical_encoding": f"Encoded categories {categorical_cols} into binary columns (One-Hot) for ML mathematical compatibility."
        }
        
        return feature_df, explanations
