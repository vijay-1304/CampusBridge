from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.services.supabase_service import check_supabase_connection

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="CampusBridge Backend API",
    version="1.0.0",
)

# CORS Middleware Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint indicating API operational status and Supabase configuration state."""
    supabase_status = check_supabase_connection()
    return {
        "status": "healthy",
        "service": "CampusBridge API",
        "environment": settings.ENVIRONMENT,
        "message": "CampusBridge API is running",
        "supabase": supabase_status,
    }


@app.get("/", tags=["Root"])
async def root():
    """Root endpoint providing quick navigation links."""
    return {
        "message": f"Welcome to {settings.PROJECT_NAME}",
        "docs": "/docs",
        "health": "/health",
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
