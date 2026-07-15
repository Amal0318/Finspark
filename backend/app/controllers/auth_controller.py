from datetime import timedelta
from fastapi import HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from app.core import security
from app.schemas.user import Token, UserCreate, User as UserSchema
from app.services.auth_service import AuthService
from app.models.user import User


class AuthController:
    @staticmethod
    async def login_for_access_token(
        db: AsyncSession, form_data: OAuth2PasswordRequestForm
    ) -> Token:
        user = await AuthService.authenticate(
            db, email=form_data.username, password=form_data.password
        )
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        elif not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="Inactive user"
            )

        access_token_expires = timedelta(
            minutes=security.settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
        access_token = security.create_access_token(
            subject=user.id, expires_delta=access_token_expires
        )
        return Token(access_token=access_token, token_type="bearer")

    @staticmethod
    async def register_new_user(
        db: AsyncSession, user_in: UserCreate
    ) -> UserSchema:
        existing_user = await AuthService.get_by_email(db, email=user_in.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A user with this email address already exists.",
            )
        new_user = await AuthService.create(db, user_in)
        return UserSchema.model_validate(new_user)

    @staticmethod
    def read_own_user(current_user: User) -> UserSchema:
        return UserSchema.model_validate(current_user)
