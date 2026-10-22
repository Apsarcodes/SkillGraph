# SkillGraph AI — Security & Privacy Architecture

## 1. Threat Model & Boundaries

SkillGraph AI operates as a career intelligence platform that processes sensitive candidate materials, including resumes, job search history, assessment scores, and educational records.

The system is architected around these strict security boundaries:
1. **Zero Raw Resume Storage**: Resumes pass through an inline PII scrubber before parsing and persistence. Raw contact details (email, phone, address, government IDs) are masked (`[REDACTED_EMAIL]`, `[REDACTED_PHONE]`) to eliminate unintended identity exposure.
2. **Stateless Password & Credential Handling**: All passwords are encrypted using one-way cryptographic hashing (bcrypt with salt rounds). Plaintext passwords are never logged, echoed, or stored.
3. **Bounded Agent Tooling**: The AI agent operates in a strictly typed execution sandbox. It cannot execute arbitrary OS commands, make unwhitelisted network calls, or access unauthorized tables.
4. **Tenant Isolation**: Every database query on user-specific resources (resumes, roadmaps, assessment attempts) enforces `WHERE user_id = current_user.id` or matching foreign keys. Users cannot query or mutate peer candidate records.
5. **Deterministic Assessment Scoring**: Assessment grading is strictly computed on the server. The client only sends the submitted option indices (`answers: [0, 2, 1]`); score calculation, passing thresholds, and roadmap updates occur on the backend, preventing frontend manipulation of scores.

---

## 2. PII Redaction Pipeline

SkillGraph AI includes an automated regex and pattern recognition engine in `backend/security/pii_scrubber.py`:

```
Raw Text Uploaded
       |
       v
+------------------------------------+
|  Email Scrubber: [EMAIL_PATTERN]   | -> Replaces with [REDACTED_EMAIL]
+------------------------------------+
       |
       v
+------------------------------------+
|  Phone Scrubber: [PHONE_PATTERN]   | -> Replaces with [REDACTED_PHONE]
+------------------------------------+
       |
       v
+------------------------------------+
|  SSN/Gov ID: [NATIONAL_ID_PATTERN] | -> Replaces with [REDACTED_ID]
+------------------------------------+
       |
       v
Safe Redacted Text -> Skill Extraction & Embedding Vectorizer
```

---

## 3. Authentication & JWT Tokens

- Tokens are signed with standard HMAC-SHA256 (`HS256`).
- Expiration is set to 24 hours (`1440 minutes`).
- Requests validate the `Authorization: Bearer <token>` header.
- For exploration, a demo mode switch allows users to inspect pre-seeded anonymous candidate data clearly marked with `demo_mode: true`.

---

## 4. Privacy Rights & Compliance Controls

Under GDPR / CCPA principles, users have access to:
- **Right to Access / Data Export**: `GET /api/privacy/export-data` dumps all user records, assessments, and roadmaps as structured JSON.
- **Right to be Forgotten / Account Purge**: `DELETE /api/privacy/purge-data` cascades and permanently deletes all candidate resumes, roadmap tasks, and assessment logs.
- **Audit Logging**: Sensitive operations (document upload, assessment submission, data purge) emit immutable events to the `audit_logs` database table.
