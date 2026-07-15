# Routes package
from app.routes.auth import router as auth_router
from app.routes.telemetry import router as telemetry_router
from app.routes.transaction import router as transaction_router
from app.routes.alert import router as alert_router
from app.routes.dashboard import router as dashboard_router
from app.routes.dataset import router as dataset_router
from app.routes.prediction import router as prediction_router
from app.routes.analytics import router as analytics_router
from app.routes.risk import router as risk_router
from app.routes.llm import router as llm_router

__all__ = [
    "auth_router",
    "telemetry_router",
    "transaction_router",
    "alert_router",
    "dashboard_router",
    "dataset_router",
    "prediction_router",
    "analytics_router",
    "risk_router",
    "llm_router"
]
