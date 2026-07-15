from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.controllers.transaction_controller import TransactionController
from app.middleware.auth import get_current_user
from app.schemas.transaction import BankingTransactionCreate, BankingTransactionResponse
from app.models.user import User

router = APIRouter(prefix="/transactions")


@router.post("", response_model=BankingTransactionResponse)
async def create_transaction(
    transaction_in: BankingTransactionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await TransactionController.create_transaction(db, transaction_in)


@router.get("", response_model=List[BankingTransactionResponse])
async def list_transactions(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await TransactionController.get_transactions(db, skip=skip, limit=limit)


@router.get("/{tx_id}", response_model=BankingTransactionResponse)
async def read_transaction(
    tx_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await TransactionController.get_transaction_by_id(db, tx_id)
