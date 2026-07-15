import io
from typing import List, Dict, Any
import pandas as pd
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import UploadFile, HTTPException

from app.models.transaction import BankingTransaction
from app.models.telemetry import TelemetryLog
from app.services.transaction_service import TransactionService
from app.schemas.transaction import BankingTransactionCreate
from app.schemas.telemetry import TelemetryLogCreate
from app.utils.logger import logger


class DatasetService:
    @staticmethod
    async def process_transaction_csv(db: AsyncSession, file: UploadFile) -> Dict[str, Any]:
        """
        Parses a banking transaction CSV file using Pandas, validates fields,
        and saves records using the TransactionService (which triggers correlation).
        """
        contents = await file.read()
        try:
            df = pd.read_csv(io.BytesIO(contents))
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to parse CSV file: {str(e)}")

        # Check required columns
        required_cols = ["sender_account", "receiver_account", "amount", "ip_address"]
        for col in required_cols:
            if col not in df.columns:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Missing required column in transactions CSV: '{col}'"
                )

        success_count = 0
        failed_count = 0

        # Replace NaN values with None/defaults
        df = df.where(pd.notnull(df), None)

        for _, row in df.iterrows():
            try:
                tx_in = BankingTransactionCreate(
                    sender_account=str(row["sender_account"]),
                    receiver_account=str(row["receiver_account"]),
                    amount=float(row["amount"]),
                    currency=str(row.get("currency", "USD")) if row.get("currency") else "USD",
                    transaction_type=str(row.get("transaction_type", "transfer")) if row.get("transaction_type") else "transfer",
                    location=str(row.get("location")) if row.get("location") else None,
                    ip_address=str(row["ip_address"]),
                    device_fingerprint=str(row.get("device_fingerprint")) if row.get("device_fingerprint") else None,
                    status=str(row.get("status", "COMPLETED")) if row.get("status") else "COMPLETED"
                )
                
                # Using service to trigger the ML correlation pipeline
                await TransactionService.create(db, tx_in)
                success_count += 1
            except Exception as e:
                logger.error(f"Failed to parse transaction row: {e}")
                failed_count += 1

        return {
            "file_name": file.filename,
            "records_processed": success_count + failed_count,
            "success_count": success_count,
            "failed_count": failed_count
        }

    @staticmethod
    async def process_telemetry_csv(db: AsyncSession, file: UploadFile) -> Dict[str, Any]:
        """
        Parses a cybersecurity telemetry log CSV file, validates fields,
        and saves logs in the database.
        """
        contents = await file.read()
        try:
            df = pd.read_csv(io.BytesIO(contents))
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to parse CSV file: {str(e)}")

        required_cols = ["device_id", "source_ip", "event_type", "severity"]
        for col in required_cols:
            if col not in df.columns:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Missing required column in telemetry CSV: '{col}'"
                )

        success_count = 0
        failed_count = 0
        df = df.where(pd.notnull(df), None)

        for _, row in df.iterrows():
            try:
                db_obj = TelemetryLog(
                    device_id=str(row["device_id"]),
                    source_ip=str(row["source_ip"]),
                    destination_ip=str(row.get("destination_ip")) if row.get("destination_ip") else None,
                    event_type=str(row["event_type"]),
                    severity=str(row["severity"]).upper(),
                    description=str(row.get("description")) if row.get("description") else None
                )
                db.add(db_obj)
                success_count += 1
            except Exception as e:
                logger.error(f"Failed to parse telemetry row: {e}")
                failed_count += 1

        if success_count > 0:
            await db.commit()

        return {
            "file_name": file.filename,
            "records_processed": success_count + failed_count,
            "success_count": success_count,
            "failed_count": failed_count
        }
