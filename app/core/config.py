import os
from dataclasses import dataclass

@dataclass
class Settings:
    PROJECT_NAME: str = "Pyanm: Network Flow & Bot Detection Platform"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    
    BASE_DIR: str = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    MODELS_DIR: str = os.path.join(BASE_DIR, "models")
    CLEANED_DIR: str = os.path.join(BASE_DIR, "Cleaned_DS")
    FRONTEND_DIR: str = os.path.join(BASE_DIR, "frontend")

settings = Settings()
