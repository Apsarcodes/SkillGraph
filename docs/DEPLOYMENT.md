# SkillGraph AI — Deployment & Infrastructure Guide

## 1. Local and Self-Hosted Deployment

SkillGraph AI is designed with cloud-native 12-factor application standards. It can run as independent microservices or containerized workloads.

### Process Layout:
1. **API Service (FastAPI)**:
   - Command: `uvicorn backend.main:app --host 0.0.0.0 --port 8000`
   - Handles API traffic, resume parsing, database ORM operations, RAG search, and agentic workflows.
2. **Static Web Frontend (React + Vite)**:
   - Build: `cd frontend && npm run build`
   - Production Artifact: `frontend/dist/`
   - Serve via Nginx, Caddy, Vercel, or FastAPI static file mount.
3. **Database**:
   - Local: SQLite file `skillgraph.db` (auto-created on startup).
   - Cloud: PostgreSQL (Supabase / AWS RDS / Neon / Render) with connection string passed to `DATABASE_URL`.

---

## 2. Containerized Deployment (Docker & Docker Compose)

A complete production `Dockerfile` and `docker-compose.yml` are provided in the repository root.

```bash
# Build and run entire multi-container stack
docker-compose up --build -d
```

### Services:
- `backend`: FastAPI server listening on port 8000.
- `frontend`: Nginx serving the compiled React bundle on port 80 (mapped to 5173).
- `db`: PostgreSQL 16 Alpine persistent storage.

---

## 3. Cloud Deployment Targets

### A. Vercel / Netlify (Frontend)
- Set Root Directory: `frontend`
- Build Command: `npm run build`
- Output Directory: `dist`
- Set `VITE_API_URL` to backend service URL.

### B. Render / Railway / Fly.io (Backend)
- Build Command: `pip install -r backend/requirements.txt`
- Start Command: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
- Set environment variables: `SECRET_KEY`, `DATABASE_URL`, `AI_FALLBACK_MODE=true`.

### C. Supabase Integration
1. Create a Supabase project at `https://database.new`.
2. Retrieve connection string from **Project Settings > Database > Connection Pooling (URI)**.
3. Supply as `DATABASE_URL` in environment. SkillGraph AI's SQLAlchemy models will auto-generate all required tables.
