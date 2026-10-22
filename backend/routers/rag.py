import httpx
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from backend.core.config import settings
from backend.rag.vector_store import rag_store
from backend.database.models import User
from backend.core.security import get_current_user

router = APIRouter(prefix="/rag", tags=["AI Mentor & RAG"])

class RAGQueryRequest(BaseModel):
    query: str

@router.post("/query")
async def query_rag_mentor(req: RAGQueryRequest, current_user: User = Depends(get_current_user)):
    # 1. Retrieve grounded context and citations from vector store
    citations = rag_store.search(req.query, top_k=2)

    # 2. Attempt local Ollama inference if configured and reachable
    ollama_success = False
    generated_text = ""

    if settings.OLLAMA_BASE_URL:
        try:
            async with httpx.AsyncClient(timeout=2.0) as client:
                prompt = (
                    f"Context:\n"
                    + "\n".join([f"- {c['title']} ({c['chapter']}): {c['excerpt']}" for c in citations])
                    + f"\n\nQuestion: {req.query}\nAnswer as an engineering career mentor based on the context:"
                )
                res = await client.post(
                    f"{settings.OLLAMA_BASE_URL}/api/generate",
                    json={"model": settings.OLLAMA_MODEL, "prompt": prompt, "stream": False}
                )
                if res.status_code == 200:
                    data = res.json()
                    generated_text = data.get("response", "").strip()
                    if generated_text:
                        ollama_success = True
        except Exception:
            ollama_success = False

    # 3. Fallback to deterministic grounded generator if Ollama is offline
    if not ollama_success:
        grounded = rag_store.generate_grounded_response(req.query)
        generated_text = grounded["text"]

    return {
        "id": f"msg_{current_user.id[:4]}",
        "sender": "mentor",
        "text": generated_text,
        "timestamp": "2026-10-22T04:00:00Z",
        "citations": citations,
        "isFallback": not ollama_success
    }
