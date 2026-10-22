from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.core.config import settings
from backend.database.session import engine, Base
import backend.database.models # Ensure models are registered
from backend.routers import auth, resumes, jobs, graph, roadmap, assessments, rag, agent, ml, career_docs, privacy

# Create database tables automatically
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    description="Enterprise Career Intelligence, Adaptive Skill Graph, and Agentic Upskilling Platform"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routers
app.include_router(auth.router, prefix="/api")
app.include_router(resumes.router, prefix="/api")
app.include_router(jobs.router, prefix="/api")
app.include_router(graph.router, prefix="/api")
app.include_router(roadmap.router, prefix="/api")
app.include_router(assessments.router, prefix="/api")
app.include_router(rag.router, prefix="/api")
app.include_router(agent.router, prefix="/api")
app.include_router(ml.router, prefix="/api")
app.include_router(career_docs.router, prefix="/api")
app.include_router(privacy.router, prefix="/api")

@app.get("/api/health")
def healthcheck():
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "environment": settings.ENVIRONMENT,
        "database": "sqlite_connected" if settings.DATABASE_URL.startswith("sqlite") else "postgres_connected",
        "aiFallbackMode": settings.AI_FALLBACK_MODE
    }

# Mount production frontend static files if built
import os
from fastapi.staticfiles import StaticFiles

if os.path.exists("frontend/dist"):
    app.mount("/", StaticFiles(directory="frontend/dist", html=True), name="static")
