import sys
import os

# Include backend path for FastAPI imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../backend')))

from app.main import app
