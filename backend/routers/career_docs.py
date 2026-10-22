from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from backend.core.security import get_current_user
from backend.database.models import User

router = APIRouter(prefix="/career-docs", tags=["Career Documents"])

class GenerateDocRequest(BaseModel):
    type: str  # cover_letter, networking_email, interview_prep
    targetJob: str = "Senior Full Stack & AI Systems Engineer"

@router.post("/generate")
def generate_doc(req: GenerateDocRequest, current_user: User = Depends(get_current_user)):
    user_name = current_user.full_name or "Alex Chen"
    target_job = req.targetJob

    if req.type == "networking_email":
        doc_type = "Networking Email"
        content = (
            f"Subject: Full Stack & AI Systems Engineer Inquiry — Shared Interest in Scalable Retrieval\n\n"
            f"Dear Engineering Team,\n\n"
            f"I recently reviewed your engineering milestones in scalable infrastructure and was particularly impressed "
            f"by your work on high-throughput microservice architecture.\n\n"
            f"With 3+ years of experience engineering high-performance REST APIs in Python/FastAPI, responsive frontend applications "
            f"in React/TypeScript, and relational data layers in PostgreSQL, I recently specialized in Vector Search and RAG pipeline grounding.\n\n"
            f"I would welcome the opportunity to connect for a brief 10-minute technical conversation regarding how my full-stack and systems engineering "
            f"foundation can contribute to your upcoming initiatives.\n\n"
            f"Best regards,\n"
            f"{user_name}\n"
            f"[REDACTED_EMAIL] | [REDACTED_PHONE]"
        )
    elif req.type == "interview_prep":
        doc_type = "Technical Interview Cheat Sheet"
        content = (
            f"TECHNICAL INTERVIEW PREPARATION GUIDE — {target_job.upper()}\n\n"
            f"1. Core Systems & Architecture:\n"
            f"   - Explain HNSW indexing vs Flat L2 search in Vector Databases.\n"
            f"   - Trade-offs between synchronous REST vs event-driven message queues (Kafka/RabbitMQ).\n"
            f"   - How to prevent cascading failures with circuit breakers and bulkhead isolation.\n\n"
            f"2. RAG & Retrieval Deep Dive:\n"
            f"   - How to tune chunk size (tokens) and chunk overlap (10-15%) for technical documentation.\n"
            f"   - Mitigating hallucinations using strict citation grounding and confidence thresholding.\n\n"
            f"3. Cloud & Container Orchestration:\n"
            f"   - Multi-stage Docker builds to keep production images under 150MB.\n"
            f"   - Kubernetes Readiness vs Liveness probes and graceful termination handlers."
        )
    else:  # cover_letter
        doc_type = "Tailored Cover Letter"
        content = (
            f"Dear Hiring Committee,\n\n"
            f"I am writing to express my strong enthusiasm for the {target_job} position. With a solid foundation "
            f"across full-stack systems engineering (Python, FastAPI, TypeScript, React, Docker) and a rigorous focus on AI-driven "
            f"retrieval architectures, I am excited about the opportunity to build resilient software with your team.\n\n"
            f"Throughout my software engineering career, I have prioritized clean architecture, strict type validation, and measurable "
            f"performance gains. My background includes architecting resilient microservices, optimizing database indexing, and designing "
            f"containerized deployment pipelines.\n\n"
            f"I look forward to discussing how my technical background and problem-solving mindset align with your engineering mission.\n\n"
            f"Sincerely,\n"
            f"{user_name}"
        )

    return {
        "docType": doc_type,
        "content": content
    }
