# SkillGraph AI — Quality Assurance & Testing Suite

## 1. Testing Strategy

The SkillGraph AI testing suite verifies every layer of the application:
1. **Unit Tests**:
   - PII scrubbing and redaction edge cases.
   - Skill extraction, canonical aliasing, and categorizations.
   - Job gap classification (Required vs Preferred, Matched, Partial, Missing).
   - Topological sorting with cycle detection and DAG resolution.
   - Server-authoritative assessment grading.
2. **Integration Tests**:
   - User registration, authentication, JWT verification, and unauthorized blocking.
   - File upload handling (`.pdf`, `.docx`, malformed files, oversized files).
   - Vector RAG context retrieval and citation verification.
   - Agent tool invocation bounds and step limit enforcement.
   - Supervised ML classification evaluation and confusion matrix generation.
3. **Frontend Production Build Verification**:
   - TypeScript static type checking.
   - Vite production bundle compilation.

---

## 2. Test Execution Commands

### Running Backend Unit & Integration Tests
```bash
source .venv/bin/activate
pytest tests/ -v
```

### Running Specific Test Modules
```bash
# Test Skill Extraction & Parsing
pytest tests/test_skill_extraction.py -v

# Test Graph & Topological Roadmap Logic
pytest tests/test_graph_and_roadmap.py -v

# Test Assessments & Server Authoritative Grading
pytest tests/test_assessments.py -v

# Test RAG Vector Store & Citations
pytest tests/test_rag.py -v

# Test Agent Tool Guardrails
pytest tests/test_agent.py -v

# Test Security & PII Redaction
pytest tests/test_security_and_privacy.py -v

# Test Supervised ML Model Evaluation
pytest tests/test_ml_evaluation.py -v
```

### Running Frontend Type-Check & Build
```bash
cd frontend
npm run build
```
