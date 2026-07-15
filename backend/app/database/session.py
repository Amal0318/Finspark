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
    Seeds initial superuser if it doesn't already exist.
    """
    result = await db.execute(
        select(User).where(User.email == settings.FIRST_SUPERUSER_EMAIL)
    )
    user = result.scalars().first()
    
    if not user:
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
        await db.refresh(new_admin)
