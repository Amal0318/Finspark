# SentinelX AI - Training Report

This document reports the hyperparameters, training sizes, contamination parameters, and Gini split parameters of the model classifiers.

---

## 1. Model 1: Isolation Forest (Behavior Anomaly)

*   **Algorithm:** Unsupervised Isolation Forest.
*   **Contamination Threshold:** `0.05` (5% expected baseline anomalies).
*   **Estimators Count:** `150` trees.
*   **Random State:** `42`.
*   **Training Size:** `30,000` instances.
*   **Purpose:** Builds partitioning paths for behavioral vectors. Shorter paths indicate higher anomaly scores.

---

## 2. Model 2: Random Forest (Supervised Fraud)

*   **Algorithm:** Supervised Random Forest Classifier.
*   **Target Label:** `fraud` (derived from `isFraud`).
*   **Estimators Count:** `150` decision trees.
*   **Max Tree Depth:** `12` splits (to prevent overfitting).
*   **Class Weights:** `balanced`.
*   **Training Balance:** **SMOTE** oversampled minority class from `46` occurrences to `23,954`, producing a balanced set of `47,908` instances.
*   **Purpose:** Predicts cash fraud risk.
