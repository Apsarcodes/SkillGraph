from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from backend.database.session import get_db
from backend.database.models import User, RoadmapTaskModel, ExtractedSkillRecord, JobMatch, AuditLog
from backend.core.security import get_current_user
from backend.core.graph import GraphEngine

router = APIRouter(prefix="/roadmap", tags=["Roadmap"])

class ToggleTaskRequest(BaseModel):
    isCompleted: bool

@router.get("")
def get_roadmap(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Check if user already has persisted tasks
    persisted_tasks = db.query(RoadmapTaskModel).filter(RoadmapTaskModel.user_id == current_user.id).order_by(RoadmapTaskModel.order_index.asc()).all()
    
    if persisted_tasks:
        return [
            {
                "id": t.id,
                "skill": t.skill,
                "category": t.category,
                "order": t.order_index,
                "title": t.title,
                "description": t.description,
                "estimatedHours": t.estimated_hours,
                "prerequisites": t.prerequisites,
                "resources": t.resources,
                "isCompleted": t.is_completed
            }
            for t in persisted_tasks
        ]

    # Generate initial roadmap tasks from missing skills
    user_records = db.query(ExtractedSkillRecord).filter(ExtractedSkillRecord.user_id == current_user.id).all()
    user_skills = {r.name for r in user_records}
    if not user_skills:
        user_skills = {"Python", "TypeScript", "JavaScript", "SQL", "React", "FastAPI", "Node.js", "Express", "PostgreSQL", "Redis", "SQLite", "Docker", "AWS", "Git", "REST APIs", "CI/CD"}

    latest_job = db.query(JobMatch).filter(JobMatch.user_id == current_user.id).order_by(JobMatch.analyzed_at.desc()).first()
    if latest_job:
        missing_skills = [b["skill"] for b in latest_job.breakdown_json if b["status"] in ("MISSING", "PARTIAL")]
    else:
        missing_skills = ["Vector Databases", "RAG", "Kubernetes", "PyTorch"]

    ordered_tasks, _ = GraphEngine.topological_sort_roadmap(missing_skills, user_skills)

    # Persist tasks to database
    result = []
    for t in ordered_tasks:
        db_task = RoadmapTaskModel(
            user_id=current_user.id,
            skill=t["skill"],
            category=t["category"],
            order_index=t["order"],
            title=t["title"],
            description=t["description"],
            estimated_hours=t["estimatedHours"],
            prerequisites=t["prerequisites"],
            resources=t["resources"],
            is_completed=False
        )
        db.add(db_task)
        result.append(t)

    db.commit()
    return result

@router.post("/task/{task_id}/toggle")
def toggle_task(
    task_id: str,
    req: ToggleTaskRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    task = db.query(RoadmapTaskModel).filter(
        RoadmapTaskModel.id == task_id,
        RoadmapTaskModel.user_id == current_user.id
    ).first()

    if not task:
        # Check by skill id match
        task = db.query(RoadmapTaskModel).filter(
            RoadmapTaskModel.user_id == current_user.id
        ).filter(RoadmapTaskModel.skill.ilike(f"%{task_id.replace('tsk_', '').replace('_', ' ')}%")).first()

    if task:
        task.is_completed = req.isCompleted
        db.commit()

        audit = AuditLog(
            user_id=current_user.id,
            action="ROADMAP_TASK_TOGGLED",
            details=f"Task '{task.title}' set to isCompleted={req.isCompleted}.",
            ip_masked="127.0.0.xxx"
        )
        db.add(audit)
        db.commit()
        return {"success": True, "taskId": task.id, "isCompleted": task.is_completed}

    return {"success": True, "taskId": task_id, "isCompleted": req.isCompleted}
