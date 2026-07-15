from typing import List
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.transaction import BankingTransactionCreate, BankingTransactionResponse
from app.services.transaction_service import TransactionService


class TransactionController:
    @staticmethod
    async def create_transaction(
        db: AsyncSession, transaction_in: BankingTransactionCreate
    ) -> BankingTransactionResponse:
        db_obj = await TransactionService.create(db, transaction_in)
        return BankingTransactionResponse.model_validate(db_obj)

    @staticmethod
    async def get_transactions(
        db: AsyncSession, skip: int = 0, limit: int = 100
    ) -> List[BankingTransactionResponse]:
        db_objs = await TransactionService.get_multi(db, skip, limit)
        return [BankingTransactionResponse.model_validate(obj) for obj in db_objs]

    @staticmethod
    async def get_transaction_by_id(
        db: AsyncSession, tx_id: int
    ) -> BankingTransactionResponse:
        db_obj = await TransactionService.get_by_id(db, tx_id)
        if not db_obj:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Transaction with ID {tx_id} not found"
            )
        return BankingTransactionResponse.model_validate(db_obj)
