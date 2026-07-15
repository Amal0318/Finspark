# SentinelX AI 🛡️

### AI-Powered Cybersecurity Telemetry & Banking Transaction Correlation Engine

SentinelX AI is a production-ready, clean-architecture security intelligence platform designed to ingest multi-modal telemetry logs, correlate them with live banking transaction streams, and employ dual Machine Learning models (Isolation Forest + SMOTE Random Forest) to mitigate fraud, cyber exploits, and insider threats in real-time.

---

## 🚀 Core Platform Features

1.  **Dynamic Dataset Ingestion:** Recursive directory scanning and schema auto-discovery.
2.  **Temporal Correlation Engine:** Chronologically aligns transactions to login sessions, PC endpoints, and netflow captures using multi-key sliding-window joins.
3.  **Advanced Feature Engineering:** Calculates 20 continuous velocity, geographical jumps, latency proxy VPNs, and insider scores.
4.  **Oversampled Dual-Model ML:**
    *   *Model 1 (Isolation Forest):* Unsupervised behavioral anomaly scorer.
    *   *Model 2 (Random Forest Classifier):* Supervised payment fraud classifier balanced dynamically using **SMOTE** oversampling.
5.  **Multi-Dimensional Risk Score Engine:** Compares ML continuous probabilities, IP reputations, and deterministic business rules to score risks from 0-100% (Low, Medium, High, Critical).
6.  **Google Gemini AI Explainer:** Converts telemetry and model indices into structured natural-language reports and SOC action protocols.
7.  **Dynamic dark-mode Dashboard:** Visualizes trends using Recharts (Area, Line, and Bar charts) and serves high-DPI matplotlib validation curves.

---

## 🛠️ Tech Stack & Dependencies

*   **Core Backend:** FastAPI (Python 3.11), SQLAlchemy Async (asyncpg), PostgreSQL.
*   **AI/ML Libraries:** Scikit-Learn, Pandas, NumPy, Imbalanced-Learn (SMOTE), Joblib.
*   **Security Context:** JWT OAuth2 Authentication Bearer, role-based checks.
*   **Frontend Interface:** React 18, Vite, Tailwind CSS, Recharts, Framer Motion, Axios, React Query.
*   **Deployment:** Docker, Docker Compose.

---

## 📂 Repository Structure

```
├── docker-compose.yml       # Production Docker Services orchestrator
├── README.md                # Root Project Guide
├── docs/                    # Architectural & Setup guides
│   ├── Architecture.md      # High-level design & component relations
│   ├── ML_Pipeline.md       # SMOTE & CV parameters
│   ├── Dataset_Report.md    # Source metadata classifications
│   ├── Feature_Engineering.md # Formulas of engineered parameters
│   ├── Installation_Guide.md # Step-by-step local workspace setup
│   ├── API_Documentation.md  # Detailed OpenAPI REST endpoints parameters
│   ├── Deployment_Guide.md  # Docker compose production commands
│   └── Testing_Guide.md     # Command line tests guide
├── backend/
│   ├── Dockerfile           # Backend container config
│   ├── requirements.txt     # Python requirements
│   ├── .env.example         # Template config file
│   └── app/
│       ├── main.py          # FastAPI application server entry
│       ├── core/            # Configs & Security keys
│       ├── models/          # SQLAlchemy schemas (MlPrediction, ThreatReport)
│       ├── routes/          # REST Endpoint Routers (ml.py, auth.py)
│       ├── services/        # PredictionService, LLMService explainer
│       └── ml/              # train.py, predict.py, risk_engine.py
└── frontend/
    ├── Dockerfile           # Frontend static container (Nginx)
    ├── src/
        ├── services/        # Axios API clients
        ├── pages/           # Dashboard, Incidents charts
```

---

## ⚡ Quick Start (Docker Compose)

To build and launch the entire stack (PostgreSQL database, FastAPI backend, and React client), execute this command from the root workspace directory:

```bash
docker-compose up --build
```

### Access Ports:
*   **Interactive Frontend App:** [http://localhost](http://localhost) (Nginx reverse-proxy on port 80)
*   **Backend OpenAPI/Swagger docs:** [http://localhost:8000/docs](http://localhost:8000/docs)
*   **PostgreSQL Port:** `5432`

---

## 📖 Operational Documentation

*   👉 **[Installation Guide](file:///d:/Programs/Finspark/docs/Installation_Guide.md):** Manual python setup and database seeds.
*   👉 **[API Documentation](file:///d:/Programs/Finspark/docs/API_Documentation.md):** Request parameters, payloads, and JWT authentications.
*   👉 **[Deployment Guide](file:///d:/Programs/Finspark/docs/Deployment_Guide.md):** Production Docker variables and key configurations.
*   👉 **[Testing Guide](file:///d:/Programs/Finspark/docs/Testing_Guide.md):** ML unit test execution commands.
