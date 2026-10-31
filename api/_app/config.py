import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "FoodBridge Connect"
    ENV: str = "development"
    PORT: int = 8000
    SECRET_KEY: str = "foodbridge-super-secret-key-2026"
    
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "AIzaSyBLT4RPnGRu2xbq6P-jwLiSIASTev-R46w")
    DEEPGRAM_API_KEY: str = os.getenv("DEEPGRAM_API_KEY", "c6a0aff2cfbc4814bcf5176bb6b431f87a087d79")
    NEXT_PUBLIC_API_URL: str = os.getenv("NEXT_PUBLIC_API_URL", "https://huge-mangos-make.loca.lt")
    
    AZURE_AI_ENDPOINT: str = os.getenv("AZURE_AI_ENDPOINT", "https://foodbridge-ai.cognitiveservices.azure.com")
    AZURE_AI_KEY: str = os.getenv("AZURE_AI_KEY", "dummy-azure-ai-key")
    AZURE_MAPS_KEY: str = os.getenv("AZURE_MAPS_KEY", "dummy-azure-maps-key")
    
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "https://eajgyicvghlmumtjnvaf.supabase.co")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "sb_publishable_EH7JXtr2G74QSB_4DafweA_HdR6LtIj")
    
    CORS_ORIGINS: list = [
        "*"
    ]

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
