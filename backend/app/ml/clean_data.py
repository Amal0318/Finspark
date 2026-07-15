import numpy as np
import pandas as pd
from app.utils.logger import logger


class DatasetCleaner:
    @staticmethod
    def clean_ieee_cis(df: pd.DataFrame) -> pd.DataFrame:
        """
        Cleans the IEEE-CIS dataset.
        Imputes missing transaction variables and addresses.
        """
        logger.info("Cleaning IEEE-CIS dataset...")
        df_clean = df.copy()
        
        # Handle numeric missing values
        num_cols = df_clean.select_dtypes(include=[np.number]).columns
        for col in num_cols:
            if df_clean[col].isnull().any():
                median_val = df_clean[col].median()
                df_clean[col] = df_clean[col].fillna(median_val)
                
        # Handle categorical missing values
        cat_cols = df_clean.select_dtypes(exclude=[np.number]).columns
        for col in cat_cols:
            if df_clean[col].isnull().any():
                df_clean[col] = df_clean[col].fillna("UNKNOWN")
                
        return df_clean

    @staticmethod
    def clean_cert_insider(df: pd.DataFrame) -> pd.DataFrame:
        """
        Cleans the CERT Insider Threat dataset.
        Ensures consistent activity casings and fills nulls.
        """
        logger.info("Cleaning CERT Insider Threat dataset...")
        df_clean = df.copy()
        
        # Standardize strings
        if "activity" in df_clean.columns:
            df_clean["activity"] = df_clean["activity"].str.strip().str.upper()
            
        # Fill missing
        df_clean = df_clean.fillna("UNKNOWN")
        return df_clean

    @staticmethod
    def clean_cicids2017(df: pd.DataFrame) -> pd.DataFrame:
        """
        Cleans the CICIDS2017 Netflow dataset.
        CRITICAL: Strips whitespaces from column names.
        Replaces inf/-inf values with NaN, and imputes them.
        """
        logger.info("Cleaning CICIDS2017 dataset...")
        df_clean = df.copy()
        
        # 1. Clean column names (remove leading/trailing spaces)
        df_clean.columns = df_clean.columns.str.strip()
        
        # 2. Handle inf values
        # In CICIDS2017, 'Flow Bytes/s' and 'Flow Packets/s' often contain infinity
        df_clean = df_clean.replace([np.inf, -np.inf], np.nan)
        
        # 3. Impute numeric missing / inf-replaced values
        num_cols = df_clean.select_dtypes(include=[np.number]).columns
        for col in num_cols:
            if df_clean[col].isnull().any():
                median_val = df_clean[col].median()
                df_clean[col] = df_clean[col].fillna(median_val if not pd.isna(median_val) else 0.0)
                
        # 4. Fill categorical (Label)
        if "Label" in df_clean.columns:
            df_clean["Label"] = df_clean["Label"].str.strip().str.upper().fillna("BENIGN")
            
        return df_clean

    @staticmethod
    def clean_auth_logs(df: pd.DataFrame) -> pd.DataFrame:
        """
        Cleans the Authentication Logs dataset.
        Fills missing user agents and parses usernames to lower case.
        """
        logger.info("Cleaning Authentication Logs dataset...")
        df_clean = df.copy()
        
        if "Username" in df_clean.columns:
            df_clean["Username"] = df_clean["Username"].str.strip().str.lower()
            
        if "Status" in df_clean.columns:
            df_clean["Status"] = df_clean["Status"].str.strip().str.upper()
            
        df_clean = df_clean.fillna("UNKNOWN")
        return df_clean
