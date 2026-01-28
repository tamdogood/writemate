import logging
import traceback
import json
from fastapi import APIRouter, HTTPException
from app.models import AnalysisRequest, AnalysisResponse, QuickCheckRequest, QuickCheckResponse
from app.services.llm import get_llm_service
from app.services.supabase import (
    get_session_patterns,
    get_persona,
    save_analysis_result,
    get_supabase,
)

# Configure logging to show detailed output
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_document(request: AnalysisRequest):
    """Perform full document analysis with LLM."""
    # Log the incoming request
    logger.info("=" * 60)
    logger.info("[ANALYZE] Received analysis request")
    logger.info(f"[ANALYZE] Document ID: {request.document_id}")
    logger.info(f"[ANALYZE] Content length: {len(request.content)} chars")
    logger.info(f"[ANALYZE] Content preview: {request.content[:200]}...")
    logger.info(f"[ANALYZE] Persona provided: {request.persona is not None}")
    logger.info(f"[ANALYZE] Historical patterns provided: {request.historical_patterns is not None}")

    try:
        # Step 1: Get LLM service
        logger.info("[ANALYZE] Step 1: Getting LLM service...")
        try:
            llm = get_llm_service()
            logger.info(f"[ANALYZE] LLM service obtained. Model: {llm.model}")
        except Exception as e:
            logger.error(f"[ANALYZE] FAILED at Step 1 - Getting LLM service")
            logger.error(f"[ANALYZE] Error: {str(e)}")
            logger.error(f"[ANALYZE] Traceback:\n{traceback.format_exc()}")
            raise

        # Step 2: Get Supabase client
        logger.info("[ANALYZE] Step 2: Getting Supabase client...")
        try:
            supabase = get_supabase()
            logger.info("[ANALYZE] Supabase client obtained")
        except Exception as e:
            logger.error(f"[ANALYZE] FAILED at Step 2 - Getting Supabase client")
            logger.error(f"[ANALYZE] Error: {str(e)}")
            logger.error(f"[ANALYZE] Traceback:\n{traceback.format_exc()}")
            raise

        # Step 3: Get document to find session_id
        logger.info("[ANALYZE] Step 3: Fetching document from database...")
        try:
            doc_result = supabase.table("documents").select("session_id").eq("id", request.document_id).single().execute()
            logger.info(f"[ANALYZE] Document query result: {doc_result.data}")
        except Exception as e:
            logger.error(f"[ANALYZE] FAILED at Step 3 - Fetching document")
            logger.error(f"[ANALYZE] Error: {str(e)}")
            logger.error(f"[ANALYZE] Traceback:\n{traceback.format_exc()}")
            raise

        if not doc_result.data:
            logger.error(f"[ANALYZE] Document not found with ID: {request.document_id}")
            raise HTTPException(status_code=404, detail="Document not found")

        session_id = doc_result.data["session_id"]
        logger.info(f"[ANALYZE] Session ID: {session_id}")

        # Step 4: Get persona and historical patterns
        logger.info("[ANALYZE] Step 4: Getting persona and patterns...")
        try:
            persona = request.persona
            if not persona:
                logger.info("[ANALYZE] No persona in request, fetching from database...")
                db_persona = await get_persona(session_id)
                if db_persona:
                    persona = {
                        "goals": db_persona.get("goals", []),
                        "experience_level": db_persona.get("experience_level", "intermediate"),
                        "focus_areas": db_persona.get("focus_areas", []),
                        "preferred_tone": db_persona.get("preferred_tone", "balanced"),
                    }
                    logger.info(f"[ANALYZE] Persona from DB: {persona}")
                else:
                    logger.info("[ANALYZE] No persona found in database")
            else:
                logger.info(f"[ANALYZE] Using persona from request: {persona}")

            historical_patterns = request.historical_patterns
            if not historical_patterns:
                logger.info("[ANALYZE] No patterns in request, fetching from database...")
                historical_patterns = await get_session_patterns(session_id)
                logger.info(f"[ANALYZE] Patterns from DB: {historical_patterns}")
            else:
                logger.info(f"[ANALYZE] Using patterns from request: {historical_patterns}")
        except Exception as e:
            logger.error(f"[ANALYZE] FAILED at Step 4 - Getting persona/patterns")
            logger.error(f"[ANALYZE] Error: {str(e)}")
            logger.error(f"[ANALYZE] Traceback:\n{traceback.format_exc()}")
            raise

        # Step 5: Perform LLM analysis
        logger.info("[ANALYZE] Step 5: Calling LLM for analysis...")
        logger.info(f"[ANALYZE] Sending to LLM - Content: {len(request.content)} chars, Persona: {persona}, Patterns: {historical_patterns}")
        try:
            analysis, tokens_used = await llm.analyze_document(
                content=request.content,
                persona=persona,
                historical_patterns=historical_patterns,
            )
            logger.info(f"[ANALYZE] LLM analysis complete. Tokens used: {tokens_used}")
            logger.info(f"[ANALYZE] Analysis result - Annotations: {len(analysis.annotations)}, Patterns: {len(analysis.patterns)}")
        except Exception as e:
            logger.error(f"[ANALYZE] FAILED at Step 5 - LLM analysis")
            logger.error(f"[ANALYZE] Error type: {type(e).__name__}")
            logger.error(f"[ANALYZE] Error message: {str(e)}")
            logger.error(f"[ANALYZE] Full traceback:\n{traceback.format_exc()}")
            raise

        # Step 6: Save results to database
        logger.info("[ANALYZE] Step 6: Saving results to database...")
        try:
            await save_analysis_result(
                document_id=request.document_id,
                session_id=session_id,
                annotations=[a.model_dump() for a in analysis.annotations],
                scores=analysis.scores.model_dump(),
                patterns=[p.model_dump() for p in analysis.patterns],
                raw_response={
                    "annotations": [a.model_dump() for a in analysis.annotations],
                    "scores": analysis.scores.model_dump(),
                    "patterns": [p.model_dump() for p in analysis.patterns],
                    "vocabulary_suggestions": [v.model_dump() for v in analysis.vocabulary_suggestions],
                    "summary": analysis.summary,
                },
                model_used=llm.model,
                tokens_used=tokens_used,
            )
            logger.info("[ANALYZE] Results saved to database successfully")
        except Exception as e:
            logger.error(f"[ANALYZE] FAILED at Step 6 - Saving to database")
            logger.error(f"[ANALYZE] Error: {str(e)}")
            logger.error(f"[ANALYZE] Traceback:\n{traceback.format_exc()}")
            raise

        logger.info("[ANALYZE] Analysis complete! Returning response.")
        logger.info("=" * 60)
        return analysis

    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        # Log the full error details for any unexpected exception
        logger.error("=" * 60)
        logger.error("[ANALYZE] UNEXPECTED ERROR IN ANALYZE ENDPOINT")
        logger.error(f"[ANALYZE] Error type: {type(e).__name__}")
        logger.error(f"[ANALYZE] Error message: {str(e)}")
        logger.error(f"[ANALYZE] Full traceback:\n{traceback.format_exc()}")
        logger.error("=" * 60)

        # Also print to console for immediate visibility
        print("\n" + "=" * 60)
        print("[ANALYZE ERROR] DETAILED ERROR INFORMATION:")
        print(f"Error type: {type(e).__name__}")
        print(f"Error message: {str(e)}")
        print(f"Traceback:\n{traceback.format_exc()}")
        print("=" * 60 + "\n")

        raise HTTPException(status_code=500, detail=f"{type(e).__name__}: {str(e)}")


@router.post("/analyze/quick", response_model=QuickCheckResponse)
async def quick_check(request: QuickCheckRequest):
    """Perform quick check for obvious issues."""
    logger.info("=" * 60)
    logger.info("[QUICK_CHECK] Received quick check request")
    logger.info(f"[QUICK_CHECK] Content length: {len(request.content)} chars")
    logger.info(f"[QUICK_CHECK] Content preview: {request.content[:200]}...")

    try:
        logger.info("[QUICK_CHECK] Getting LLM service...")
        llm = get_llm_service()
        logger.info(f"[QUICK_CHECK] LLM service obtained. Quick model: {llm.model_quick}")

        logger.info("[QUICK_CHECK] Calling LLM for quick check...")
        result = await llm.quick_check(request.content)
        logger.info(f"[QUICK_CHECK] Quick check complete. Has issues: {result.has_issues}, Issue count: {len(result.issues)}")
        logger.info("=" * 60)
        return result
    except Exception as e:
        logger.error("=" * 60)
        logger.error("[QUICK_CHECK] ERROR IN QUICK CHECK ENDPOINT")
        logger.error(f"[QUICK_CHECK] Error type: {type(e).__name__}")
        logger.error(f"[QUICK_CHECK] Error message: {str(e)}")
        logger.error(f"[QUICK_CHECK] Traceback:\n{traceback.format_exc()}")
        logger.error("=" * 60)

        print("\n" + "=" * 60)
        print("[QUICK_CHECK ERROR] DETAILED ERROR INFORMATION:")
        print(f"Error type: {type(e).__name__}")
        print(f"Error message: {str(e)}")
        print(f"Traceback:\n{traceback.format_exc()}")
        print("=" * 60 + "\n")

        raise HTTPException(status_code=500, detail=f"{type(e).__name__}: {str(e)}")
