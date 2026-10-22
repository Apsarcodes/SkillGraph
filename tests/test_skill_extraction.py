from backend.ml.skill_extractor import SkillExtractor

def test_extract_skills_from_text():
    sample_text = """
    Experienced software engineer with 5 years in Python and TypeScript.
    Built asynchronous REST APIs using FastAPI and stateful React interfaces.
    Configured PostgreSQL database schemas and deployed containerized pods on Docker and Kubernetes.
    Integrated RAG pipelines with vector databases.
    """
    extracted = SkillExtractor.extract_skills_with_evidence(sample_text)
    names = {s["name"] for s in extracted}

    assert "Python" in names
    assert "TypeScript" in names
    assert "FastAPI" in names
    assert "React" in names
    assert "PostgreSQL" in names
    assert "Docker" in names
    assert "Kubernetes" in names
    assert "RAG" in names
    assert "Vector Databases" in names

    # Verify evidence traceability
    for s in extracted:
        assert len(s["evidence"]) > 5
        assert s["category"] in ["languages", "frameworks", "databases", "cloud", "tools"]

def test_alias_normalization():
    alias_text = "Proficient in k8s, postgres, node, and reactjs."
    extracted = SkillExtractor.extract_skills_with_evidence(alias_text)
    names = {s["name"] for s in extracted}

    assert "Kubernetes" in names
    assert "PostgreSQL" in names
    assert "Node.js" in names
    assert "React" in names

def test_empty_text_handling():
    assert SkillExtractor.extract_skills_with_evidence("") == []
    assert SkillExtractor.extract_skills_with_evidence("   ") == []
