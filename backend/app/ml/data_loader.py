import os
import pandas as pd
from typing import Optional, Generator
from app.utils.logger import logger

class DatasetLoader:
    @staticmethod
    def load_ieee_cis_transaction(filepath: str, nrows: Optional[int] = None) -> pd.DataFrame:
        """
        Loads the IEEE-CIS Fraud Detection transaction dataset.
        Converts TransactionDT (timedelta from base) to standard datetime.
        """
        logger.info(f"Loading IEEE-CIS transaction dataset from: {filepath} (nrows={nrows})")
        df = pd.read_csv(filepath, nrows=nrows)
        if "TransactionDT" in df.columns:
            base_time = pd.to_datetime("2026-07-12 00:00:00")
            df["timestamp"] = base_time + pd.to_timedelta(df["TransactionDT"], unit="s")
        else:
            df["timestamp"] = pd.to_datetime("now", utc=True)
        return df

    @staticmethod
    def load_ieee_cis_identity(filepath: str, nrows: Optional[int] = None) -> pd.DataFrame:
        """Loads the IEEE-CIS Fraud Detection identity dataset."""
        logger.info(f"Loading IEEE-CIS identity dataset from: {filepath} (nrows={nrows})")
        return pd.read_csv(filepath, nrows=nrows)

    @staticmethod
    def load_cert_device(filepath: str, nrows: Optional[int] = None) -> pd.DataFrame:
        """Loads CERT device activity logs."""
        logger.info(f"Loading CERT device dataset from: {filepath} (nrows={nrows})")
        df = pd.read_csv(filepath, nrows=nrows)
        if "date" in df.columns:
            df["timestamp"] = pd.to_datetime(df["date"])
        return df

    @staticmethod
    def load_cert_email(filepath: str, nrows: Optional[int] = None) -> pd.DataFrame:
        """Loads CERT email logs."""
        logger.info(f"Loading CERT email dataset from: {filepath} (nrows={nrows})")
        df = pd.read_csv(filepath, nrows=nrows)
        if "date" in df.columns:
            df["timestamp"] = pd.to_datetime(df["date"])
        return df

    @staticmethod
    def load_cert_file(filepath: str, nrows: Optional[int] = None) -> pd.DataFrame:
        """Loads CERT file access logs."""
        logger.info(f"Loading CERT file dataset from: {filepath} (nrows={nrows})")
        df = pd.read_csv(filepath, nrows=nrows)
        if "date" in df.columns:
            df["timestamp"] = pd.to_datetime(df["date"])
        return df

    @staticmethod
    def load_cert_logon(filepath: str, nrows: Optional[int] = None) -> pd.DataFrame:
        """Loads CERT logon/logoff logs."""
        logger.info(f"Loading CERT logon dataset from: {filepath} (nrows={nrows})")
        df = pd.read_csv(filepath, nrows=nrows)
        if "date" in df.columns:
            df["timestamp"] = pd.to_datetime(df["date"])
        return df

    @staticmethod
    def load_cert_psychometric(filepath: str, nrows: Optional[int] = None) -> pd.DataFrame:
        """Loads CERT employee psychometric attributes."""
        logger.info(f"Loading CERT psychometric dataset from: {filepath} (nrows={nrows})")
        return pd.read_csv(filepath, nrows=nrows)

    @staticmethod
    def load_cert_insiders(filepath: str) -> pd.DataFrame:
        """Loads CERT known insiders answers key."""
        logger.info(f"Loading CERT insider answers key from: {filepath}")
        return pd.read_csv(filepath)

    @staticmethod
    def load_cert_http_chunked(filepath: str, chunksize: int = 50000) -> Generator[pd.DataFrame, None, None]:
        """Loads extremely large CERT HTTP logs in chunks to prevent memory crash."""
        logger.info(f"Initializing chunked loader for CERT HTTP dataset: {filepath} (chunksize={chunksize})")
        for chunk in pd.read_csv(filepath, chunksize=chunksize):
            if "date" in chunk.columns:
                chunk["timestamp"] = pd.to_datetime(chunk["date"])
            yield chunk

    @staticmethod
    def load_cicids2017_file(filepath: str, nrows: Optional[int] = None) -> pd.DataFrame:
        """Loads a CICIDS2017 network traffic pcap CSV file."""
        logger.info(f"Loading CICIDS2017 network flow dataset from: {filepath} (nrows={nrows})")
        df = pd.read_csv(filepath, nrows=nrows)
        # Strip whitespace from column headers
        df.columns = df.columns.str.strip()
        if "Timestamp" in df.columns:
            df["timestamp"] = pd.to_datetime(df["Timestamp"], format="%d/%m/%Y %H:%M", errors="coerce")
            # Fallback for alternative formats
            if df["timestamp"].isna().any():
                df.loc[df["timestamp"].isna(), "timestamp"] = pd.to_datetime(
                    df.loc[df["timestamp"].isna(), "Timestamp"], errors="coerce"
                )
        else:
            # Fallback to current timestamp
            df["timestamp"] = pd.to_datetime("now", utc=True)
        return df

    @staticmethod
    def load_login_rba_chunked(filepath: str, chunksize: int = 100000) -> Generator[pd.DataFrame, None, None]:
        """Loads extremely large Login Risk-Based Authentication dataset in chunks."""
        logger.info(f"Initializing chunked loader for Login RBA dataset: {filepath} (chunksize={chunksize})")
        for chunk in pd.read_csv(filepath, chunksize=chunksize):
            if "Login Timestamp" in chunk.columns:
                chunk["timestamp"] = pd.to_datetime(chunk["Login Timestamp"])
            yield chunk

    @staticmethod
    def load_login_rba_sample(filepath: str, nrows: int = 100000) -> pd.DataFrame:
        """Loads a manageable sample from the Login Risk-Based Authentication dataset."""
        logger.info(f"Loading sample from Login RBA dataset: {filepath} (nrows={nrows})")
        df = pd.read_csv(filepath, nrows=nrows)
        if "Login Timestamp" in df.columns:
            df["timestamp"] = pd.to_datetime(df["Login Timestamp"])
        return df
