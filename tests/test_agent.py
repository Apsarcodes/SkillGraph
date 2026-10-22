from backend.agent.planner import agent_planner

def test_agent_plan_execution_bounds():
    objective = "Upskill to AI Infrastructure Engineer"
    result = agent_planner.execute_plan(objective)

    assert result.objective == objective
    assert result.totalIterations <= 5  # Bounded iteration count
    assert len(result.completedSteps) >= 3

    step_tools = [s.tool for s in result.completedSteps]
    assert "analyze_skill_gap" in step_tools
    assert "search_curriculum_resources" in step_tools
    assert "update_user_roadmap" in step_tools

    # Verify no private chain-of-thought leaked, only clean reasoning
    for step in result.completedSteps:
        assert len(step.reasoning) > 10
        assert "system prompt" not in step.reasoning.lower()

    assert len(result.finalRecommendations) > 0
    assert len(result.generatedCurriculum) > 0
