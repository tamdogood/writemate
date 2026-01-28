from pathlib import Path
from pydantic_settings import BaseSettings
from functools import lru_cache

# Compute the absolute path to the .env file relative to this config file
# config.py is in backend/app/, so .env is in backend/ (parent directory)
ENV_FILE_PATH = Path(__file__).resolve().parent.parent / ".env"

# Diagnostic: Print .env file path and existence on module load
print(f"[CONFIG] .env file path: {ENV_FILE_PATH}")
print(f"[CONFIG] .env file exists: {ENV_FILE_PATH.exists()}")


class Settings(BaseSettings):
    openai_api_key: str
    llm_model: str = "gpt-5.2"
    llm_model_quick: str = "gpt-5-mini"
    supabase_url: str
    supabase_service_key: str

    class Config:
        env_file = str(ENV_FILE_PATH)


@lru_cache()
def get_settings() -> Settings:
    settings = Settings()
    # Diagnostic: Show API key is loaded (first 10 chars only for security)
    api_key_preview = settings.openai_api_key[:10] if settings.openai_api_key else "EMPTY"
    print(f"[CONFIG] Settings loaded successfully!")
    print(f"[CONFIG] API key starts with: {api_key_preview}...")
    print(f"[CONFIG] LLM model: {settings.llm_model}")
    return settings
