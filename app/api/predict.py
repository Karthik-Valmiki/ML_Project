import time
from fastapi import APIRouter, HTTPException
from app.schemas.prediction import (
    PredictRequest, PredictionResponse,
    BatchPredictRequest, BatchPredictionResponse
)
from app.services.model_service import model_service

router = APIRouter(prefix="", tags=["Prediction Engine"])

@router.get("/scenarios")
def list_scenarios():
    return [
        {
            "id": s["id"],
            "title": s["title"],
            "description": s["description"],
            "ground_truth_class": s["ground_truth_class"],
            "ground_truth_label": s["ground_truth_label"]
        }
        for s in model_service.scenarios
    ]

@router.get("/scenarios/{scenario_id}")
def get_scenario_detail(scenario_id: str):
    for s in model_service.scenarios:
        if s["id"] == scenario_id:
            return s
    raise HTTPException(status_code=404, detail="Scenario not found.")

@router.post("/predict", response_model=PredictionResponse)
def predict_single_flow(request: PredictRequest):
    return model_service.predict(request.features, request.model_type)

@router.post("/predict/batch", response_model=BatchPredictionResponse)
def predict_batch_flows(request: BatchPredictRequest):
    results = []
    bot_count = 0
    t0 = time.time()
    
    for sample in request.samples:
        res = model_service.predict(sample, request.model_type)
        if res["label"] == 1:
            bot_count += 1
        results.append(res)
        
    total_time = (time.time() - t0) * 1000
    return {
        "total_samples": len(results),
        "bots_detected": bot_count,
        "normal_detected": len(results) - bot_count,
        "bot_percentage": f"{(bot_count / len(results) * 100):.2f}%" if results else "0%",
        "total_inference_time_ms": round(total_time, 2),
        "predictions": results
    }

