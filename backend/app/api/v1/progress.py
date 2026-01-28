from fastapi import APIRouter, HTTPException
from app.models import CompareProgressRequest, CompareProgressResponse
from app.services.supabase import get_progress_metrics, check_mastered_patterns

router = APIRouter()


@router.post("/compare-progress", response_model=CompareProgressResponse)
async def compare_progress(request: CompareProgressRequest):
    """Calculate improvement over time."""
    try:
        metrics = await get_progress_metrics(request.session_id)

        if len(metrics) < 2:
            return CompareProgressResponse(
                improvement=0,
                areas_improved=[],
                areas_to_focus=[],
            )

        # Compare first half to second half
        mid = len(metrics) // 2
        first_half = metrics[:mid]
        second_half = metrics[mid:]

        def avg(data: list[dict], field: str) -> float:
            values = [float(d[field]) for d in data]
            return sum(values) / len(values) if values else 0

        improvements = {
            "grammar": avg(second_half, "grammar_score") - avg(first_half, "grammar_score"),
            "clarity": avg(second_half, "clarity_score") - avg(first_half, "clarity_score"),
            "vocabulary": avg(second_half, "vocabulary_score") - avg(first_half, "vocabulary_score"),
            "overall": avg(second_half, "overall_score") - avg(first_half, "overall_score"),
        }

        areas_improved = [k for k, v in improvements.items() if v > 5]
        areas_to_focus = [k for k, v in improvements.items() if v < -5 or (v < 5 and avg(second_half, f"{k}_score") < 70)]

        # Check for newly mastered patterns
        await check_mastered_patterns(request.session_id)

        return CompareProgressResponse(
            improvement=improvements["overall"],
            areas_improved=areas_improved,
            areas_to_focus=areas_to_focus,
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
