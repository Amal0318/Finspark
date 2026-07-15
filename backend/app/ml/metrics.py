import numpy as np
import pandas as pd
from typing import Optional, Any
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    confusion_matrix,
    classification_report
)
from app.utils.logger import logger

class ModelEvaluator:
    """
    Evaluates ML performance using accuracy, precision, recall, F1, and ROC AUC,
    along with confusion matrices and feature importance details.
    """

    @staticmethod
    def evaluate_classification(y_true: np.ndarray, y_pred: np.ndarray, y_prob: Optional[np.ndarray] = None) -> dict:
        """
        Computes standard classification metrics for supervised models.
        """
        acc = accuracy_score(y_true, y_pred)
        prec = precision_score(y_true, y_pred, zero_division=0)
        rec = recall_score(y_true, y_pred, zero_division=0)
        f1 = f1_score(y_true, y_pred, zero_division=0)
        
        roc_auc = 0.0
        if y_prob is not None:
            try:
                roc_auc = roc_auc_score(y_true, y_prob)
            except Exception as e:
                logger.error(f"Failed to calculate ROC AUC: {e}")
                
        cm = confusion_matrix(y_true, y_pred)
        
        logger.info(
            f"Classification metrics - Acc: {acc:.4f}, Prec: {prec:.4f}, "
            f"Rec: {rec:.4f}, F1: {f1:.4f}, ROC AUC: {roc_auc:.4f}"
        )
        
        return {
            "accuracy": float(acc),
            "precision": float(prec),
            "recall": float(rec),
            "f1_score": float(f1),
            "roc_auc": float(roc_auc),
            "confusion_matrix": cm.tolist(),
            "report": classification_report(y_true, y_pred, output_dict=True, zero_division=0)
        }

    @staticmethod
    def print_evaluation_summary(metrics_dict: dict, title: str) -> None:
        """Prints a human-readable summary of metrics to logs."""
        print("=" * 60)
        print(f"EVALUATION METRICS SUMMARY: {title}")
        print("=" * 60)
        print(f"Accuracy:  {metrics_dict['accuracy']:.4f}")
        print(f"Precision: {metrics_dict['precision']:.4f}")
        print(f"Recall:    {metrics_dict['recall']:.4f}")
        print(f"F1 Score:  {metrics_dict['f1_score']:.4f}")
        print(f"ROC AUC:   {metrics_dict['roc_auc']:.4f}")
        print("-" * 60)
        print("Confusion Matrix:")
        cm = metrics_dict['confusion_matrix']
        print(f"  TN: {cm[0][0]:<6} | FP: {cm[0][1]}")
        print(f"  FN: {cm[1][0]:<6} | TP: {cm[1][1]}")
        print("=" * 60)

    @staticmethod
    def get_feature_importance(model: Any, feature_names: list) -> pd.DataFrame:
        """
        Extracts feature importances from a fitted ensemble model.
        """
        if hasattr(model, "feature_importances_"):
            importances = model.feature_importances_
            feat_imp = pd.DataFrame({
                "feature": feature_names,
                "importance": importances
            }).sort_values(by="importance", ascending=False)
            return feat_imp
        else:
            logger.warning("Provided model does not support feature importances.")
            return pd.DataFrame(columns=["feature", "importance"])
