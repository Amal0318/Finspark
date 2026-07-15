import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from app.utils.logger import logger


class AnomalyDetector:
    def __init__(self, contamination: float = 0.05):
        self.model = IsolationForest(
            contamination=contamination, 
            random_state=42, 
            n_estimators=100
        )
        self.scaler = StandardScaler()
        self.is_fitted = False
        
        # Cold start fallback data: simulates standard credit card transactions
        # features: [amount, hour, logs_count, max_severity, has_failed_login]
        self._initialize_cold_start()
        
    def _initialize_cold_start(self):
        """
        Seeds the Isolation Forest with a synthetic 'normal' dataset so the
        detector is fully functional upon startup.
        """
        logger.info("Initializing ML model with synthetic normal dataset...")
        
        # Generate 150 normal records
        np.random.seed(42)
        amounts = np.random.normal(loc=120, scale=80, size=150)
        amounts = np.clip(amounts, 1.0, 1500.0) # Standard amounts
        hours = np.random.randint(8, 22, size=150) # Standard working hours
        logs_count = np.random.poisson(lam=0.2, size=150) # Mostly 0, rarely 1 or 2 logs
        max_severity = np.zeros(150)
        has_failed_login = np.random.choice([0.0, 1.0], size=150, p=[0.95, 0.05])
        
        normal_data = np.column_stack((amounts, hours, logs_count, max_severity, has_failed_login))
        
        # Fit scaler and model
        try:
            scaled_data = self.scaler.fit_transform(normal_data)
            self.model.fit(scaled_data)
            self.is_fitted = True
            logger.info("ML model initialized and fitted successfully.")
        except Exception as e:
            logger.error(f"Error training cold start ML model: {e}")
            self.is_fitted = False

    def train(self, X_train: np.ndarray) -> bool:
        """
        Trains the detector on actual ingested logs.
        """
        if X_train.shape[0] < 10:
            logger.warning("Insufficient data samples to train IsolationForest (min 10). Skipping training.")
            return False
            
        try:
            scaled_data = self.scaler.fit_transform(X_train)
            self.model.fit(scaled_data)
            self.is_fitted = True
            logger.info(f"Model successfully re-trained with {X_train.shape[0]} records.")
            return True
        except Exception as e:
            logger.error(f"Failed to train IsolationForest model: {e}")
            return False

    def predict_risk_score(self, X: np.ndarray) -> float:
        """
        Returns a risk score between 0.0 (perfectly normal) and 100.0 (highly anomalous).
        """
        if not self.is_fitted:
            # Fallback score if not fitted
            return 50.0

        try:
            # Scale features
            X_scaled = self.scaler.transform(X)
            
            # Isolation Forest decision_function returns negative values for anomalies, positive for normal.
            # Usually values are within [-0.5, 0.5]
            raw_score = self.model.decision_function(X_scaled)[0]
            
            # Convert raw score to a 0.0 - 100.0 threat scale
            # Raw score: higher means normal, lower means anomalous.
            # Normal scores map to 0-30%, anomalous scores map to 60-100%
            risk_score = (0.5 - raw_score) * 100.0
            
            # Bound and calibrate
            risk_score = float(np.clip(risk_score, 0.0, 100.0))
            
            # Extra manual calibration based on cybersecurity logs if they exist
            # X features: [amount, hour, logs_count, max_severity, has_failed_login]
            logs_count = X[0, 2]
            max_severity = X[0, 3]
            if logs_count > 3 or max_severity >= 2.0:
                # Security threat raises risk score floor
                risk_score = max(risk_score, 75.0)
                
            return round(risk_score, 2)
            
        except Exception as e:
            logger.error(f"Error executing model prediction: {e}")
            return 50.0
            
    def is_anomaly(self, X: np.ndarray) -> bool:
        """
        Binary classification (-1 for anomaly, 1 for normal) mapped to boolean.
        """
        if not self.is_fitted:
            return False
        try:
            X_scaled = self.scaler.transform(X)
            prediction = self.model.predict(X_scaled)[0]
            return bool(prediction == -1)
        except Exception:
            return False
