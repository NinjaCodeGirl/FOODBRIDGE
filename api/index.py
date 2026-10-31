import sys
import os
import traceback

# Ensure the api/ directory itself is on the path so `from app.xxx import` works
_api_dir = os.path.dirname(os.path.abspath(__file__))
if _api_dir not in sys.path:
    sys.path.insert(0, _api_dir)

try:
    from app.main import app
except Exception as _e:
    from fastapi import FastAPI, Request
    from fastapi.responses import JSONResponse
    _tb = traceback.format_exc()
    app = FastAPI(title="FoodBridge API (error mode)")

    @app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"])
    async def catch_all(path: str, request: Request):
        return JSONResponse(
            status_code=500,
            content={"error": str(_e), "traceback": _tb, "path": path}
        )
