from fastapi import APIRouter, Request
from pydantic import BaseModel
from agents.orchestrator import process_chat_query

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    context: str = "Dashboard"
    kpis: dict = {}

@router.post("/chat")
async def chat_endpoint(req: ChatRequest):
        
    try:
        res = process_chat_query(req.message, req.context, req.kpis)
        return res
    except Exception as e:
        return {"reply": f"⚠️ Agent System Error: {str(e)}", "isSql": False, "sqlData": None}
