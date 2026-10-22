# SkillGraph AI — System Architecture & Design Specification

## 1. Executive Overview

SkillGraph AI is an enterprise-grade, privacy-conscious AI-powered career intelligence and adaptive upskilling platform. It ingests unstructured candidate resumes and job postings, normalizes skills into structured ontologies, computes topological skill-gap roadmaps, runs deterministic assessments, and orchestrates an AI career mentor equipped with vector retrieval (RAG) and an agentic execution loop.

```
+---------------------------------------------------------------------------------------+
|                                    REACT + VITE UI                                    |
|   Dashboard | Resume Analyzer | Job Gap Matcher | Skill Graph | Roadmap | Assessments |
|           AI Career Mentor (RAG) | Agentic Planner | ML Insights | Privacy            |
+-------------------------------------------+-------------------------------------------+
                                            | REST API / JSON
                                            v
+---------------------------------------------------------------------------------------+
|                                 FASTAPI APPLICATION CORE                              |
|  - Auth & RBAC (JWT / Supabase Auth compatible)                                       |
|  - Resume & Document Ingestion Engine (PDF, DOCX, PII redaction)                      |
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

## 2. Component Architecture

### A. Presentation Layer (Frontend)
- **Framework**: React 18+ with TypeScript and Vite.
- **Styling**: Tailwind CSS for responsive SaaS aesthetics with dark/light visual contrast.
- **Graph Visualization**: React Flow (`@xyflow/react`) rendering interactive Directed Acyclic Graphs (DAGs) of skills, requirements, and prerequisite chains.
- **State & Communication**: Axios client with interceptors for JWT token injection and standard error dispatch.
- **Demo Mode**: Explicit indicator banner allowing instant exploration with sample data without backend lock-in.

### B. Application Layer (FastAPI Backend)
- **API Router**:
  - `/api/auth`: Registration, login, current user verification, demo profile switcher.
  - `/api/resumes`: Multipart upload for `.pdf` and `.docx`, PII redaction, skill categorization.
  - `/api/jobs`: Text and file ingestion, required vs. preferred extraction, candidate matching.
  - `/api/graph`: Dynamic nodes and edges derived from database skills and target role prerequisites.
  - `/api/roadmap`: Topological ordering of missing skills with effort estimates, status toggling, and circular dependency resolution.
  - `/api/assessments`: Multiple-choice skill question generator, server-authoritative submission, and score persistence.
  - `/api/rag`: Vector store query with grounded context retrieval, similarity scores, and source citations.
  - `/api/agent`: Bounded ReAct-style agent with 5 typed tools (skill analysis, resource lookup, quiz generator, evaluator, plan updater).
  - `/api/ml`: Model training, confusion matrix calculation, classification report generation, and skill frequency distribution.
  - `/api/career-docs`: Professional email and cover letter generator with fallback templates.
  - `/api/privacy`: PII audit logs, export user data, and compliance deletion endpoints.

### C. Data Persistence Layer
- **Engine**: SQLAlchemy 2.0 ORM.
- **Local Dev**: Zero-configuration SQLite (`skillgraph.db`) with automatic schema initialization on startup.
- **Production Option**: Supabase PostgreSQL connection via `DATABASE_URL` environment variable.
- **Entities**:
  - `User`: Credentials, role, profile details.
  - `Resume`: Raw filename, redacted text, parsed skills, upload timestamp.
  - `JobPosting`: Title, company, raw description, parsed required/preferred skills.
  - `JobMatch`: Relation linking user resume to target job with match score and classified gaps.
  - `SkillNode` & `SkillPrerequisite`: Graph nodes and directed edges.
  - `RoadmapTask`: Generated learning tasks, order index, target hours, completion boolean.
  - `AssessmentAttempt`: Skill, total questions, score, passed flag, timestamp.
  - `AgentPlan`: Persisted execution runs, tool invocations, and generated plans.
  - `AuditLog`: Action tracking for privacy compliance and security monitoring.

---

## 3. Core Algorithms & Logic

### 1. Skill Extraction & Normalization
Uses an extensive taxonomy mapped across 5 core categories:
- **Languages**: Python, TypeScript, JavaScript, Go, Rust, Java, C++, SQL, HTML/CSS.
- **Frameworks & Libraries**: React, FastAPI, Node.js, Express, Next.js, Django, PyTorch, Scikit-learn.
- **Databases**: PostgreSQL, MongoDB, Redis, MySQL, SQLite, Supabase, Cassandra.
- **Cloud & DevOps**: AWS, Docker, Kubernetes, CI/CD, Terraform, GCP, Azure, Linux.
- **Tools & Architecture**: Git, REST APIs, GraphQL, Microservices, RAG, System Design, Unit Testing.

Extraction pipeline:
1. Document text is extracted via `pypdf` (PDF) or `docx` (Word).
2. PII detector redacts emails, phone numbers, and potential personal credentials.
3. Regex word boundary matching with canonical aliasing (e.g. `k8s` -> `Kubernetes`, `react.js` -> `React`).
4. Evidence sentences are captured and linked to each normalized skill.

### 2. Job-Skill Gap Matching
- Identifies **Required** vs. **Preferred** skills using sentence-level NLP cues ("must have", "required", "preferred", "nice to have", "plus").
- Computes:
  $$\text{Match Score} = \frac{2 \times |\text{User} \cap \text{Required}| + |\text{User} \cap \text{Preferred}|}{2 \times |\text{Required}| + |\text{Preferred}|} \times 100$$
- Classifies each skill into: `MATCHED`, `PARTIAL`, or `MISSING`.

### 3. Topological Roadmap Sorting & Cycle Detection
- Builds an adjacency list from missing target skills and prerequisites.
- Runs Kahn's algorithm or DFS with visited states (`UNVISITED`, `VISITING`, `VISITED`).
- If a cycle is detected, the cycle edge is logged and gracefully pruned, preventing runtime crashes while maintaining logical progression.

### 4. Vector RAG Engine
- Ingests curated educational reference materials into semantic chunks (250-400 words with 50-word overlap).
- Embeddings computed with TF-IDF cosine similarity or MiniLM vector distance.
- Top-K retrieval matches queries, assembling grounded context with exact source chapter/document attribution.
- Supports local Ollama generation or deterministic template synthesis with explicit citations.

### 5. Bounded Agentic Execution Loop
- Enforces a maximum step budget ($N \le 6$) to prevent infinite loops.
- Available tools:
  1. `analyze_skill_gap(user_id, role)`
  2. `search_curriculum_resources(skill)`
  3. `generate_skill_quiz(skill, difficulty)`
  4. `evaluate_quiz_attempt(answers)`
  5. `update_user_roadmap(skill, action)`
- All tool calls pass through Pydantic parameter validators.
- Final output synthesizes user-facing reasoning without leaking private prompt directives.
