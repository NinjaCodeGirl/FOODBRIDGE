"""
FoodBridge API — Vercel Serverless Entry Point
Served at /api by Vercel's Python runtime.
"""
import sys
import os
import traceback

# Add api/ directory to path so `from _app.xxx import` works
_api_dir = os.path.dirname(os.path.abspath(__file__))
if _api_dir not in sys.path:
    sys.path.insert(0, _api_dir)

try:
    from _app.main import app  # noqa: F401
except Exception as _startup_error:
    from fastapi import FastAPI, Request
    from fastapi.responses import JSONResponse
    _tb = traceback.format_exc()
    app = FastAPI(title="FoodBridge API — startup error")

    @app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"])
    async def _error_handler(path: str, request: Request):
        return JSONResponse(
            status_code=500,
            content={
                "status": "startup_error",
                "error": str(_startup_error),
                "traceback": _tb,
                "path": path,
            },
        )
