import os
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import roc_curve, precision_recall_curve, auc
from app.utils.logger import logger

class PipelineEvaluator:
    """
    Auto-generates all pipeline evaluation visualizations (ROC curves,
    confusion matrices, correlation heatmaps, feature importances,
    and risk distributions) and writes them to the plots directory.
    """
    
    PLOTS_DIR = r"d:\Programs\Finspark\backend\plots"

    @classmethod
    def initialize_plots_directory(cls) -> None:
        """Ensures target visualization output folder exists on disk."""
        os.makedirs(cls.PLOTS_DIR, exist_ok=True)
        logger.info(f"Initialized plots directory at: {cls.PLOTS_DIR}")

    @classmethod
    def plot_feature_importances(cls, importances: pd.DataFrame) -> str:
        """Generates and saves the Gini importances horizontal bar chart."""
        cls.initialize_plots_directory()
        if importances.empty:
            logger.warning("Feature importances DataFrame is empty. Skipping plot.")
            return ""

        plt.figure(figsize=(10, 6))
        # Keep top 15 for readability
        top_imp = importances.head(15).sort_values(by="importance", ascending=True)
        
        plt.barh(top_imp["feature"], top_imp["importance"], color="#3f51b5", edgecolor="black")
        plt.title("Random Forest Classifier - Top 15 Feature Importances", fontsize=12, fontweight="bold")
        plt.xlabel("Gini Importance Score", fontsize=10)
        plt.ylabel("Telemetry Feature", fontsize=10)
        plt.tight_layout()

        filepath = os.path.join(cls.PLOTS_DIR, "feature_importance.png")
        plt.savefig(filepath, dpi=300)
        plt.close()
        logger.info(f"Saved feature importance plot to {filepath}")
        return filepath

    @classmethod
    def plot_correlation_heatmap(cls, df: pd.DataFrame, feature_list: list) -> str:
        """Computes and saves a correlation heatmap for key telemetry variables."""
        cls.initialize_plots_directory()
        cols = [col for col in feature_list if col in df.columns]
        if not cols:
            logger.warning("No overlapping columns found for correlation plot.")
            return ""

        corr = df[cols].corr()

        plt.figure(figsize=(12, 10))
        sns.heatmap(corr, annot=False, cmap="coolwarm", fmt=".2f", vmin=-1.0, vmax=1.0, linewidths=0.5)
        plt.title("Correlation Matrix - Unified Security & Transaction Features", fontsize=14, fontweight="bold")
        plt.tight_layout()

        filepath = os.path.join(cls.PLOTS_DIR, "correlation_heatmap.png")
        plt.savefig(filepath, dpi=300)
        plt.close()
        logger.info(f"Saved correlation heatmap to {filepath}")
        return filepath

    @classmethod
    def plot_confusion_matrix(cls, cm: list, title: str, filename: str) -> str:
        """Plots a colored 2x2 confusion matrix."""
        cls.initialize_plots_directory()
        cm_arr = np.array(cm)

        plt.figure(figsize=(6, 5))
        sns.heatmap(cm_arr, annot=True, fmt="d", cmap="Blues", cbar=False,
                    xticklabels=["Predicted Normal", "Predicted Threat"],
                    yticklabels=["Actual Normal", "Actual Threat"])
        plt.ylabel("True Class", fontsize=10, fontweight="bold")
        plt.xlabel("Predicted Class", fontsize=10, fontweight="bold")
        plt.title(f"Confusion Matrix - {title}", fontsize=12, fontweight="bold")
        plt.tight_layout()

        filepath = os.path.join(cls.PLOTS_DIR, filename)
        plt.savefig(filepath, dpi=300)
        plt.close()
        logger.info(f"Saved confusion matrix plot to {filepath}")
        return filepath

    @classmethod
    def plot_roc_curve(cls, y_true: np.ndarray, y_prob: np.ndarray) -> str:
        """Plots the ROC Curve and calculates the area under the curve (AUC)."""
        cls.initialize_plots_directory()
        fpr, tpr, _ = roc_curve(y_true, y_prob)
        roc_auc = auc(fpr, tpr)

        plt.figure(figsize=(7, 6))
        plt.plot(fpr, tpr, color="darkorange", lw=2, label=f"ROC curve (AUC = {roc_auc:.4f})")
        plt.plot([0, 1], [0, 1], color="navy", lw=2, linestyle="--")
        plt.xlim([0.0, 1.0])
        plt.ylim([0.0, 1.05])
        plt.xlabel("False Positive Rate (FPR)", fontsize=10)
        plt.ylabel("True Positive Rate (TPR)", fontsize=10)
        plt.title("Receiver Operating Characteristic (ROC) Curve", fontsize=12, fontweight="bold")
        plt.legend(loc="lower right")
        plt.tight_layout()

        filepath = os.path.join(cls.PLOTS_DIR, "roc_curve.png")
        plt.savefig(filepath, dpi=300)
        plt.close()
        logger.info(f"Saved ROC curve plot to {filepath}")
        return filepath

    @classmethod
    def plot_precision_recall_curve(cls, y_true: np.ndarray, y_prob: np.ndarray) -> str:
        """Plots the Precision-Recall curve."""
        cls.initialize_plots_directory()
        precision, recall, _ = precision_recall_curve(y_true, y_prob)
        pr_auc = auc(recall, precision)

        plt.figure(figsize=(7, 6))
        plt.plot(recall, precision, color="blue", lw=2, label=f"PR curve (AUC = {pr_auc:.4f})")
        plt.xlabel("Recall", fontsize=10)
        plt.ylabel("Precision", fontsize=10)
        plt.title("Precision-Recall (PR) Curve", fontsize=12, fontweight="bold")
        plt.legend(loc="lower left")
        plt.tight_layout()

        filepath = os.path.join(cls.PLOTS_DIR, "precision_recall_curve.png")
        plt.savefig(filepath, dpi=300)
        plt.close()
        logger.info(f"Saved precision recall curve plot to {filepath}")
        return filepath

    @classmethod
    def plot_distributions(cls, df: pd.DataFrame) -> None:
        """Generates distribution plots for fraud targets, threat attacks, and risk engine metrics."""
        cls.initialize_plots_directory()
        
        # 1. Risk Score Distribution
        if "risk_indicator" in df.columns:
            plt.figure(figsize=(7, 5))
            sns.histplot(df["risk_indicator"], kde=True, bins=30, color="purple")
            plt.title("CyberSense Composite Risk Score Distribution", fontsize=12, fontweight="bold")
            plt.xlabel("Calculated Risk Score (%)", fontsize=10)
            plt.ylabel("Frequency (Events count)", fontsize=10)
            plt.tight_layout()
            
            filepath = os.path.join(cls.PLOTS_DIR, "risk_distribution.png")
            plt.savefig(filepath, dpi=300)
            plt.close()
            logger.info(f"Saved risk distribution plot to {filepath}")

        # 2. Fraud Target Class Distribution
        if "fraud" in df.columns:
            plt.figure(figsize=(6, 5))
            fraud_counts = df["fraud"].value_counts()
            plt.bar(["Legitimate (0)", "Fraudulent (1)"], fraud_counts.values, color=["green", "red"], edgecolor="black")
            plt.title("Class Balance - Banking Fraud Target Labels", fontsize=12, fontweight="bold")
            plt.ylabel("Transaction Count", fontsize=10)
            plt.tight_layout()
            
            filepath = os.path.join(cls.PLOTS_DIR, "fraud_distribution.png")
            plt.savefig(filepath, dpi=300)
            plt.close()
            logger.info(f"Saved fraud distribution plot to {filepath}")

        # 3. Cybersecurity Attack Distribution
        if "network_attack_detected" in df.columns:
            plt.figure(figsize=(6, 5))
            attack_counts = df["network_attack_detected"].value_counts()
            plt.bar(["BENIGN (0)", "ATTACK (1)"], attack_counts.values, color=["teal", "orange"], edgecolor="black")
            plt.title("Telemetry Balance - Cybersecurity Network Attacks", fontsize=12, fontweight="bold")
            plt.ylabel("Flow Record Count", fontsize=10)
            plt.tight_layout()
            
            filepath = os.path.join(cls.PLOTS_DIR, "attack_distribution.png")
            plt.savefig(filepath, dpi=300)
            plt.close()
            logger.info(f"Saved attack distribution plot to {filepath}")
