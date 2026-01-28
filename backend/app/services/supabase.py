from supabase import create_client, Client
from app.config import get_settings


_supabase_client: Client | None = None


def get_supabase() -> Client:
    global _supabase_client
    if _supabase_client is None:
        settings = get_settings()
        print(f"[SUPABASE] URL: {settings.supabase_url}")
        print(f"[SUPABASE] Key starts with: {settings.supabase_service_key[:20]}...")
        print(f"[SUPABASE] Key length: {len(settings.supabase_service_key)} chars")
        _supabase_client = create_client(settings.supabase_url, settings.supabase_service_key)
        print("[SUPABASE] Client created successfully!")
    return _supabase_client


async def get_session_patterns(session_id: str) -> list[str]:
    """Get historical patterns for a session."""
    supabase = get_supabase()
    result = supabase.table("writing_patterns").select("description").eq("session_id", session_id).execute()
    return [p["description"] for p in result.data]


async def get_persona(session_id: str) -> dict | None:
    """Get persona for a session."""
    supabase = get_supabase()
    result = supabase.table("user_personas").select("*").eq("session_id", session_id).single().execute()
    return result.data if result.data else None


async def save_analysis_result(
    document_id: str,
    session_id: str,
    annotations: list[dict],
    scores: dict,
    patterns: list[dict],
    raw_response: dict,
    model_used: str,
    tokens_used: int,
):
    """Save analysis results to database."""
    supabase = get_supabase()

    # Save annotations
    if annotations:
        annotation_records = [
            {
                "document_id": document_id,
                "start_offset": a["start_offset"],
                "end_offset": a["end_offset"],
                "category": a["category"],
                "severity": a["severity"],
                "message": a["message"],
                "suggestion": a.get("suggestion"),
            }
            for a in annotations
        ]
        supabase.table("feedback_annotations").insert(annotation_records).execute()

    # Save/update patterns
    for pattern in patterns:
        existing = (
            supabase.table("writing_patterns")
            .select("*")
            .eq("session_id", session_id)
            .eq("pattern_type", pattern["pattern_type"])
            .execute()
        )

        if existing.data:
            supabase.table("writing_patterns").update(
                {
                    "occurrence_count": existing.data[0]["occurrence_count"] + 1,
                    "last_occurrence_at": "now()",
                }
            ).eq("id", existing.data[0]["id"]).execute()
        else:
            supabase.table("writing_patterns").insert(
                {
                    "session_id": session_id,
                    "pattern_type": pattern["pattern_type"],
                    "description": pattern["description"],
                }
            ).execute()

    # Save progress metrics
    # Note: "voice" from API response maps to "vocabulary_score" in database
    supabase.table("progress_metrics").insert(
        {
            "session_id": session_id,
            "document_id": document_id,
            "grammar_score": scores["grammar"],
            "clarity_score": scores["clarity"],
            "vocabulary_score": scores["voice"],
            "overall_score": scores["overall"],
        }
    ).execute()

    # Save analysis history
    supabase.table("analysis_history").insert(
        {
            "document_id": document_id,
            "raw_response": raw_response,
            "model_used": model_used,
            "tokens_used": tokens_used,
        }
    ).execute()

    # Update document status
    supabase.table("documents").update({"status": "analyzed"}).eq("id", document_id).execute()


async def get_progress_metrics(session_id: str) -> list[dict]:
    """Get progress metrics for a session."""
    supabase = get_supabase()
    result = (
        supabase.table("progress_metrics")
        .select("*")
        .eq("session_id", session_id)
        .order("created_at", desc=False)
        .execute()
    )
    return result.data


async def check_mastered_patterns(session_id: str) -> list[dict]:
    """Check and update mastered patterns.

    A pattern is mastered when:
    - It occurred 3+ times historically
    - It hasn't appeared in the last 5 documents
    """
    supabase = get_supabase()

    # Get all patterns for session
    patterns = (
        supabase.table("writing_patterns")
        .select("*")
        .eq("session_id", session_id)
        .eq("is_mastered", False)
        .gte("occurrence_count", 3)
        .execute()
    )

    # Get last 5 documents
    recent_docs = (
        supabase.table("documents")
        .select("id")
        .eq("session_id", session_id)
        .order("created_at", desc=True)
        .limit(5)
        .execute()
    )

    recent_doc_ids = [d["id"] for d in recent_docs.data]

    mastered = []
    for pattern in patterns.data:
        # Check if pattern appears in recent documents' annotations
        recent_annotations = (
            supabase.table("feedback_annotations")
            .select("id")
            .in_("document_id", recent_doc_ids)
            .ilike("message", f"%{pattern['description'][:50]}%")
            .execute()
        )

        if not recent_annotations.data:
            # Mark as mastered
            supabase.table("writing_patterns").update({"is_mastered": True}).eq("id", pattern["id"]).execute()
            mastered.append(pattern)

    return mastered
