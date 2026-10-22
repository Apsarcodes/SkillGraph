from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Dict
from sqlalchemy.orm import Session
from backend.database.session import get_db
from backend.database.models import User, AssessmentAttempt, RoadmapTaskModel, AuditLog
from backend.core.security import get_current_user

router = APIRouter(prefix="/assessments", tags=["Assessments"])

# Authoritative Question Bank with correct answer index (index 0 is the correct answer in raw bank, shuffled in UI)
QUESTION_BANK: Dict[str, List[Dict]] = {
    "Vector Databases": [
        {
            "id": 1,
            "question": "What is the primary computational benefit of HNSW indexing in vector databases?",
            "options": [
                "Achieving sub-linear approximate nearest neighbor search time complexity O(log N)",
                "Compressing vector dimensions to single-bit binary hashes",
                "Encrypting embeddings with AES-256 in memory",
                "Converting floating point vectors into SQL relational tables"
            ],
            "correct_idx": 0
        },
        {
            "id": 2,
            "question": "Which distance metric calculates the cosine of the angle between two non-zero vectors?",
            "options": [
                "Cosine Similarity (normalized dot product)",
                "Manhattan Distance (L1 norm)",
                "Euclidean Distance (L2 norm)",
                "Hamming Distance over bit vectors"
            ],
            "correct_idx": 0
        },
        {
            "id": 3,
            "question": "Why is hybrid search (dense vectors + sparse BM25) commonly used in enterprise search?",
            "options": [
                "To combine semantic generalization with exact keyword/acronym precision",
                "To reduce physical RAM utilization by 90%",
                "To bypass vector embedding generation entirely",
                "To guarantee deterministic SQL transactional rollbacks"
            ],
            "correct_idx": 0
        }
    ],
    "RAG": [
        {
            "id": 1,
            "question": "In a production RAG pipeline, why is semantic document chunking preferred over arbitrary word cuts?",
            "options": [
                "It preserves complete sentence thoughts and conceptual boundaries",
                "It eliminates the need for vector databases",
                "It enforces strict alphabetization of keywords",
                "It reduces vector dimensions to 128 float values"
            ],
            "correct_idx": 0
        },
        {
            "id": 2,
            "question": "What is the primary role of a reranker model in two-stage retrieval?",
            "options": [
                "Scoring full cross-attention between the query and top-K candidate chunks",
                "Tokenizing raw PDF bytes into binary strings",
                "Converting SQL tables into JSON payloads",
                "Compressing memory buffers on client web browsers"
            ],
            "correct_idx": 0
        },
        {
            "id": 3,
            "question": "How should RAG systems handle situations where retrieved chunk similarity is below a safety threshold?",
            "options": [
                "Admit lack of evidence and provide a grounded fallback statement",
                "Fabricate a creative answer to satisfy the user",
                "Crash the server with a 500 internal error",
                "Retry the same query in an infinite loop"
            ],
            "correct_idx": 0
        }
    ],
    "Kubernetes": [
        {
            "id": 1,
            "question": "What is the smallest deployable computing unit in Kubernetes?",
            "options": [
                "A Pod containing one or more containers",
                "A Docker daemon socket",
                "A Virtual Private Cloud subnet",
                "A NodePort Ingress Rule"
            ],
            "correct_idx": 0
        },
        {
            "id": 2,
            "question": "Which Kubernetes resource manages declarative rolling updates for stateless applications?",
            "options": [
                "Deployment",
                "StatefulSet",
                "DaemonSet",
                "PersistentVolumeClaim"
            ],
            "correct_idx": 0
        },
        {
            "id": 3,
            "question": "What is the purpose of readiness probes in a Kubernetes Pod specification?",
            "options": [
                "Determining when a container is ready to accept incoming network traffic",
                "Restarting crashed containers automatically",
                "Building new container images from source Git repositories",
                "Allocating physical storage volumes dynamically"
            ],
            "correct_idx": 0
        }
    ],
    "Python": [
        {
            "id": 1,
            "question": "What mechanism enables asynchronous concurrency in modern Python web frameworks like FastAPI?",
            "options": [
                "The asyncio event loop with async/await coroutines",
                "Multi-threaded kernel spinlocks",
                "Automatic compiler vectorization",
                "Forking an OS subprocess for every incoming HTTP request"
            ],
            "correct_idx": 0
        },
        {
            "id": 2,
            "question": "In Python, what is the key advantage of generator functions using yield?",
            "options": [
                "Lazy evaluation with constant O(1) memory overhead",
                "Faster floating point matrix multiplication",
                "Disabling the Global Interpreter Lock (GIL)",
                "Encrypting memory buffers automatically"
            ],
            "correct_idx": 0
        },
        {
            "id": 3,
            "question": "How does Python's GIL (Global Interpreter Lock) affect multi-threaded CPU-bound programs?",
            "options": [
                "It allows only one native thread to execute Python bytecode at a time",
                "It distributes bytecode across all CPU cores automatically",
                "It converts standard loops into GPU SIMD instructions",
                "It prevents memory allocation in RAM"
            ],
            "correct_idx": 0
        }
    ]
}

class AssessmentSubmissionRequest(BaseModel):
    skill: str
    answers: List[int]

@router.get("/{skill}/questions")
def get_skill_questions(skill: str):
    # Lookup questions in bank, or generate standard domain questions
    questions = QUESTION_BANK.get(skill)
    if not questions:
        questions = [
            {
                "id": 1,
                "question": f"In a production {skill} architecture, what is the best practice for managing state and persistence?",
                "options": [
                    "Isolate stateful data layers and enforce transactional boundaries",
                    "Store all application state in global frontend variables",
                    "Write state directly into unversioned local text files",
                    "Hardcode database credentials in client-side scripts"
                ],
                "correct_idx": 0
            },
            {
                "id": 2,
                "question": f"Which metric is most critical when benchmarking {skill} microservice performance?",
                "options": [
                    "Latency percentiles (p95/p99) and error rate under load",
                    "Number of comments in source code files",
                    "Physical weight of server hardware",
                    "Number of commits in the default Git branch"
                ],
                "correct_idx": 0
            },
            {
                "id": 3,
                "question": f"How should prerequisite dependency validation be handled when deploying {skill}?",
                "options": [
                    "Enforce strict schema contracts and dependency injection",
                    "Disable all validation checks to speed up startup",
                    "Rely solely on user manual testing after production deploy",
                    "Ignore runtime errors and continue execution"
                ],
                "correct_idx": 0
            }
        ]

    # Return questions without exposing correct_idx to client!
    client_questions = []
    for q in questions:
        client_questions.append({
            "id": q["id"],
            "skill": skill,
            "question": q["question"],
            "options": q["options"]
        })
    return client_questions

@router.post("/submit")
def submit_assessment(
    req: AssessmentSubmissionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    questions = QUESTION_BANK.get(req.skill)
    if not questions:
        # Default questions where index 0 was correct
        correct_indices = [0, 0, 0]
    else:
        correct_indices = [q["correct_idx"] for q in questions]

    total = len(correct_indices)
    score = 0

    # Deterministic server-authoritative scoring
    for idx, user_answer in enumerate(req.answers):
        if idx < len(correct_indices) and user_answer == correct_indices[idx]:
            score += 1

    percentage = round((score / max(total, 1)) * 100, 1)
    passed = percentage >= 66.0

    feedback = (
        f"Mastery confirmed in {req.skill}. Server validated passing score of {percentage}%."
        if passed
        else f"Score was {percentage}%. Review foundational {req.skill} documentation before re-attempting."
    )

    # Persist attempt
    attempt = AssessmentAttempt(
        user_id=current_user.id,
        skill=req.skill,
        score=score,
        total_questions=total,
        percentage=percentage,
        passed=passed,
        feedback=feedback
    )
    db.add(attempt)

    # If passed, automatically mark corresponding roadmap task completed
    if passed:
        matching_task = db.query(RoadmapTaskModel).filter(
            RoadmapTaskModel.user_id == current_user.id,
            RoadmapTaskModel.skill.ilike(f"%{req.skill}%")
        ).first()
        if matching_task:
            matching_task.is_completed = True

    audit = AuditLog(
        user_id=current_user.id,
        action="ASSESSMENT_COMPLETED",
        details=f"Skill: {req.skill}, Score: {score}/{total} ({percentage}%), Passed: {passed}.",
        ip_masked="127.0.0.xxx"
    )
    db.add(audit)
    db.commit()
    db.refresh(attempt)

    return {
        "skill": attempt.skill,
        "score": attempt.score,
        "totalQuestions": attempt.total_questions,
        "percentage": attempt.percentage,
        "passed": attempt.passed,
        "feedback": attempt.feedback,
        "timestamp": attempt.created_at.isoformat()
    }
