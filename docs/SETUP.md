# SkillGraph AI — Comprehensive Setup & Developer Guide

## 1. System Requirements

- **Operating System**: macOS (tested on macOS Sequoia 15.x x86_64 / arm64), Linux (Ubuntu 22.04+), or Windows (via WSL2).
- **RAM**: Minimum 8 GB RAM. The architecture is engineered to run smoothly on lightweight hardware.
- **Python**: 3.9+ with `pip` and `venv`.
- **Node.js**: v18.x or v20.x+ with `npm`.
- **Optional**: Ollama for local LLM inference (e.g. `llama3.2:1b` or `phi3:mini`). A deterministic AI fallback engine is embedded directly for zero-dependency execution.

---

## 2. Fast-Track Local Installation

### Step A: Clone and Prepare Workspace
```bash
cd SkillGraph
```

### Step B: Backend Python Virtual Environment
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
```

### Step C: Frontend Setup
```bash
cd frontend
npm install
cd ..
```

---

## 3. Configuration & Environment Variables

Copy the provided example environment file:
```bash
cp .env.example .env
```

### Environment Variables Reference:
```env
# Application Settings
ENVIRONMENT=development
APP_NAME=SkillGraph AI
DEBUG=true
PORT=8000
FRONTEND_PORT=5173

# Database Persistence
# Default uses local SQLite. For PostgreSQL / Supabase, supply standard connection string:
# DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres
DATABASE_URL=sqlite:///./skillgraph.db

# Authentication & Security
SECRET_KEY=skillgraph-super-secret-jwt-key-2025-production-grade
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# AI & LLM Configuration
# Set OLLAMA_BASE_URL to point to your local Ollama daemon
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2:1b
# When Ollama is offline or unavailable, SkillGraph AI seamlessly uses its deterministic AI Engine
AI_FALLBACK_MODE=true

# Privacy & Compliance
ENABLE_PII_REDACTION=true
LOG_RAW_RESUMES=false
```

---

## 4. Running the Development Stack

### Terminal 1: Backend API (FastAPI)
```bash
source .venv/bin/activate
uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
```
- Swagger Interactive Documentation: `http://127.0.0.1:8000/docs`
- ReDoc API Documentation: `http://127.0.0.1:8000/redoc`
- Healthcheck Endpoint: `http://127.0.0.1:8000/api/health`

### Terminal 2: Frontend (Vite + React)
```bash
cd frontend
npm run dev
```
- Application UI: `http://localhost:5173`

---

## 5. Running with Local Ollama (Optional)

SkillGraph AI can utilize a local Ollama instance for conversational mentor replies and dynamic plan synthesis:
```bash
# Start Ollama
ollama serve

# Pull a lightweight model suited for 8GB RAM:
ollama pull llama3.2:1b
```
If Ollama is not running, the application logs `Ollama unreachable -> using Deterministic Mentor Engine` and operates with zero disruption.
