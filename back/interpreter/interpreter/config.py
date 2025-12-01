import os

def _require_env(name: str) -> str:
    value = os.environ.get(name)
    if not value:
        raise RuntimeError(f"Missing required environment variable: {name}")
    return value

def _optional_env(name: str, default: str) -> str:
    return os.environ.get(name, default)

PORT = int(_optional_env("PORT", "8001"))
BACK_API_URL = _require_env("BACK_API_URL")
MODEL_NAME = _optional_env("MODEL_NAME", "microsoft/Phi-3-mini-4k-instruct")
