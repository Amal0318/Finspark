from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.controllers.auth_controller import AuthController
from app.middleware.auth import get_current_user
from app.schemas.user import Token, UserCreate, User as UserSchema
from app.models.user import User

router = APIRouter(prefix="/auth")


@router.post("/login", response_model=Token)
async def login_for_access_token(
    db: AsyncSession = Depends(get_db),
    form_data: OAuth2PasswordRequestForm = Depends()
):
    return await AuthController.login_for_access_token(db, form_data)


@router.post("/register", response_model=UserSchema)
async def register_user(
    user_in: UserCreate,
    db: AsyncSession = Depends(get_db)
):
    return await AuthController.register_new_user(db, user_in)


@router.get("/me", response_model=UserSchema)
def read_current_user(
    current_user: User = Depends(get_current_user)
):
    return AuthController.read_own_user(current_user)
