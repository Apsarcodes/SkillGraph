# Benchmark demo fallback fixtures for instant out-of-the-box operation

DEMO_RESUME_ANALYSIS = {
    "id": "res_demo_821",
    "filename": "Alex_Chen_Software_Engineer_Resume.pdf",
    "uploadedAt": "2026-10-22T04:00:00Z",
    "totalSkillsCount": 16,
    "categoryBreakdown": {
        "languages": 4,
        "frameworks": 4,
        "databases": 3,
        "cloud": 2,
        "tools": 3
    },
    "redactedPreview": """ALEX CHEN — [REDACTED_PHONE] — [REDACTED_EMAIL]
Summary: Full Stack Software Engineer experienced in building scalable web architectures, REST APIs, and microservices.
Technical Skills:
- Languages: Python, TypeScript, JavaScript, SQL
- Frameworks: React, FastAPI, Node.js, Express
- Databases: PostgreSQL, Redis, SQLite
- Cloud & DevOps: Docker, AWS
- Architecture & Tools: Git, REST APIs, CI/CD, Unit Testing""",
    "skills": [
        {"name": "Python", "category": "languages", "confidence": 0.98, "evidence": "Proficient in Python for asynchronous microservice development with FastAPI"},
        {"name": "TypeScript", "category": "languages", "confidence": 0.95, "evidence": "Built complex enterprise dashboards with TypeScript and React"},
        {"name": "JavaScript", "category": "languages", "confidence": 0.99, "evidence": "Core web application logic and asynchronous DOM orchestration"},
        {"name": "SQL", "category": "languages", "confidence": 0.92, "evidence": "Complex multi-table queries, indexing, and transactional integrity"},
        {"name": "React", "category": "frameworks", "confidence": 0.97, "evidence": "Developed responsive client-side SPA with React Hooks and State"},
        {"name": "FastAPI", "category": "frameworks", "confidence": 0.94, "evidence": "Engineered high-throughput REST APIs and Pydantic validation schemas"},
        {"name": "Node.js", "category": "frameworks", "confidence": 0.88, "evidence": "Event-driven backend services and API gateways"},
        {"name": "Express", "category": "frameworks", "confidence": 0.85, "evidence": "Middleware routing and legacy service endpoints"},
        {"name": "PostgreSQL", "category": "databases", "confidence": 0.95, "evidence": "Designed relational schemas and managed migrations with SQLAlchemy"},
        {"name": "Redis", "category": "databases", "confidence": 0.89, "evidence": "Implemented in-memory caching and session synchronization"},
        {"name": "SQLite", "category": "databases", "confidence": 0.96, "evidence": "Embedded local persistent storage for edge nodes"},
        {"name": "Docker", "category": "cloud", "confidence": 0.91, "evidence": "Authored multi-stage Dockerfiles and compose environments"},
        {"name": "AWS", "category": "cloud", "confidence": 0.84, "evidence": "Provisioned EC2 instances, S3 buckets, and IAM roles"},
        {"name": "Git", "category": "tools", "confidence": 0.99, "evidence": "Branching, PR reviews, merge conflict resolution"},
        {"name": "REST APIs", "category": "tools", "confidence": 0.98, "evidence": "RESTful architecture principles, status codes, OpenAPI contracts"},
        {"name": "CI/CD", "category": "tools", "confidence": 0.82, "evidence": "GitHub Actions pipelines for automated linting and test passes"}
    ]
}

DEMO_JOB_ANALYSIS = {
    "id": "job_demo_552",
    "jobTitle": "Senior Full Stack & AI Systems Engineer",
    "company": "CloudScale Technologies",
    "analyzedAt": "2026-10-22T04:00:00Z",
    "matchScore": 68.0,
    "matchedCount": 8,
    "missingCount": 4,
    "partialCount": 2,
    "requiredSkills": ["Python", "TypeScript", "React", "FastAPI", "PostgreSQL", "Docker", "Kubernetes", "RAG"],
    "preferredSkills": ["Redis", "AWS", "GraphQL", "PyTorch", "Vector Databases", "CI/CD"],
    "breakdown": [
        {"skill": "Python", "category": "languages", "status": "MATCHED", "importance": "REQUIRED", "prerequisites": []},
        {"skill": "TypeScript", "category": "languages", "status": "MATCHED", "importance": "REQUIRED", "prerequisites": ["JavaScript"]},
        {"skill": "React", "category": "frameworks", "status": "MATCHED", "importance": "REQUIRED", "prerequisites": ["JavaScript", "HTML/CSS"]},
        {"skill": "FastAPI", "category": "frameworks", "status": "MATCHED", "importance": "REQUIRED", "prerequisites": ["Python"]},
        {"skill": "PostgreSQL", "category": "databases", "status": "MATCHED", "importance": "REQUIRED", "prerequisites": ["SQL"]},
        {"skill": "Docker", "category": "cloud", "status": "MATCHED", "importance": "REQUIRED", "prerequisites": ["Linux"]},
        {"skill": "Kubernetes", "category": "cloud", "status": "MISSING", "importance": "REQUIRED", "prerequisites": ["Docker", "Linux"]},
        {"skill": "RAG", "category": "tools", "status": "MISSING", "importance": "REQUIRED", "prerequisites": ["Python", "Vector Databases"]},
        {"skill": "Vector Databases", "category": "databases", "status": "MISSING", "importance": "PREFERRED", "prerequisites": ["PostgreSQL"]},
        {"skill": "PyTorch", "category": "frameworks", "status": "MISSING", "importance": "PREFERRED", "prerequisites": ["Python", "Linear Algebra"]},
        {"skill": "GraphQL", "category": "tools", "status": "PARTIAL", "importance": "PREFERRED", "prerequisites": ["REST APIs"]},
        {"skill": "AWS", "category": "cloud", "status": "PARTIAL", "importance": "PREFERRED", "prerequisites": ["Linux"]},
        {"skill": "Redis", "category": "databases", "status": "MATCHED", "importance": "PREFERRED", "prerequisites": []},
        {"skill": "CI/CD", "category": "tools", "status": "MATCHED", "importance": "PREFERRED", "prerequisites": ["Git"]}
    ]
}
