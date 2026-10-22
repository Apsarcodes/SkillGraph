from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from backend.database.session import get_db
from backend.database.models import User, AgentPlanModel, AuditLog
from backend.core.security import get_current_user
from backend.agent.planner import agent_planner

router = APIRouter(prefix="/agent", tags=["Agentic Planner"])

class RunAgentPlanRequest(BaseModel):
    objective: str = "Generate an optimized upskilling roadmap for Senior Full Stack & AI Systems Engineer"

@router.post("/plan")
def run_plan(
    req: RunAgentPlanRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    plan_result = agent_planner.execute_plan(req.objective, current_user.id)

    # Persist agent plan run
    plan_model = AgentPlanModel(
        user_id=current_user.id,
        objective=req.objective,
        total_iterations=plan_result.totalIterations,
        steps_json=[s.dict() for s in plan_result.completedSteps],
        recommendations_json=plan_result.finalRecommendations,
        curriculum_json=plan_result.generatedCurriculum
    )
    db.add(plan_model)

    audit = AuditLog(
        user_id=current_user.id,
        action="AGENT_PLAN_EXECUTED",
        details=f"Iterations: {plan_result.totalIterations}. Objective: {req.objective[:80]}",
        ip_masked="127.0.0.xxx"
    )
    db.add(audit)
    db.commit()

    return plan_result.dict()
