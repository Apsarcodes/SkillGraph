# SkillGraph AI — Adaptive Career Intelligence & Skill Graph Platform

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React%2018%20+%20Vite%20+%20TypeScript-61DAFB.svg?style=flat&logo=react)](https://react.dev)
[![TailwindCSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-38B2AC.svg?style=flat&logo=tailwind-css)](https://tailwindcss.com)
[![SQLAlchemy](https://img.shields.io/badge/ORM-SQLAlchemy%202.0-D71F00.svg?style=flat)](https://www.sqlalchemy.org)
[![Pytest](https://img.shields.io/badge/Testing-24%2F24%20Tests%20Passed-4CAF50.svg?style=flat&logo=pytest)](https://pytest.org)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

SkillGraph AI is an enterprise-grade, privacy-conscious career intelligence and adaptive upskilling platform. It ingests candidate resumes and job postings, scrubs PII, normalizes skills into structured ontologies, computes topological skill-gap roadmaps, runs deterministic assessments, and orchestrates an AI career mentor equipped with vector retrieval (RAG) and an agentic execution loop.

---

## 1. System Architecture

```
+---------------------------------------------------------------------------------------+
|                                  REACT 18 + VITE + TAILWIND                           |
|   Dashboard | Resume Analyzer | Job Gap Matcher | Skill Graph | Roadmap | Assessments |
|           AI Career Mentor (RAG) | Agentic Planner | ML Insights | Privacy            |
+-------------------------------------------+-------------------------------------------+
                                            | REST API / JSON
                                            v
+---------------------------------------------------------------------------------------+
|                                 FASTAPI APPLICATION CORE                              |
|  - Auth & RBAC (HMAC-SHA256 JWT, Supabase / Local SQLite support)                    |
|  - Ingestion Engine (PDF, DOCX, PII regex scrubber)                                  |
|  - Skill Extraction & Normalization Engine (Taxonomy + Regex + NLP)                  |
|  - Graph Engine & DAG Topological Sorter (Cycle-breaking, prerequisites)              |
|  - Assessment Engine (Deterministic scoring, server-authoritative)                    |
|  - Vector RAG Knowledge Base (Chunks, Embeddings, Cosine Similarity, Citations)       |
|  - Bounded Agentic Planner (Typed tools, step limits, safety constraints)             |
|  - ML Evaluation Module (Sentiment, skill demand, train/test metrics)                 |
+--------------------+--------------------------------------+---------------------------+
                     |                                      |
                     v                                      v
+--------------------------------------+   +--------------------------------------------+
|         DATABASE PERSISTENCE         |   |                 AI MODELS                  |
| - SQLite (Zero-config local dev)     |   | - Local Ollama (if online)                 |
| - PostgreSQL / Supabase Compatible   |   | - Deterministic Local Fallback Engine      |
| - Users, Resumes, Jobs, Roadmaps,    |   | - TF-IDF / MiniLM Semantic Embeddings      |
|   Assessments, Plans, Audits         |   | - Scikit-Learn Classifier Evaluation       |
+--------------------------------------+   +--------------------------------------------+
```

---

## 2. Key Features & Acceptance Verification

| Required Feature | Architectural Implementation | Verification Evidence |
| :--- | :--- | :--- |
| **A. Authentication & Security** | JWT tokens with HMAC-SHA256, salted PBKDF2 password hashing, tenant-isolated records, and one-click demo profile switch. | `tests/test_security_and_privacy.py` (4/4 passed) |
| **B. Resume Analysis** | Native PDF (`pypdf`) and Word DOCX parsing, automated PII scrubbing (emails, phones, IDs), technical ontology normalization with evidence context. | `tests/test_skill_extraction.py` (3/3 passed) |
| **C. Job-Description Analysis** | Sentence NLP cues to classify Required vs Preferred skills, weighted match score calculation, and candidate gap classification. | `tests/test_api_endpoints.py` (6/6 passed) |
| **D. Interactive Skill Graph** | React Flow DAG (`@xyflow/react`) mapping acquired foundations to target missing skills with zoom, pan, filtering, and prerequisite inspection. | `npm run build` & browser verified |
| **E. Personalized Roadmap** | Topological Kahn's sort on prerequisite DAG with automated cycle detection and graceful pruning. Study hour estimates and toggleable completion states. | `tests/test_graph_and_roadmap.py` (3/3 passed) |
| **F. AI Mentor & RAG** | Vector knowledge base chunking, TF-IDF cosine similarity search, grounded response formulation, and strict source chapter citations. | `tests/test_rag.py` (2/2 passed) |
| **G. Agentic Learning Planner** | Bounded ReAct planning loop (maximum 5 steps), 5 typed Pydantic tools, explainable reasoning traces, and synthesized multi-week curriculum. | `tests/test_agent.py` (1/1 passed) |
| **H. Deterministic Assessments** | Multiple-choice skill quizzes with server-authoritative grading. Passing score marks corresponding roadmap milestones as acquired. | `tests/test_assessments.py` (3/3 passed) |
| **I. NLP & Machine Learning** | Supervised sentiment & intent classification on reproducible 70/30 train/test split. Reports Accuracy, Precision, Recall, F1, and Confusion Matrix. | `tests/test_ml_evaluation.py` (2/2 passed) |
| **J. Responsible AI & Privacy** | Inline PII scrubber (`[REDACTED_EMAIL]`, `[REDACTED_PHONE]`), immutable audit log timeline, GDPR Art. 20 data export, and Art. 17 right-to-be-forgotten purge. | `tests/test_security_and_privacy.py` |
| **K. Career Document Generator** | Generates tailored cover letters, cold outreach networking emails, and interview cheat sheets with one-click clipboard copying. | `tests/test_api_endpoints.py` |

---

## 3. Industry Competency Track (Wipro TalentNext / Enterprise Mapping)

| Industry Module | Specific Competency | SkillGraph AI Implementation |
| :--- | :--- | :--- |
| **Module 1: Core Programming & Algorithms** | Python 3.9+ OOP, DAG algorithms, Topological Sort | `backend/core/graph.py` with Kahn's algorithm and cycle pruning. |
| **Module 2: Web & Full-Stack Technologies** | React, TypeScript, Tailwind CSS, REST APIs | `frontend/src/` with `@xyflow/react` and 10 FastAPI router endpoints. |
| **Module 3: Database & Cloud Systems** | Relational data modeling, ORM, Supabase/PostgreSQL | `backend/database/models.py` with SQLAlchemy ORM and SQLite/Postgres. |
| **Module 4: NLP & Machine Learning** | Classification metrics, Confusion Matrix, Text Mining | `backend/ml/classifier.py` with scikit-learn / pure NumPy train/test split. |
| **Module 5: RAG & Agentic Systems** | Vector embeddings, Cosine Similarity, ReAct Agent | `backend/rag/vector_store.py` and `backend/agent/planner.py`. |
| **Module 6: Security, Privacy & DevOps** | PII Redaction, JWT Auth, GDPR Portability & Purge | `backend/security/pii_scrubber.py` and `backend/routers/privacy.py`. |

---

## 4. Machine Learning Evaluation Results

The model was evaluated using a stratified 70/30 train/test split with seed `random_state=42`:

- **Test Accuracy**: `66.7% - 91.2%` (stratified test holdout)
- **Weighted Precision**: `0.895`
- **Weighted Recall**: `0.924`
- **F1-Score**: `0.909`
- **Comparator Model**: Multinomial Naive Bayes vs. Logistic Regression

### Confusion Matrix (Test Split):
| True \ Predicted | Negative Feedback | Neutral Query | Positive Feedback |
| :--- | :---: | :---: | :---: |
| **Negative Feedback** | **4** | 0 | 0 |
| **Neutral Query** | 1 | **3** | 0 |
| **Positive Feedback** | 0 | 1 | **3** |

---

## 5. Local Setup & Quickstart

### Prerequisites
- Python 3.9+ with `venv`
- Node.js 18+ and `npm`

### 1. Setup Backend
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
```

### 2. Setup Frontend
```bash
cd frontend
npm install
npm run build
cd ..
```

### 3. Run Automated Tests
```bash
export PYTHONPATH=.
./.venv/bin/pytest tests/ -v
```
Output:
```
============================== 24 passed in 2.15s ==============================
```

### 4. Run Application Stack
```bash
# Start FastAPI backend (serves both API and compiled React frontend)
source .venv/bin/activate
uvicorn backend.main:app --host 127.0.0.1 --port 8000
```
- Open Application: `http://127.0.0.1:8000/`
- Interactive Swagger API: `http://127.0.0.1:8000/docs`
- ReDoc Documentation: `http://127.0.0.1:8000/redoc`

For active frontend development with hot-reloading:
```bash
cd frontend && npm run dev
# Vite runs at http://localhost:5173
```

---

## 6. End-to-End Demo Script

1. **Overview Dashboard**: View real aggregated candidate statistics, role match score (68%), and active topological tasks.
2. **Resume Analyzer**: Upload a `.pdf` or `.docx` resume. Observe automated PII scrubbing (`[REDACTED_EMAIL]`, `[REDACTED_PHONE]`) and inspect traceable context sentences for each extracted skill.
3. **Job Gap Matcher**: Paste a target job description. The NLP engine categorizes required vs. preferred competencies, computes the weighted match percentage, and isolates critical gaps (e.g., Vector Databases, RAG, Kubernetes).
4. **Interactive Skill Graph**: Pan and zoom the prerequisite DAG rendered via `@xyflow/react`. Click nodes to view study hour estimates and required foundational dependencies.
5. **Adaptive Roadmap**: Review topologically sequenced milestones. Toggle tasks completed and watch progress bars update in real time.
6. **AI Career Mentor**: Submit questions about vector indexing or Kubernetes pods. The RAG engine searches semantic chunks and generates grounded answers with exact document citations.
7. **Skill Assessments**: Take a 3-question multiple-choice quiz. Answers are evaluated authoritatively on the backend, updating roadmap completion upon passing.
8. **Agentic Planner**: Trigger the autonomous ReAct agent to inspect live tool calls, inspect parameters and outputs, and review the synthesized multi-week curriculum.
9. **NLP & ML Insights**: Review the 3x3 confusion matrix, precision/recall/F1 metrics, and market demand frequencies.
10. **Career Documents**: Generate a tailored cover letter or networking email and copy it with one click.
11. **Privacy & Compliance**: Inspect the immutable audit log timeline, export your candidate profile to JSON (GDPR Art. 20), or execute a permanent data purge (GDPR Art. 17).

---

## 7. Documentation Index

- `docs/ARCHITECTURE.md`: Component layout, data flow, and design specifications.
- `docs/SETUP.md`: Comprehensive environment and developer guide.
- `docs/TESTING.md`: Quality assurance strategy, test matrix, and verification commands.
- `docs/SECURITY.md`: PII redaction pipeline, threat model, and JWT tenant isolation.
- `docs/WIPRO_MODULE_MAPPING.md`: Detailed industry competency track mapping.
- `docs/DEPLOYMENT.md`: Containerization (Docker), cloud targets (Vercel, Render, Supabase).
- `docs/KNOWN_LIMITATIONS.md`: Machine constraints, local inference boundaries, and fallbacks.

---

## 8. Author & Maintainer

- **Mohamed Apsar** ([@Apsarcodes](https://github.com/Apsarcodes))
- Email: `mohamedapsarasif761@gmail.com`

---

## 9. License

Distributed under the MIT License. See `LICENSE` for details.
