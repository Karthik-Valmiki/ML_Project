import time
from fastapi import APIRouter
from app.core.config import settings
from app.services.model_service import model_service

router = APIRouter(prefix="", tags=["System & Navigation"])

@router.get("/health")
def health():
    return {
        "status": "healthy",
        "timestamp": time.time(),
        "models_loaded": list(model_service.models.keys()),
        "champion_model": model_service.metadata.get("champion_model", "Random Forest")
    }

@router.get("/navigation")
def get_navigation():
    return {
        "application": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "ui_endpoint": "/dashboard",
        "documentation": {
            "swagger": "/docs",
            "redoc": "/redoc"
        },
        "endpoints": [
            {"path": "/api/health", "method": "GET", "summary": "System status"},
            {"path": "/api/overview", "method": "GET", "summary": "Review I dataset audit"},
            {"path": "/api/metrics/review2", "method": "GET", "summary": "Review II Linear & Logistic baselines"},
            {"path": "/api/metrics/review3", "method": "GET", "summary": "Review III Decision Tree & Random Forest benchmark"},
            {"path": "/api/scenarios", "method": "GET", "summary": "Unseen holdout test scenarios"},
            {"path": "/api/scenarios/{id}", "method": "GET", "summary": "Scenario features and ground truth"},
            {"path": "/api/predict", "method": "POST", "summary": "Live flow inference"},
            {"path": "/api/predict/batch", "method": "POST", "summary": "Batch traffic flow inference"}
        ]
    }

