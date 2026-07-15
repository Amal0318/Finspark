import pandas as pd
from typing import Dict, List, Tuple
from app.utils.logger import logger

class FeatureSelector:
    """
    Modular selector that maintains clean, declarative definitions of feature categories,
    mappings, and selection policies across datasets.
    """
    
    # Feature classifications map
    FEATURE_GROUPS = {
        "IEEE-CIS": {
            "transaction_features": ["TransactionAmt", "ProductCD", "TransactionID"],
            "network_features": ["card1", "card2", "card3", "card4", "card5", "card6", "addr1", "addr2"],
            "fraud_labels": ["isFraud"],
            "remove_features": ["dist1", "dist2", "P_emaildomain", "R_emaildomain"] # and V columns
        },
        "CERT": {
            "authentication_features": ["activity"],  # in logon.csv
            "user_features": ["user"],
            "device_features": ["pc"],
            "behaviour_features": ["size", "attachments", "filename", "url", "content"],
            "remove_features": ["id"]
        },
        "CICIDS2017": {
            "network_features": [
                "Destination Port", "Flow Duration", "Total Fwd Packets", "Total Backward Packets",
                "Total Length of Fwd Packets", "Fwd Packet Length Max", "Flow Bytes/s", "Flow Packets/s"
            ],
            "attack_labels": ["Label"]
        },
        "LoginRBA": {
            "authentication_features": ["Login Successful"],
            "user_features": ["User ID"],
            "network_features": ["IP Address", "Country", "Region", "City", "ASN"],
            "device_features": ["User Agent String", "Browser Name and Version", "OS Name and Version", "Device Type"],
            "behaviour_features": ["Round-Trip Time [ms]", "Is Behavior Anomaly"],
            "attack_labels": ["Is Attack IP"]
        }
    }

    # Renaming registry
    RENAME_REGISTRY = {
        "TransactionAmt": "transaction_amount",
        "isFraud": "fraud",
        "card1": "card_type_hash",
        "addr1": "billing_region",
        "IP Address": "source_ip",
        "Label": "cyber_attack",
        "Is Attack IP": "cyber_attack",
        "User ID": "user_id",
        "user": "user_id",
        "User Agent String": "device",
        "Destination Port": "destination_port",
        "Flow Duration": "flow_duration",
        "Total Fwd Packets": "total_fwd_packets"
    }

    @classmethod
    def get_features_to_keep(cls, dataset_name: str) -> List[str]:
        """Returns lists of columns to keep based on the dataset classification rules."""
        groups = cls.FEATURE_GROUPS.get(dataset_name, {})
        keep = []
        for grp, cols in groups.items():
            if grp != "remove_features":
                keep.extend(cols)
        # Always preserve timestamp column if present
        keep.append("timestamp")
        return keep

    @classmethod
    def get_renamed_columns(cls, df: pd.DataFrame) -> Dict[str, str]:
        """Gets matching renaming dictionary for active columns present in the dataframe."""
        rename_dict = {}
        for col in df.columns:
            cleaned_col = col.strip()
            if cleaned_col in cls.RENAME_REGISTRY:
                rename_dict[col] = cls.RENAME_REGISTRY[cleaned_col]
        return rename_dict

    @classmethod
    def select_features(cls, df: pd.DataFrame, dataset_name: str) -> pd.DataFrame:
        """
        Processes a dataframe by selecting columns to keep, trimming whitespace from
        column headers, and renaming matching columns.
        """
        logger.info(f"Filtering and renaming features for dataset: {dataset_name}")
        df_selected = df.copy()
        
        # Clean column names (strip spaces)
        df_selected.columns = df_selected.columns.str.strip()
        
        # Determine columns to keep
        keep_cols = cls.get_features_to_keep(dataset_name)
        if keep_cols:
            # Only keep columns that are actually present in the dataframe
            existing_keep = [col for col in keep_cols if col in df_selected.columns]
            df_selected = df_selected[existing_keep]
            
        # Apply renaming
        rename_map = cls.get_renamed_columns(df_selected)
        df_selected = df_selected.rename(columns=rename_map)
        
        return df_selected
