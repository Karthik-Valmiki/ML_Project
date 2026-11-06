import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.core.config import settings
from app.api.system import router as system_router
from app.api.reports import router as reports_router
from app.api.predict import router as predict_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="REST API and analysis dashboard for network flow classification and automated bot detection using the UNSW-NB15 benchmark.",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static frontend assets (css, js)
static_dir = settings.FRONTEND_DIR
if os.path.exists(static_dir):
    app.mount("/static", StaticFiles(directory=static_dir), name="static")

# Include Modular Routers
app.include_router(system_router, prefix=settings.API_PREFIX)
app.include_router(reports_router, prefix=settings.API_PREFIX)
app.include_router(predict_router, prefix=settings.API_PREFIX)

@app.get("/", tags=["UI"])
@app.get("/dashboard", tags=["UI"])
def serve_dashboard():
    index_path = os.path.join(settings.FRONTEND_DIR, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return {"message": "Frontend UI file not found. Visit /docs for Swagger API."}

