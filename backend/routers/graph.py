from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.database.session import get_db
from backend.database.models import User, ExtractedSkillRecord, JobMatch
from backend.core.security import get_current_user
from backend.core.graph import GraphEngine

router = APIRouter(prefix="/graph", tags=["Skill Graph"])

@router.get("")
def get_graph(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Retrieve user acquired skills
    user_records = db.query(ExtractedSkillRecord).filter(ExtractedSkillRecord.user_id == current_user.id).all()
    user_skills = {r.name for r in user_records}
    if not user_skills:
        user_skills = {"Python", "TypeScript", "JavaScript", "SQL", "React", "FastAPI", "Node.js", "Express", "PostgreSQL", "Redis", "SQLite", "Docker", "AWS", "Git", "REST APIs", "CI/CD"}

    # Retrieve target missing skills from latest job match
    latest_job = db.query(JobMatch).filter(JobMatch.user_id == current_user.id).order_by(JobMatch.analyzed_at.desc()).first()
    if latest_job:
        target_skills = {b["skill"] for b in latest_job.breakdown_json if b["status"] in ("MISSING", "PARTIAL")}
    else:
        target_skills = {"Kubernetes", "Vector Databases", "RAG", "PyTorch"}

    nodes, edges = GraphEngine.build_skill_graph(user_skills, target_skills)
    return {
        "nodes": nodes,
        "edges": edges
    }
