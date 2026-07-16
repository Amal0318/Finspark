# CyberSense AI - Evaluation Report

This report outlines the performance evaluations, accuracy metrics, confusion matrices, and ROC/PR scores of both models.

---

## 1. Isolation Forest (Behavior Anomaly)

Evaluated against high-risk behavioral compliance profiles:
*   **Accuracy:** 45.21%
*   **Precision:** 77.53%
*   **Recall:** 6.74%
*   **F1 Score:** 12.40%

### Confusion Matrix
*   **True Negatives (TN):** 12,399
*   **False Positives (FP):** 337
*   **False Negatives (FN):** 16,101
*   **True Positives (TP):** 1,163

---

## 2. Random Forest Classifier (Fraud Prediction)

Evaluated against held-out 20% test partition (`6,000` instances):
*   **Accuracy:** **99.63%**
*   **ROC AUC Score:** **97.93%**
*   **Precision:** 17.65%
*   **Recall:** 27.27%
*   **F1 Score:** 21.43%

### Confusion Matrix
*   **True Legitimate (TN):** 5,975
*   **False Fraud (FP):** 14
*   **False Legitimate (FN):** 8
*   **True Fraud (TP):** 3

---

## 3. Evaluation Visualizations
Generated plots are saved within the [backend/plots/](file:///d:/Programs/Finspark/backend/plots) directory:
1.  `feature_importance.png` (Horizontal Gini split ranking).
2.  `correlation_heatmap.png` (Feature correlation matrix).
3.  `confusion_matrix_rf.png` & `confusion_matrix_iforest.png`.
4.  `roc_curve.png` & `precision_recall_curve.png`.
5.  `risk_distribution.png` (Composite score density histogram).
6.  `fraud_distribution.png` & `attack_distribution.png`.
