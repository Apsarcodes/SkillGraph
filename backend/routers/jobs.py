import re
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional
from sqlalchemy.orm import Session
from backend.database.session import get_db
from backend.database.models import User, JobPosting, JobMatch, Resume, ExtractedSkillRecord, AuditLog
from backend.core.security import get_current_user
from backend.ml.skill_extractor import SkillExtractor, TAXONOMY
from backend.core.graph import PREREQUISITES_MAP

router = APIRouter(prefix="/jobs", tags=["Jobs"])

class AnalyzeJobRequest(BaseModel):
    jobDescription: str
    jobTitle: str = "Target Software Role"
    company: str = "Target Company"

REQUIRED_CUES = re.compile(r'\b(must have|required|requirements|essential|mandatory|minimum qualification|qualifications)\b', re.IGNORECASE)
PREFERRED_CUES = re.compile(r'\b(preferred|nice to have|plus|bonus|optional|desired|good to have)\b', re.IGNORECASE)

@router.post("/analyze")
def analyze_job(
    req: AnalyzeJobRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not req.jobDescription.strip():
        raise HTTPException(status_code=400, detail="Job description text cannot be empty")

    # Step 1: Extract all technical skills mentioned in the job description
    extracted = SkillExtractor.extract_skills_with_evidence(req.jobDescription)
    extracted_names = [s["name"] for s in extracted]

    # Step 2: Classify skills into Required vs Preferred based on sentence context
    sentences = re.split(r'[.\n]+', req.jobDescription)
    required_skills = set()
    preferred_skills = set()

    for s in extracted:
        skill_name = s["name"]
        is_pref = False
        is_req = False

        for sent in sentences:
            if re.search(rf"\b{re.escape(skill_name)}\b", sent, re.IGNORECASE):
                if PREFERRED_CUES.search(sent):
                    is_pref = True
                if REQUIRED_CUES.search(sent):
                    is_req = True

        if is_pref and not is_req:
            preferred_skills.add(skill_name)
        else:
            required_skills.add(skill_name)

    # Ensure at least some required skills
    if not required_skills and preferred_skills:
        required_skills = preferred_skills
        preferred_skills = set()

    # Step 3: Fetch candidate's acquired skills
    user_skills_records = db.query(ExtractedSkillRecord).filter(ExtractedSkillRecord.user_id == current_user.id).all()
    user_skill_names = {r.name for r in user_skills_records}

    # If no resume uploaded yet, use demo skills for seamless evaluation
    if not user_skill_names:
        user_skill_names = {"Python", "TypeScript", "JavaScript", "SQL", "React", "FastAPI", "Node.js", "Express", "PostgreSQL", "Redis", "SQLite", "Docker", "AWS", "Git", "REST APIs", "CI/CD"}

    # Step 4: Gap Analysis Classification
    breakdown = []
    matched_count = 0
    missing_count = 0
    partial_count = 0

    all_target_skills = list(required_skills.union(preferred_skills))

    for skill in all_target_skills:
        importance = "REQUIRED" if skill in required_skills else "PREFERRED"
        prereqs = PREREQUISITES_MAP.get(skill, [])
        category = "tools"
        for cat, smap in TAXONOMY.items():
            if skill in smap:
                category = cat
                break

        if skill in user_skill_names:
            status = "MATCHED"
            matched_count += 1
        else:
            # Check for partial match (e.g. candidate has foundational prerequisite)
            has_prereq = any(p in user_skill_names for p in prereqs)
            if has_prereq:
                status = "PARTIAL"
                partial_count += 1
            else:
                status = "MISSING"
                missing_count += 1

        breakdown.append({
            "skill": skill,
            "category": category,
            "status": status,
            "importance": importance,
            "prerequisites": prereqs
        })

    # Step 5: Weighted Match Score Calculation
    # Required skills have weight 2, Preferred have weight 1
    req_matched = sum(1 for b in breakdown if b["importance"] == "REQUIRED" and b["status"] == "MATCHED")
    pref_matched = sum(1 for b in breakdown if b["importance"] == "PREFERRED" and b["status"] == "MATCHED")
    req_total = len(required_skills) or 1
    pref_total = len(preferred_skills)

    denominator = (2 * req_total) + pref_total
    numerator = (2 * req_matched) + pref_matched
    match_score = round((numerator / max(denominator, 1)) * 100, 1)

    # Step 6: Database Persistence
    job_record = JobPosting(
        user_id=current_user.id,
        job_title=req.jobTitle,
        company=req.company,
        raw_description=req.jobDescription[:3000],
        required_skills=list(required_skills),
        preferred_skills=list(preferred_skills)
    )
    db.add(job_record)
    db.flush()

    job_match = JobMatch(
        user_id=current_user.id,
        job_id=job_record.id,
        job_title=req.jobTitle,
        company=req.company,
        match_score=match_score,
        matched_count=matched_count,
        missing_count=missing_count,
        partial_count=partial_count,
        breakdown_json=breakdown
    )
    db.add(job_match)

    audit = AuditLog(
        user_id=current_user.id,
        action="JOB_ANALYZED",
        details=f"Analyzed {req.jobTitle} at {req.company}. Match score: {match_score}%. Matched: {matched_count}, Missing: {missing_count}.",
        ip_masked="127.0.0.xxx"
    )
    db.add(audit)
    db.commit()
    db.refresh(job_match)

    return {
        "id": job_match.id,
        "jobTitle": job_match.job_title,
        "company": job_match.company,
        "matchScore": job_match.match_score,
        "matchedCount": job_match.matched_count,
        "missingCount": job_match.missing_count,
        "partialCount": job_match.partial_count,
        "requiredSkills": list(required_skills),
        "preferredSkills": list(preferred_skills),
        "breakdown": breakdown,
        "analyzedAt": job_match.analyzed_at.isoformat()
    }

@router.get("/latest")
def get_latest_job(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    match = db.query(JobMatch).filter(JobMatch.user_id == current_user.id).order_by(JobMatch.analyzed_at.desc()).first()
    if not match:
        from backend.services_demo import DEMO_JOB_ANALYSIS
        return DEMO_JOB_ANALYSIS

    return {
        "id": match.id,
        "jobTitle": match.job_title,
        "company": match.company,
        "matchScore": match.match_score,
        "matchedCount": match.matched_count,
        "missingCount": match.missing_count,
        "partialCount": match.partial_count,
        "requiredSkills": [b["skill"] for b in match.breakdown_json if b["importance"] == "REQUIRED"],
        "preferredSkills": [b["skill"] for b in match.breakdown_json if b["importance"] == "PREFERRED"],
        "breakdown": match.breakdown_json,
        "analyzedAt": match.analyzed_at.isoformat()
    }
