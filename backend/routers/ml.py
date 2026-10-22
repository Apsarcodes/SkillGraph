from fastapi import APIRouter
from backend.ml.classifier import ml_service

router = APIRouter(prefix="/ml", tags=["Machine Learning"])

@router.get("/metrics")
def get_metrics():
    metrics = ml_service.train_and_evaluate()
    return metrics
