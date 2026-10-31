import sys
import os

# Include backend path for FastAPI imports
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
backend_dir = os.path.join(base_dir, 'backend')

if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)
if base_dir not in sys.path:
    sys.path.insert(1, base_dir)

from app.main import app
