from fastapi import APIRouter, HTTPException
from app.models import VocabularyExtractRequest, VocabSuggestion
from app.services.llm import get_llm_service

router = APIRouter()


@router.post("/extract", response_model=list[VocabSuggestion])
async def extract_vocabulary(request: VocabularyExtractRequest):
    """Extract vocabulary suggestions from text."""
    try:
        llm = get_llm_service()
        result = await llm.extract_vocabulary(request.content)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
