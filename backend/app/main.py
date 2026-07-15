import time
from contextlib import asynccontextmanager
import os
from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.database import AsyncSessionLocal
from app.database.session import init_db_tables, seed_data
from app.utils.logger import logger

# Import API routes
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
from app.routes.ml import router as ml_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup actions
    logger.info("Initializing database tables...")
    try:
        await init_db_tables()
        logger.info("Database tables initialized successfully.")
    except Exception as e:
        logger.error(f"Error initializing database tables: {e}")
        raise e
        
    logger.info("Seeding initial administrator data...")
    try:
        async with AsyncSessionLocal() as session:
            await seed_data(session)
        logger.info("Initial seeding completed.")
    except Exception as e:
        logger.error(f"Error seeding database: {e}")
        
    yield
    # Shutdown actions
    logger.info("Shutting down SentinelX API application.")


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="SentinelX AI - Cybersecurity Telemetry & Banking Transaction Correlation Engine",
    version="1.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
    lifespan=lifespan
)

# Ensure plots directory exists and mount static route
os.makedirs("plots", exist_ok=True)
app.mount("/plots", StaticFiles(directory="plots"), name="plots")


# Apply CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Custom request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    path = request.url.path
    method = request.method
    
    logger.info(f"Incoming request: {method} {path}")
    
    try:
        response = await call_next(request)
        process_time = (time.time() - start_time) * 1000
        formatted_process_time = f"{process_time:.2f}ms"
        
        logger.info(
            f"Completed request: {method} {path} - Status: {response.status_code} in {formatted_process_time}"
        )
        response.headers["X-Process-Time"] = formatted_process_time
        return response
    except Exception as e:
        process_time = (time.time() - start_time) * 1000
        logger.error(
            f"Failed request: {method} {path} - Error: {str(e)} in {process_time:.2f}ms"
        )
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal server error occurred."}
        )


# Health check endpoint
@app.get("/health", tags=["System"])
async def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "environment": settings.ENVIRONMENT
    }


# Include Routers
app.include_router(auth_router, prefix=settings.API_V1_STR, tags=["Authentication"])
app.include_router(telemetry_router, prefix=settings.API_V1_STR, tags=["Cybersecurity Telemetry"])
app.include_router(transaction_router, prefix=settings.API_V1_STR, tags=["Banking Transactions"])
app.include_router(alert_router, prefix=settings.API_V1_STR, tags=["Correlated Alerts"])
app.include_router(dashboard_router, prefix=settings.API_V1_STR, tags=["Dashboard Analytics"])
app.include_router(dataset_router, prefix=settings.API_V1_STR, tags=["Dataset Uploads"])
app.include_router(prediction_router, prefix=settings.API_V1_STR, tags=["ML Predictions"])
app.include_router(analytics_router, prefix=settings.API_V1_STR, tags=["Analytics Trends"])
app.include_router(risk_router, prefix=settings.API_V1_STR, tags=["Threat Risk Scoring"])
app.include_router(llm_router, prefix=settings.API_V1_STR, tags=["Simulated LLM Explainer"])
app.include_router(ml_router, prefix=settings.API_V1_STR, tags=["SentinelX AI Core"])

