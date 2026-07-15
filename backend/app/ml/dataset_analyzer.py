import pandas as pd
import numpy as np
from typing import Dict, Any, List
from app.utils.logger import logger

class DatasetAnalyzer:
    @staticmethod
    def analyze_dataframe(df: pd.DataFrame, name: str) -> Dict[str, Any]:
        """
        Analyzes a given Pandas DataFrame and returns a dictionary with metadata,
        characteristics, target label suggestions, and unique values.
        """
        logger.info(f"Analyzing dataframe properties for: {name}")
        
        num_rows = len(df)
        num_cols = len(df.columns)
        columns = list(df.columns)
        dtypes = {col: str(dtype) for col, dtype in df.dtypes.items()}
        
        # Missing values
        missing = df.isnull().sum().to_dict()
        missing = {col: int(val) for col, val in missing.items()}
        
        # Duplicates
        duplicates = int(df.duplicated().sum())
        
        # Target label identification
        detected_labels = []
        for col in df.columns:
            col_lower = col.lower().strip()
            if any(label_keyword in col_lower for label_keyword in ["fraud", "attack", "label", "target", "class", "insider"]):
                detected_labels.append(col)
                
        # Unique values for categories
        unique_categorical = {}
        cat_cols = df.select_dtypes(include=['object', 'category']).columns
        for col in cat_cols:
            unique_vals = df[col].dropna().unique()
            # limit output for visual clarity
            unique_categorical[col] = [str(x) for x in unique_vals[:15]]
            
        analysis = {
            "dataset_name": name,
            "num_rows": num_rows,
            "num_cols": num_cols,
            "column_names": columns,
            "data_types": dtypes,
            "missing_values": missing,
            "duplicates": duplicates,
            "detected_labels": detected_labels,
            "unique_categorical_values": unique_categorical
        }
        
        return analysis

    @staticmethod
    def print_report(analysis: Dict[str, Any]) -> None:
        """Prints a human-readable summary report to the terminal/logs."""
        print("=" * 60)
        print(f"DATASET ANALYSIS REPORT: {analysis['dataset_name']}")
        print("=" * 60)
        print(f"Shape: {analysis['num_rows']} rows, {analysis['num_cols']} columns")
        print(f"Duplicate Rows: {analysis['duplicates']}")
        print(f"Detected Labels: {analysis['detected_labels']}")
        print("-" * 60)
        print(f"{'Column Name':<30} | {'Data Type':<12} | {'Missing Values':<12}")
        print("-" * 60)
        for col in analysis['column_names']:
            dtype = analysis['data_types'][col]
            miss = analysis['missing_values'][col]
            print(f"{col:<30} | {dtype:<12} | {miss:<12}")
        print("=" * 60)
