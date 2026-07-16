# CyberSense AI - Dataset Report

CyberSense AI dynamically scans and discovers tabular datasets from separate enterprise modules.

---

## 1. Tabular Source Overview

| Dataset | File Mapped | Rows | Columns | Core Feature Category |
|---|---|---|---|---|
| **Login RBA** | `rba-dataset.csv` | 30,000 | 10 | Authentication, Device, Location |
| **IEEE-CIS** | `train_transaction.csv` | 30,000 | 12 | Banking Transactions, Fraud Targets |
| **CERT** | `logon.csv`, `device.csv`, `email.csv`, `file.csv` | 30,000 | 5 | Insider Activity, Workstation Connects |
| **CICIDS2017** | `Friday-WorkingHours-...csv` | 30,000 | 79 | Cybersecurity Flows, Intrusion Signals |

---

## 2. Dynamic Feature Classification

The dynamic scanning engine maps features into the following core categories:
1.  **Transaction Features:** Transaction amounts, deviation limits, average values, velocity counters.
2.  **Authentication Features:** Credentials status (Login Successful), credential failure indicators.
3.  **Cybersecurity Features:** Source IP reputation, network attack classifications.
4.  **Behavior Features:** USB connect volumes, file copy counts, external emails sent.
5.  **Device Features:** User agents, browsers, operating systems, hardware platforms.
6.  **Network Features:** IP addresses, ASNs, regions, latencies.
7.  **Identity Features:** User account identifiers.
8.  **Timestamp Features:** Time markers.
9.  **Risk Labels:** Targets indicating compromise.
