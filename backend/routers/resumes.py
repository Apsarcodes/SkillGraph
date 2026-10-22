from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from collections import Counter
from backend.database.session import get_db
from backend.database.models import User, Resume, ExtractedSkillRecord, AuditLog
from backend.core.security import get_current_user
from backend.security.pii_scrubber import PIIScrubber
from backend.ml.skill_extractor import SkillExtractor

router = APIRouter(prefix="/resumes", tags=["Resumes"])

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

@router.post("/upload")
async def upload_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not file.filename.lower().endswith(('.pdf', '.docx', '.txt')):
        raise HTTPException(status_code=400, detail="Only .pdf, .docx, and .txt files are supported")

    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File size exceeds maximum 5MB limit")

    filename = file.filename
    try:
        if filename.lower().endswith('.pdf'):
            raw_text = SkillExtractor.extract_text_from_pdf(content)
        elif filename.lower().endswith('.docx'):
            raw_text = SkillExtractor.extract_text_from_docx(content)
        else:
            raw_text = content.decode('utf-8', errors='ignore')
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Failed to extract text from document: {str(e)}")

    if not raw_text.strip():
        raise HTTPException(status_code=422, detail="Document appears to be empty or unreadable text")

    # Step 1: PII Scrubbing
    scrubbed_text, redaction_counts = PIIScrubber.scrub_text(raw_text)

    # Step 2: Skill Extraction
    extracted_skills = SkillExtractor.extract_skills_with_evidence(scrubbed_text)

    category_counts = Counter([s["category"] for s in extracted_skills])
    breakdown = {
        "languages": category_counts.get("languages", 0),
        "frameworks": category_counts.get("frameworks", 0),
        "databases": category_counts.get("databases", 0),
        "cloud": category_counts.get("cloud", 0),
        "tools": category_counts.get("tools", 0)
    }

    # Step 3: Persistence
    resume_record = Resume(
        user_id=current_user.id,
        filename=filename,
        redacted_text=scrubbed_text[:3000],  # store bounded scrubbed preview
        total_skills_count=len(extracted_skills),
        category_breakdown=breakdown
    )
    db.add(resume_record)
    db.flush()

    for s in extracted_skills:
        skill_entry = ExtractedSkillRecord(
            resume_id=resume_record.id,
            user_id=current_user.id,
            name=s["name"],
            category=s["category"],
            confidence=s["confidence"],
            evidence=s["evidence"]
        )
        db.add(skill_entry)

    # Audit log
    audit = AuditLog(
        user_id=current_user.id,
        action="RESUME_UPLOADED_AND_SCRUBBED",
        details=f"File: {filename}, Redacted: {redaction_counts['emails']} emails, {redaction_counts['phones']} phones. Extracted: {len(extracted_skills)} skills.",
        ip_masked="127.0.0.xxx"
    )
    db.add(audit)
    db.commit()
    db.refresh(resume_record)

    return {
        "id": resume_record.id,
        "filename": resume_record.filename,
        "skills": extracted_skills,
        "totalSkillsCount": len(extracted_skills),
        "categoryBreakdown": breakdown,
        "redactedPreview": scrubbed_text[:800],
        "uploadedAt": resume_record.uploaded_at.isoformat()
    }

@router.get("/latest")
def get_latest_resume(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    resume = db.query(Resume).filter(Resume.user_id == current_user.id).order_by(Resume.uploaded_at.desc()).first()
    if not resume:
        from backend.services_demo import DEMO_RESUME_ANALYSIS
        return DEMO_RESUME_ANALYSIS

    skill_records = db.query(ExtractedSkillRecord).filter(ExtractedSkillRecord.resume_id == resume.id).all()
    skills = [
        {
            "name": r.name,
            "category": r.category,
            "confidence": r.confidence,
            "evidence": r.evidence
        }
        for r in skill_records
    ]
    return {
        "id": resume.id,
        "filename": resume.filename,
        "skills": skills,
        "totalSkillsCount": resume.total_skills_count,
        "categoryBreakdown": resume.category_breakdown,
        "redactedPreview": resume.redacted_text[:800],
        "uploadedAt": resume.uploaded_at.isoformat()
    }
