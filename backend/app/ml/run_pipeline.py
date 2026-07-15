import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

import pandas as pd
from app.ml.data_loader import DatasetLoader
from app.ml.clean_data import DatasetCleaner
from app.ml.merge_dataset import DatasetMerger
from app.ml.preprocessing import DatasetPreprocessor


def execute_pipeline():
    # Setup paths
    base_dir = os.path.dirname(__file__)
    samples_dir = os.path.join(base_dir, "samples")
    
    ieee_path = os.path.join(samples_dir, "ieee_cis_sample.csv")
    cert_path = os.path.join(samples_dir, "cert_insider_sample.csv")
    cicids_path = os.path.join(samples_dir, "cicids2017_sample.csv")
    auth_path = os.path.join(samples_dir, "auth_logs_sample.csv")
    
    print("--- STEP 1: LOADING DATASETS ---")
    df_ieee = DatasetLoader.load_ieee_cis(ieee_path)
    df_cert = DatasetLoader.load_cert_insider(cert_path)
    df_cicids = DatasetLoader.load_cicids2017(cicids_path)
    df_auth = DatasetLoader.load_auth_logs(auth_path)
    
    print("\n--- STEP 2: CLEANING DATASETS ---")
    df_ieee_clean = DatasetCleaner.clean_ieee_cis(df_ieee)
    df_cert_clean = DatasetCleaner.clean_cert_insider(df_cert)
    df_cicids_clean = DatasetCleaner.clean_cicids2017(df_cicids)
    df_auth_clean = DatasetCleaner.clean_auth_logs(df_auth)
    
    print("\n--- STEP 3: TEMPORAL MERGING ---")
    df_merged = DatasetMerger.correlate_datasets(
        df_ieee_clean,
        df_cert_clean,
        df_cicids_clean,
        df_auth_clean
    )
    
    print("\n--- STEP 4: PREPROCESSING & SCALING ---")
    preprocessor = DatasetPreprocessor()
    df_final, explanations = preprocessor.fit_transform_features(df_merged)
    
    # Save the output
    output_path = os.path.join(samples_dir, "unified_correlated_dataset.csv")
    df_final.to_csv(output_path, index=False)
    
    print(f"\nPipeline execution successful! Saved output to: {output_path}")
    print("\n--- PIPELINE STEP EXPLANATIONS ---")
    for step, desc in explanations.items():
        print(f"* {step.upper()}: {desc}")
        
    print("\n--- UNIFIED DATAFRAME SUMMARY ---")
    print(f"Features DataFrame Shape: {df_final.shape}")
    print(f"Columns: {df_final.columns.tolist()[:10]} ... [and {len(df_final.columns) - 10} more]")
    print(f"Any remaining missing values? {df_final.isnull().any().any()}")


if __name__ == "__main__":
    execute_pipeline()
