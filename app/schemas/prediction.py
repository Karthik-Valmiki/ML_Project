from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field

class PredictRequest(BaseModel):
    features: Dict[str, float] = Field(
        ..., 
        description="Feature dictionary mapping 61 network flow variables to values."
    )
    model_type: Optional[str] = Field(
        "champion", 
        description="Model identifier: 'champion' (Random Forest) or 'baseline' (Logistic Regression)"
    )

class PredictionResponse(BaseModel):
    prediction: str
    label: int
    confidence: float
    confidence_percentage: str
    action: str
    probabilities: Dict[str, float]
    model_used: str
    inference_time_ms: float

class BatchPredictRequest(BaseModel):
    samples: List[Dict[str, float]]
    model_type: Optional[str] = "champion"

class BatchPredictionResponse(BaseModel):
    total_samples: int
    bots_detected: int
    normal_detected: int
    bot_percentage: str
    total_inference_time_ms: float
    predictions: List[Dict[str, Any]]
