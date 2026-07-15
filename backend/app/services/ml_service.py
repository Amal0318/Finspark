from typing import Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.ml.preprocessor import TelemetryPreprocessor
from app.ml.anomaly_detector import AnomalyDetector
from app.models.transaction import BankingTransaction
from app.services.telemetry_service import TelemetryService
from app.utils.logger import logger

# Instantiate shared model instances
preprocessor = TelemetryPreprocessor()
detector = AnomalyDetector()


class MLService:
    @staticmethod
    def evaluate_transaction_risk(
        transaction: Dict[str, Any], 
        concurrent_logs: List[Dict[str, Any]]
    ) -> float:
        """
        Extracts features and predicts the anomaly risk score (0-100) using the
        fitted Isolation Forest model.
        """
        features = preprocessor.extract_features(transaction, concurrent_logs)
        risk_score = detector.predict_risk_score(features)
        
        logger.info(
            f"ML risk evaluation: Amount ${transaction.get('amount')}, "
            f"Threats: {len(concurrent_logs)} -> Risk Score: {risk_score}%"
        )
        return risk_score

    @staticmethod
    async def retrain_on_historical_data(db: AsyncSession) -> bool:
        """
        Loads transaction history, finds concurrent logs for each transaction,
        reconstructs feature vectors, and fits the IsolationForest.
        """
        logger.info("Starting ML model retraining cycle...")
        
        # Load last 500 transactions
        result = await db.execute(
            select(BankingTransaction)
            .order_by(BankingTransaction.timestamp.desc())
            .limit(500)
        )
        transactions = result.scalars().all()
        
        if len(transactions) < 10:
            logger.warning("Fewer than 10 transactions in database. Aborting retraining.")
            return False
            
        correlations = []
        for tx in transactions:
            # Get concurrent logs
            logs = await TelemetryService.get_concurrent_threats(
                db=db,
                ip_address=tx.ip_address,
                tx_time=tx.timestamp,
                window_minutes=10
            )
            
            tx_dict = {"amount": tx.amount, "timestamp": tx.timestamp}
            logs_list = [{"severity": log.severity, "event_type": log.event_type} for log in logs]
            
            correlations.append({"transaction": tx_dict, "logs": logs_list})
            
        # Extract training vectors
        X_train = preprocessor.batch_extract_features(correlations)
        
        # Fit model
        success = detector.train(X_train)
        if success:
            logger.info("ML model retraining cycle completed successfully.")
        else:
            logger.error("ML model retraining cycle failed.")
        return success
