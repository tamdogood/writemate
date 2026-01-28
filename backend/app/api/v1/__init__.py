from fastapi import APIRouter
from .analyze import router as analyze_router
from .vocabulary import router as vocabulary_router
from .progress import router as progress_router

router = APIRouter()
router.include_router(analyze_router, tags=["analyze"])
router.include_router(vocabulary_router, prefix="/vocabulary", tags=["vocabulary"])
router.include_router(progress_router, tags=["progress"])
