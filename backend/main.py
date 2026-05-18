from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.dashboard import get_dashboard_data

app = FastAPI(title="BankIQ Enterprise API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/dashboard")
def dashboard_data():
    """
    Returns the complete aggregated state for the frontend dashboard,
    read from SQLite and processed dynamically.
    """
    return get_dashboard_data()

from api.chat import router as chat_router

app.include_router(chat_router, prefix="/api")
