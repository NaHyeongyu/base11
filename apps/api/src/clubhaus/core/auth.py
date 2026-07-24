from dataclasses import dataclass
from typing import Annotated
from uuid import UUID

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from clubhaus.core.config import settings


@dataclass(frozen=True, slots=True)
class Actor:
    user_id: UUID
    external_subject: str | None = None


bearer = HTTPBearer(auto_error=False)


def get_current_actor(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer)],
) -> Actor:
    if settings.auth_mode == "local":
        return Actor(user_id=UUID(settings.local_user_id), external_subject="local-coach")

    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Bearer token required"
        )

    # Cognito JWT verification is intentionally isolated here. The API contract and domain
    # never depend on Cognito-specific claims; production deployment replaces this adapter.
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Cognito verifier is not configured",
    )


CurrentActor = Annotated[Actor, Depends(get_current_actor)]
