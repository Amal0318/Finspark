import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from typing import Tuple, Dict, Any, List
from app.utils.logger import logger

class DataCleaner:
    """
    Handles preprocessing steps including data cleaning, missing values imputation,
    infinite value removal, label encoding, and feature scaling.
    """
    
    @staticmethod
    def impute_missing_values(df: pd.DataFrame) -> pd.DataFrame:
        """
        Imputes missing values in numerical columns with their median,
        and categorical columns with a placeholder 'UNKNOWN'.
        """
        logger.info("Imputing missing values in dataset...")
        df_clean = df.copy()
        
        # Numeric columns
        num_cols = df_clean.select_dtypes(include=[np.number]).columns
        for col in num_cols:
            if df_clean[col].isnull().any():
                median_val = df_clean[col].median()
                # If median is nan (column is all null), fill with 0.0
                df_clean[col] = df_clean[col].fillna(median_val if not pd.isna(median_val) else 0.0)
                
        # Categorical columns
        cat_cols = df_clean.select_dtypes(exclude=[np.number]).columns
        for col in cat_cols:
            if df_clean[col].isnull().any():
                df_clean[col] = df_clean[col].fillna("UNKNOWN")
                
        return df_clean

    @staticmethod
    def remove_infinite_values(df: pd.DataFrame) -> pd.DataFrame:
        """
        Replaces positive and negative infinities (common in network flow metrics)
        with NaN and imputes them with the median.
        """
        logger.info("Replacing infinite values...")
        df_clean = df.copy()
        df_clean = df_clean.replace([np.inf, -np.inf], np.nan)
        return DataCleaner.impute_missing_values(df_clean)

    @staticmethod
    def encode_categorical(df: pd.DataFrame, columns: List[str]) -> Tuple[pd.DataFrame, Dict[str, OneHotEncoder]]:
        """
        Encodes list of categorical columns using OneHotEncoder.
        Returns the transformed dataframe and fitted encoder instances.
        """
        logger.info(f"One-hot encoding categorical columns: {columns}")
        df_encoded = df.copy()
        encoders = {}
        
        for col in columns:
            if col in df_encoded.columns:
                encoder = OneHotEncoder(sparse_output=False, handle_unknown='ignore')
                encoded_arr = encoder.fit_transform(df_encoded[[col]])
                encoded_cols = [f"{col}_{cat}" for cat in encoder.categories_[0]]
                
                df_temp = pd.DataFrame(encoded_arr, columns=encoded_cols, index=df_encoded.index)
                df_encoded = pd.concat([df_encoded.drop(columns=[col]), df_temp], axis=1)
                encoders[col] = encoder
                
        return df_encoded, encoders

    @staticmethod
    def scale_numerical(df: pd.DataFrame, columns: List[str]) -> Tuple[pd.DataFrame, StandardScaler]:
        """
        Applies StandardScaler to scale numerical attributes to zero mean and unit variance.
        """
        logger.info(f"Scaling numerical columns: {columns}")
        df_scaled = df.copy()
        scaler = StandardScaler()
        
        existing_cols = [col for col in columns if col in df_scaled.columns]
        if existing_cols:
            df_scaled[existing_cols] = scaler.fit_transform(df_scaled[existing_cols])
            
        return df_scaled, scaler
        
    @staticmethod
    def clean_dataset(df: pd.DataFrame, dataset_name: str) -> pd.DataFrame:
        """
        High-level wrapper to run specific dataset-oriented cleaning pipelines.
        """
        logger.info(f"Running custom clean workflow for: {dataset_name}")
        df_clean = df.copy()
        
        # Clean column names first
        df_clean.columns = df_clean.columns.str.strip()
        
        if dataset_name == "CICIDS2017":
            # CICIDS2017 often contains infinities in packet rate flows
            df_clean = DataCleaner.remove_infinite_values(df_clean)
        else:
            df_clean = DataCleaner.impute_missing_values(df_clean)
            
        # Specific conversions
        if "activity" in df_clean.columns:
            df_clean["activity"] = df_clean["activity"].astype(str).str.strip().str.upper()
            
        return df_clean
