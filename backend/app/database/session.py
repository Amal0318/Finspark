from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.core.database import Base, engine
from app.core.config import settings
from app.core.security import get_password_hash

# Note: Import all models here so that Base.metadata recognizes them for table creation
from app.models.user import User
from app.models.telemetry import TelemetryLog
from app.models.transaction import BankingTransaction
from app.models.alert import CorrelatedAlert
from app.models.login_log import LoginLog
from app.models.threat_report import ThreatReport
from app.models.risk_score import RiskScore
from app.models.prediction import MlPrediction


async def init_db_tables() -> None:
    """
    Initializes database tables by creating them if they do not exist.
    """
    async with engine.begin() as conn:
        # In development, you can use drop_all to reset, but for production-ready, we run create_all safely
        await conn.run_sync(Base.metadata.create_all)


async def seed_data(db: AsyncSession) -> None:
    """
    Seeds initial test accounts for each role.
    """
    # 1. Seed Admin
    result_admin = await db.execute(
        select(User).where(User.email == settings.FIRST_SUPERUSER_EMAIL)
    )
    admin_user = result_admin.scalars().first()
    if not admin_user:
        new_admin = User(
            email=settings.FIRST_SUPERUSER_EMAIL,
            hashed_password=get_password_hash(settings.FIRST_SUPERUSER_PASSWORD),
            full_name="System Administrator",
            role="admin",
            is_active=True,
            is_superuser=True
        )
        db.add(new_admin)
        await db.commit()
    
    # 2. Seed Investigator
    investigator_email = "investigator@cybersense.ai"
    result_investigator = await db.execute(
        select(User).where(User.email == investigator_email)
    )
    investigator_user = result_investigator.scalars().first()
    if not investigator_user:
        new_investigator = User(
            email=investigator_email,
            hashed_password=get_password_hash("CyberSenseInvestigator2026!"),
            full_name="Lead Incident Investigator",
            role="investigator",
            is_active=True,
            is_superuser=False
        )
        db.add(new_investigator)
        await db.commit()

    # 3. Seed Viewer
    viewer_email = "viewer@cybersense.ai"
    result_viewer = await db.execute(
        select(User).where(User.email == viewer_email)
    )
    viewer_user = result_viewer.scalars().first()
    if not viewer_user:
        new_viewer = User(
            email=viewer_email,
            hashed_password=get_password_hash("CyberSenseViewer2026!"),
            full_name="Compliance Auditor",
            role="viewer",
            is_active=True,
            is_superuser=False
        )
        db.add(new_viewer)
        await db.commit()
