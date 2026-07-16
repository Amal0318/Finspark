from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.controllers.dataset_controller import DatasetController
from app.middleware.auth import RoleChecker
from app.models.user import User

router = APIRouter(prefix="/datasets")

# Admin role dependency checker
admin_only = RoleChecker(allowed_roles=["admin"])


@router.post("/upload/transactions")
async def upload_transactions_dataset(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(RoleChecker(allowed_roles=["admin", "investigator"]))
):
    """
    Upload a CSV file containing banking transactions.
    Parses and logs each transfer. Restricted to Admin operators.
    """
    return await DatasetController.upload_transactions(db, file)


@router.post("/upload/telemetry")
async def upload_telemetry_dataset(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(RoleChecker(allowed_roles=["admin", "investigator"]))
):
    """
    Upload a CSV file containing security telemetry logs.
    Restricted to Admin operators.
    """
    return await DatasetController.upload_telemetry(db, file)
