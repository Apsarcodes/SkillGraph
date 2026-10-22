import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, Text, ForeignKey, JSON, DateTime
from sqlalchemy.orm import relationship
from backend.database.session import Base

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    target_role = Column(String, default="Senior Full Stack & AI Systems Engineer")
    experience_level = Column(String, default="Mid-Level")
    is_demo = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    resumes = relationship("Resume", back_populates="user", cascade="all, delete-orphan")
    job_matches = relationship("JobMatch", back_populates="user", cascade="all, delete-orphan")
    roadmap_tasks = relationship("RoadmapTaskModel", back_populates="user", cascade="all, delete-orphan")
    assessments = relationship("AssessmentAttempt", back_populates="user", cascade="all, delete-orphan")
    agent_plans = relationship("AgentPlanModel", back_populates="user", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="user", cascade="all, delete-orphan")

class Resume(Base):
    __tablename__ = "resumes"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    filename = Column(String, nullable=False)
    redacted_text = Column(Text, nullable=False)
    total_skills_count = Column(Integer, default=0)
    category_breakdown = Column(JSON, default=dict)
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="resumes")
    skills = relationship("ExtractedSkillRecord", back_populates="resume", cascade="all, delete-orphan")

class ExtractedSkillRecord(Base):
    __tablename__ = "extracted_skills"

    id = Column(String, primary_key=True, default=generate_uuid)
    resume_id = Column(String, ForeignKey("resumes.id"), nullable=False, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    name = Column(String, nullable=False, index=True)
    category = Column(String, nullable=False)
    confidence = Column(Float, default=1.0)
    evidence = Column(Text, default="")

    resume = relationship("Resume", back_populates="skills")

class JobPosting(Base):
    __tablename__ = "job_postings"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    job_title = Column(String, nullable=False)
    company = Column(String, default="Target Company")
    raw_description = Column(Text, nullable=False)
    required_skills = Column(JSON, default=list)
    preferred_skills = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)

class JobMatch(Base):
    __tablename__ = "job_matches"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    resume_id = Column(String, ForeignKey("resumes.id"), nullable=True)
    job_id = Column(String, ForeignKey("job_postings.id"), nullable=True)
    job_title = Column(String, nullable=False)
    company = Column(String, default="")
    match_score = Column(Float, default=0.0)
    matched_count = Column(Integer, default=0)
    missing_count = Column(Integer, default=0)
    partial_count = Column(Integer, default=0)
    breakdown_json = Column(JSON, default=list)
    analyzed_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="job_matches")

class SkillNodeModel(Base):
    __tablename__ = "skill_nodes"

    id = Column(String, primary_key=True)
    label = Column(String, nullable=False)
    category = Column(String, nullable=False)
    default_difficulty = Column(String, default="intermediate")
    default_hours = Column(Integer, default=20)

class SkillPrerequisiteModel(Base):
    __tablename__ = "skill_prerequisites"

    id = Column(String, primary_key=True, default=generate_uuid)
    skill_name = Column(String, nullable=False, index=True)
    prerequisite_name = Column(String, nullable=False, index=True)

class RoadmapTaskModel(Base):
    __tablename__ = "roadmap_tasks"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    skill = Column(String, nullable=False)
    category = Column(String, nullable=False)
    order_index = Column(Integer, default=0)
    title = Column(String, nullable=False)
    description = Column(Text, default="")
    estimated_hours = Column(Integer, default=15)
    prerequisites = Column(JSON, default=list)
    resources = Column(JSON, default=list)
    is_completed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="roadmap_tasks")

class AssessmentAttempt(Base):
    __tablename__ = "assessment_attempts"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    skill = Column(String, nullable=False, index=True)
    score = Column(Integer, nullable=False)
    total_questions = Column(Integer, nullable=False)
    percentage = Column(Float, nullable=False)
    passed = Column(Boolean, default=False)
    feedback = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="assessments")

class AgentPlanModel(Base):
    __tablename__ = "agent_plans"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    objective = Column(Text, nullable=False)
    total_iterations = Column(Integer, default=1)
    steps_json = Column(JSON, default=list)
    recommendations_json = Column(JSON, default=list)
    curriculum_json = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="agent_plans")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=True, index=True)
    action = Column(String, nullable=False)
    details = Column(Text, default="")
    ip_masked = Column(String, default="127.0.0.xxx")
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="audit_logs")
