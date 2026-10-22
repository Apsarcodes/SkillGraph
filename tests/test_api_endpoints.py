def test_healthcheck(client):
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert data["app"] == "SkillGraph AI"

def test_auth_workflow(client):
    # Register
    reg_payload = {
        "fullName": "Sarah Connor",
        "email": "sarah.connor@example.com",
        "password": "ResistancePassword2025!",
        "targetRole": "Systems Reliability Engineer"
    }
    reg_res = client.post("/api/auth/register", json=reg_payload)
    assert reg_res.status_code == 200
    data = reg_res.json()
    assert "token" in data
    assert data["user"]["email"] == "sarah.connor@example.com"
    token = data["token"]

    # Current user
    me_res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    assert me_res.json()["fullName"] == "Sarah Connor"

def test_job_analysis_workflow(client):
    job_payload = {
        "jobTitle": "Senior Backend & AI Engineer",
        "company": "Nexus Corp",
        "jobDescription": """
        Requirements:
        Must have extensive experience with Python, FastAPI, and Docker.
        Strong background in PostgreSQL and Kubernetes.
        Preferred skills:
        Experience with RAG pipelines, Vector Databases, and PyTorch is a major plus.
        """
    }
    res = client.post("/api/jobs/analyze", json=job_payload)
    assert res.status_code == 200
    data = res.json()
    assert data["jobTitle"] == "Senior Backend & AI Engineer"
    assert data["matchScore"] > 0
    assert "requiredSkills" in data
    assert "Python" in data["requiredSkills"]
    assert len(data["breakdown"]) > 0

def test_graph_and_roadmap_endpoints(client):
    # Graph
    g_res = client.get("/api/graph")
    assert g_res.status_code == 200
    g_data = g_res.json()
    assert "nodes" in g_data
    assert "edges" in g_data
    assert len(g_data["nodes"]) > 0

    # Roadmap
    r_res = client.get("/api/roadmap")
    assert r_res.status_code == 200
    r_data = r_res.json()
    assert len(r_data) > 0
    first_task = r_data[0]
    assert "title" in first_task
    assert "estimatedHours" in first_task

    # Toggle task
    t_res = client.post(f"/api/roadmap/task/{first_task['id']}/toggle", json={"isCompleted": True})
    assert t_res.status_code == 200
    assert t_res.json()["isCompleted"] is True

def test_career_docs_generation(client):
    res = client.post("/api/career-docs/generate", json={
        "type": "cover_letter",
        "targetJob": "Staff Infrastructure Engineer"
    })
    assert res.status_code == 200
    data = res.json()
    assert "content" in data
    assert "Staff Infrastructure Engineer" in data["content"]

def test_privacy_audit_export_and_purge(client):
    # Export
    exp_res = client.get("/api/privacy/export-data")
    assert exp_res.status_code == 200
    exp_data = exp_res.json()
    assert "userProfile" in exp_data
    assert "complianceNotice" in exp_data

    # Audit logs
    aud_res = client.get("/api/privacy/audit-logs")
    assert aud_res.status_code == 200
    assert isinstance(aud_res.json(), list)

    # Purge
    purge_res = client.delete("/api/privacy/purge-data")
    assert purge_res.status_code == 200
    assert purge_res.json()["status"] == "SUCCESS_ALL_USER_DATA_PURGED"
