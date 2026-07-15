import os
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, KFold, cross_val_score
from sklearn.ensemble import RandomForestClassifier
from sklearn.ensemble import IsolationForest
from imblearn.over_sampling import SMOTE
from app.utils.logger import logger
from app.ml.metrics import ModelEvaluator
from app.ml.model_loader import ModelLoader
from app.ml.evaluation import PipelineEvaluator

DATASETS_DIR = r"d:\Programs\Finspark\Datasets"
PROCESSED_FILE = os.path.join(DATASETS_DIR, "processed_dataset.csv")

class ModelTrainer:
    """
    Orchestrates data preparation, cross-validation, SMOTE oversampling,
    model fitting, and metric logging.
    """

    @staticmethod
    def train_pipeline() -> None:
        if not os.path.exists(PROCESSED_FILE):
            logger.error(f"Processed dataset not found at: {PROCESSED_FILE}")
            raise FileNotFoundError(f"File not found: {PROCESSED_FILE}")

        logger.info(f"Loading processed dataset for model training from {PROCESSED_FILE}...")
        df = pd.read_csv(PROCESSED_FILE)

        # Drop any records where target fraud or critical features are null
        df = df.dropna(subset=["fraud"])

        # ----------------------------------------------------
        # PART A: MODEL 1 - ISOLATION FOREST
        # Purpose: Behaviour Anomaly Detection
        # ----------------------------------------------------
        logger.info("Setting up features for Model 1: Isolation Forest...")
        iforest_features = [
            "failed_login_count",
            "multiple_failed_login",
            "login_failed",
            "abnormal_login_time",
            "is_new_device",
            "device_changed",
            "browser_changed",
            "country_changed",
            "vpn_detected",
            "transaction_velocity",
            "working_hour",
            "weekend_login"
        ]
        
        # Verify columns exist
        iforest_features = [col for col in iforest_features if col in df.columns]
        X_iforest = df[iforest_features].fillna(0.0)

        # Train Isolation Forest
        logger.info("Fitting Isolation Forest model...")
        iforest = IsolationForest(contamination=0.05, random_state=42, n_estimators=150)
        iforest.fit(X_iforest)

        # Evaluate Isolation Forest anomalies (-1 is anomaly, 1 is normal)
        predictions = iforest.predict(X_iforest)
        # Convert -1 -> 1 (Anomaly) and 1 -> 0 (Normal) for metric evaluation
        y_pred_iforest = np.where(predictions == -1, 1, 0)
        
        # We can construct a mock target representing anomalous logins or use multiple_failed_login | vpn_detected
        y_true_iforest = ((df["multiple_failed_login"] == 1) | (df["vpn_detected"] == 1)).astype(int)
        
        logger.info("Evaluating Isolation Forest (Anomaly Detection)...")
        iforest_metrics = ModelEvaluator.evaluate_classification(y_true_iforest, y_pred_iforest)
        ModelEvaluator.print_evaluation_summary(iforest_metrics, "Model 1 - Isolation Forest Anomaly Detection")

        # Save Anomaly confusion matrix plot
        PipelineEvaluator.plot_confusion_matrix(iforest_metrics["confusion_matrix"], "Isolation Forest Anomalies", "confusion_matrix_iforest.png")

        # Save Model 1
        ModelLoader.save_model(iforest, "isolation_forest.pkl")

        # ----------------------------------------------------
        # PART B: MODEL 2 - RANDOM FOREST
        # Purpose: Supervised Fraud Prediction
        # Target: fraud
        # ----------------------------------------------------
        logger.info("Setting up features for Model 2: Random Forest...")
        rf_features = [
            "transaction_amount",
            "transaction_deviation",
            "device_changed",
            "is_new_device",
            "browser_changed",
            "country_changed",
            "failed_login_count",
            "Login Successful",
            "login_failed",
            "usb_activity_score",
            "email_activity_score",
            "file_access_score",
            "network_attack_detected",
            "ip_reputation"
        ]
        
        # Verify columns exist
        rf_features = [col for col in rf_features if col in df.columns]
        
        # Clean boolean columns
        X_rf = df[rf_features].copy()
        if "Login Successful" in X_rf.columns:
            X_rf["Login Successful"] = X_rf["Login Successful"].astype(int)
        X_rf = X_rf.fillna(0.0)
        
        y_rf = df["fraud"].astype(int)

        # Split data 80% train, 20% test
        X_train, X_test, y_train, y_test = train_test_split(
            X_rf, y_rf, test_size=0.20, random_state=42, stratify=y_rf
        )

        # Handle class imbalance in the training set using SMOTE
        logger.info(f"Class distribution before SMOTE: {np.bincount(y_train)}")
        smote = SMOTE(random_state=42)
        X_train_resampled, y_train_resampled = smote.fit_resample(X_train, y_train)
        logger.info(f"Class distribution after SMOTE: {np.bincount(y_train_resampled)}")

        # Train Random Forest Classifier
        logger.info("Fitting Random Forest classifier...")
        rf_clf = RandomForestClassifier(n_estimators=150, random_state=42, max_depth=12, class_weight="balanced")
        
        # K-Fold Cross Validation on the training set
        kf = KFold(n_splits=5, shuffle=True, random_state=42)
        cv_scores = cross_val_score(rf_clf, X_train_resampled, y_train_resampled, cv=kf, scoring="f1")
        logger.info(f"5-Fold Cross Validation F1-scores: {cv_scores} | Mean F1: {cv_scores.mean():.4f}")

        # Fit model
        rf_clf.fit(X_train_resampled, y_train_resampled)

        # Evaluate on test set
        y_pred_rf = rf_clf.predict(X_test)
        y_prob_rf = rf_clf.predict_proba(X_test)[:, 1]

        logger.info("Evaluating Random Forest (Fraud Classification)...")
        rf_metrics = ModelEvaluator.evaluate_classification(y_test, y_pred_rf, y_prob_rf)
        ModelEvaluator.print_evaluation_summary(rf_metrics, "Model 2 - Random Forest Fraud Prediction")

        # Report feature importances
        feat_imp = ModelEvaluator.get_feature_importance(rf_clf, rf_features)
        logger.info(f"\nFeature Importances:\n{feat_imp.to_string(index=False)}")

        # Save plots
        PipelineEvaluator.plot_feature_importances(feat_imp)
        PipelineEvaluator.plot_correlation_heatmap(df, rf_features)
        PipelineEvaluator.plot_confusion_matrix(rf_metrics["confusion_matrix"], "Random Forest Fraud", "confusion_matrix_rf.png")
        PipelineEvaluator.plot_roc_curve(y_test.values, y_prob_rf)
        PipelineEvaluator.plot_precision_recall_curve(y_test.values, y_prob_rf)
        PipelineEvaluator.plot_distributions(df)

        # Save Model 2
        ModelLoader.save_model(rf_clf, "random_forest.pkl")

if __name__ == "__main__":
    ModelTrainer.train_pipeline()
