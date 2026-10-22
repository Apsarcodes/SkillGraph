# SkillGraph AI — Known Limitations & Operational Boundaries

In accordance with transparent engineering principles, this document notes all boundaries, environment considerations, and operational constraints observed during architecture and testing.

## 1. Hardware & Local Inference Constraints
- **Host Hardware Profile**: 2017 MacBook Air, 1.8 GHz Dual-Core Intel Core i5, 8 GB 1600 MHz LPDDR3 RAM, macOS Sequoia.
- **Local LLM Considerations**: Local inference with large models (e.g. 7B+ parameters) exceeds the memory headroom of an 8GB machine sharing RAM with the OS and browser. Therefore, SkillGraph AI:
  1. Configures support for ultra-lightweight models (such as `llama3.2:1b` or `phi3:mini`).
  2. Embeds an always-available, zero-dependency **Deterministic Fallback Engine** that generates grounded curriculum recommendations, assessment evaluations, and career guidance without requiring an active local LLM daemon or cloud billing keys.
- **RAG Embeddings**: Uses optimized vector representations (TF-IDF and cosine similarity embeddings with vocabulary projection or Sentence Transformers when available) to ensure sub-50ms search times on Intel dual-core architectures without causing thermal throttling or swap thrashing.

## 2. Document Extraction Boundaries
- **Supported Formats**: `.pdf` (text-based) and `.docx` (Microsoft Word OpenXML).
- **Scanned Resumes**: Optical Character Recognition (OCR) for scanned image-only PDFs (e.g. via Tesseract) requires external system binaries (`tesseract-ocr`) and is treated as an optional enhancement; text-based PDF/Word resumes are extracted natively.
- **Document Size Limits**: Maximum upload payload is capped at 5 MB to prevent Denial of Service (DoS) attacks and buffer exhaustions.

## 3. Assessment & Skill Taxonomy
- **Taxonomy Depth**: SkillGraph AI tracks over 120+ mainstream industry engineering skills across Languages, Frameworks, Databases, Cloud/DevOps, and Architecture. Highly proprietary internal company tools are mapped to their closest open-source counterparts.
- **Deterministic Assessment Scoring**: Questions are presently multiple-choice. Free-form code execution sandboxing (e.g. executing untrusted Python in Docker) is deliberately omitted to prevent remote code execution vulnerabilities on local developer machines.

## 4. Supabase vs. SQLite Dual-Mode
- Local development defaults to SQLite (`sqlite:///./skillgraph.db`) to enable zero-credential, instant out-of-the-box operation.
- In production, setting `DATABASE_URL=postgresql://...` activates PostgreSQL / Supabase mode with relational concurrency.
