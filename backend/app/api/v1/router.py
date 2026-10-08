from fastapi import APIRouter

from app.api.v1.endpoints import auth, industry, matching, students

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(
    auth.router,
    prefix="/auth",
    tags=["Authentication"],
)

api_router.include_router(
    students.router,
    prefix="/students",
    tags=["Students"],
)

api_router.include_router(
    industry.router,
    prefix="/industry",
    tags=["Industry Challenges"],
)

api_router.include_router(
    matching.router,
    prefix="/matching",
    tags=["Matching Engine"],
)