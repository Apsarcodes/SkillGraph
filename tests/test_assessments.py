def test_assessment_questions_hide_answers(client):
    res = client.get("/api/assessments/Vector Databases/questions")
    assert res.status_code == 200
    questions = res.json()
    assert len(questions) == 3
    for q in questions:
        assert "question" in q
        assert "options" in q
        assert len(q["options"]) == 4
        # Authoritative answer index must NOT be leaked to client
        assert "correct_idx" not in q

def test_assessment_scoring_authoritative(client):
    # Submitting all correct answers (option 0 in question bank)
    res = client.post("/api/assessments/submit", json={
        "skill": "Vector Databases",
        "answers": [0, 0, 0]
    })
    assert res.status_code == 200
    data = res.json()
    assert data["score"] == 3
    assert data["percentage"] == 100.0
    assert data["passed"] is True

def test_assessment_failing_score(client):
    # Submitting all incorrect answers (options [1, 2, 3])
    res = client.post("/api/assessments/submit", json={
        "skill": "Vector Databases",
        "answers": [1, 2, 3]
    })
    assert res.status_code == 200
    data = res.json()
    assert data["score"] == 0
    assert data["passed"] is False
