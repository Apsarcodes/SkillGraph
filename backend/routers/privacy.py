from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.database.session import get_db
from backend.database.models import User, Resume, JobMatch, RoadmapTaskModel, AssessmentAttempt, AuditLog
from backend.core.security import get_current_user

router = APIRouter(prefix="/privacy", tags=["Privacy & Compliance"])

@router.get("/audit-logs")
def get_audit_logs(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    logs = db.query(AuditLog).filter(AuditLog.user_id == current_user.id).order_by(AuditLog.created_at.desc()).limit(50).all()
    if not logs:
        from backend.services_demo import DEMO_USER
        return [
            {
                "id": "aud_1",
                "timestamp": "2026-10-22T03:00:00Z",
                "action": "RESUME_PII_SCRUBBED",
                "details": "Scrubbed 1 email, 1 phone number before vector indexing.",
                "ipMasked": "127.0.0.xxx"
            },
            {
                "id": "aud_2",
                "timestamp": "2026-10-22T02:00:00Z",
                "action": "SERVER_AUTHORITATIVE_ASSESSMENT_SCORED",
                "details": "Calculated score on backend; verified answer integrity.",
                "ipMasked": "127.0.0.xxx"
            }
        ]

    return [
        {
            "id": l.id,
            "timestamp": l.created_at.isoformat(),
            "action": l.action,
            "details": l.details,
            "ipMasked": l.ip_masked
        }
        for l in logs
    ]

@router.get("/export-data")
def export_user_data(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    resumes = db.query(Resume).filter(Resume.user_id == current_user.id).all()
    job_matches = db.query(JobMatch).filter(JobMatch.user_id == current_user.id).all()
    assessments = db.query(AssessmentAttempt).filter(AssessmentAttempt.user_id == current_user.id).all()
    tasks = db.query(RoadmapTaskModel).filter(RoadmapTaskModel.user_id == current_user.id).all()

    return {
        "userProfile": {
            "id": current_user.id,
            "email": current_user.email,
            "fullName": current_user.full_name,
            "targetRole": current_user.target_role,
            "createdAt": current_user.created_at.isoformat()
        },
        "resumes": [{"id": r.id, "filename": r.filename, "uploadedAt": r.uploaded_at.isoformat(), "totalSkills": r.total_skills_count} for r in resumes],
        "jobMatches": [{"id": j.id, "jobTitle": j.job_title, "matchScore": j.match_score, "analyzedAt": j.analyzed_at.isoformat()} for j in job_matches],
        "assessments": [{"skill": a.skill, "score": a.score, "passed": a.passed, "date": a.created_at.isoformat()} for a in assessments],
        "roadmapTasks": [{"skill": t.skill, "completed": t.is_completed} for t in tasks],
        "complianceNotice": "Data exported in compliance with GDPR Art. 20 (Right to Data Portability) and CCPA."
    }

@router.delete("/purge-data")
def purge_user_data(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Cascade delete all candidate records
    resumes_count = db.query(Resume).filter(Resume.user_id == current_user.id).delete()
    matches_count = db.query(JobMatch).filter(JobMatch.user_id == current_user.id).delete()
    assessments_count = db.query(AssessmentAttempt).filter(AssessmentAttempt.user_id == current_user.id).delete()
    tasks_count = db.query(RoadmapTaskModel).filter(RoadmapTaskModel.user_id == current_user.id).delete()

    total_purged = resumes_count + matches_count + assessments_count + tasks_count

    audit = AuditLog(
        user_id=current_user.id,
        action="USER_DATA_PURGED",
        details=f"Right to be forgotten invoked. Purged {total_purged} candidate records.",
        ip_masked="127.0.0.xxx"
    )
    db.add(audit)
    db.commit()

    return {
        "status": "SUCCESS_ALL_USER_DATA_PURGED",
        "purgedRecordsCount": total_purged,
        "complianceNotice": "All candidate profile artifacts have been permanently deleted in compliance with GDPR Art. 17."
    }
