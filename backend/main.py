from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.dashboard import get_dashboard_data

import os
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "../bankiq.db")
    if not os.path.exists(db_path):
        print("Database not found. Running ingestion script...")
        from ingestion.csv_loader import ingest_csvs
        try:
            ingest_csvs()
            print("Ingestion complete.")
        except Exception as e:
            print(f"Ingestion failed: {e}")
    yield

app = FastAPI(title="BankIQ Enterprise API", lifespan=lifespan)
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
