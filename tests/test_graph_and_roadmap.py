from backend.core.graph import GraphEngine

def test_build_skill_graph():
    user_skills = {"Python", "SQL"}
    target_skills = {"FastAPI", "PostgreSQL"}

    nodes, edges = GraphEngine.build_skill_graph(user_skills, target_skills)

    node_ids = {n["id"] for n in nodes}
    assert "python" in node_ids
    assert "fastapi" in node_ids
    assert "postgresql" in node_ids

    # Check status
    for n in nodes:
        if n["label"] in user_skills:
            assert n["status"] == "acquired"
        elif n["label"] in target_skills:
            assert n["status"] == "missing"

def test_topological_sort_linear():
    missing_skills = ["FastAPI", "RAG", "Vector Databases"]
    user_skills = {"Python", "PostgreSQL"}

    tasks, cycles = GraphEngine.topological_sort_roadmap(missing_skills, user_skills)

    ordered_skills = [t["skill"] for t in tasks]
    assert len(cycles) == 0

    # Vector Databases must come before RAG because Vector Databases is a prerequisite
    assert ordered_skills.index("Vector Databases") < ordered_skills.index("RAG")

def test_circular_dependency_graceful_resolution():
    # Artificially inject a circular dependency: A -> B -> A
    custom_prereqs = {
        "SkillA": ["SkillB"],
        "SkillB": ["SkillA"],
    }
    missing_skills = ["SkillA", "SkillB"]
    user_skills = set()

    tasks, cycles = GraphEngine.topological_sort_roadmap(missing_skills, user_skills, custom_prerequisites=custom_prereqs)

    ordered_skills = [t["skill"] for t in tasks]
    assert len(ordered_skills) == 2
    assert len(cycles) > 0  # Cycle detected and gracefully resolved!
