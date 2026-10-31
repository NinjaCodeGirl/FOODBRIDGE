import sys
import os
import traceback

try:
    current_dir = os.path.dirname(os.path.abspath(__file__))
    if current_dir not in sys.path:
        sys.path.insert(0, current_dir)

    from app.main import app
except Exception as e:
    from fastapi import FastAPI
    from fastapi.responses import JSONResponse
    err_tb = traceback.format_exc()
    app = FastAPI()
    
    @app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
    def catch_all(path: str):
        return JSONResponse(status_code=500, content={"error": str(e), "traceback": err_tb})
