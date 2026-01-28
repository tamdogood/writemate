import json
import logging
import traceback
from openai import AsyncOpenAI
from app.config import get_settings
from app.prompts import (
    ANALYSIS_SYSTEM_PROMPT,
    build_analysis_prompt,
    QUICK_CHECK_SYSTEM_PROMPT,
    QUICK_CHECK_USER_PROMPT,
    VOCABULARY_EXTRACT_PROMPT,
)
from app.models import (
    AnalysisResponse,
    QuickCheckResponse,
    VocabSuggestion,
    Annotation,
    Scores,
    Pattern,
    QuickCheckIssue,
)

logger = logging.getLogger(__name__)


class LLMService:
    def __init__(self):
        print("[LLMService] Initializing LLM Service...")
        settings = get_settings()
        api_key_preview = settings.openai_api_key[:10] if settings.openai_api_key else "EMPTY"
        print(f"[LLMService] Using API key starting with: {api_key_preview}...")
        print(f"[LLMService] Using model: {settings.llm_model}")
        self.client = AsyncOpenAI(api_key=settings.openai_api_key)
        self.model = settings.llm_model
        self.model_quick = settings.llm_model_quick
        print("[LLMService] LLM Service initialized successfully!")

    async def analyze_document(
        self,
        content: str,
        persona: dict | None = None,
        historical_patterns: list[str] | None = None,
    ) -> tuple[AnalysisResponse, int]:
        """Analyze a document and return structured feedback."""
        logger.info("[LLM] Building analysis prompt...")
        user_prompt = build_analysis_prompt(content, persona, historical_patterns)
        logger.info(f"[LLM] Prompt built. Length: {len(user_prompt)} chars")

        logger.info(f"[LLM] Calling OpenAI API with model: {self.model}")
        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": ANALYSIS_SYSTEM_PROMPT},
                    {"role": "user", "content": user_prompt},
                ],
                response_format={"type": "json_object"},
                temperature=0.3,
            )
            logger.info("[LLM] OpenAI API call successful")
        except Exception as e:
            logger.error(f"[LLM] OpenAI API call FAILED")
            logger.error(f"[LLM] Error type: {type(e).__name__}")
            logger.error(f"[LLM] Error message: {str(e)}")
            logger.error(f"[LLM] Traceback:\n{traceback.format_exc()}")
            print(f"\n[LLM ERROR] OpenAI API call failed: {type(e).__name__}: {str(e)}")
            raise

        # Log the raw response for debugging
        raw_content = response.choices[0].message.content
        logger.info(f"[LLM] Raw response length: {len(raw_content)} chars")
        logger.debug(f"[LLM] Raw response content: {raw_content[:500]}...")

        logger.info("[LLM] Parsing JSON response...")
        try:
            result = json.loads(raw_content)
            logger.info(f"[LLM] JSON parsed successfully. Keys: {list(result.keys())}")
        except json.JSONDecodeError as e:
            logger.error(f"[LLM] JSON parsing FAILED")
            logger.error(f"[LLM] JSON error: {str(e)}")
            logger.error(f"[LLM] Raw content that failed to parse:\n{raw_content}")
            print(f"\n[LLM ERROR] JSON parsing failed: {str(e)}")
            print(f"[LLM ERROR] Raw content:\n{raw_content}")
            raise

        tokens_used = response.usage.total_tokens if response.usage else 0
        logger.info(f"[LLM] Tokens used: {tokens_used}")

        logger.info("[LLM] Building AnalysisResponse from parsed JSON...")
        try:
            analysis = AnalysisResponse(
                annotations=[Annotation(**a) for a in result.get("annotations", [])],
                scores=Scores(**result.get("scores", {"grammar": 0, "clarity": 0, "vocabulary": 0, "overall": 0})),
                patterns=[Pattern(**p) for p in result.get("patterns", [])],
                vocabulary_suggestions=[VocabSuggestion(**v) for v in result.get("vocabulary_suggestions", [])],
                summary=result.get("summary", ""),
            )
            logger.info(f"[LLM] AnalysisResponse built successfully")
            logger.info(f"[LLM] - Annotations: {len(analysis.annotations)}")
            logger.info(f"[LLM] - Patterns: {len(analysis.patterns)}")
            logger.info(f"[LLM] - Vocabulary suggestions: {len(analysis.vocabulary_suggestions)}")
        except Exception as e:
            logger.error(f"[LLM] Failed to build AnalysisResponse from JSON")
            logger.error(f"[LLM] Error type: {type(e).__name__}")
            logger.error(f"[LLM] Error message: {str(e)}")
            logger.error(f"[LLM] Parsed result: {json.dumps(result, indent=2)}")
            logger.error(f"[LLM] Traceback:\n{traceback.format_exc()}")
            print(f"\n[LLM ERROR] Failed to build response model: {type(e).__name__}: {str(e)}")
            print(f"[LLM ERROR] Parsed JSON:\n{json.dumps(result, indent=2)}")
            raise

        return analysis, tokens_used

    async def quick_check(self, content: str) -> QuickCheckResponse:
        """Perform a quick check on text for obvious issues."""
        logger.info(f"[LLM] Quick check with model: {self.model_quick}")
        try:
            response = await self.client.chat.completions.create(
                model=self.model_quick,
                messages=[
                    {"role": "system", "content": QUICK_CHECK_SYSTEM_PROMPT},
                    {"role": "user", "content": QUICK_CHECK_USER_PROMPT.format(content=content)},
                ],
                response_format={"type": "json_object"},
                temperature=0.2,
                max_tokens=200,
            )
            logger.info("[LLM] Quick check API call successful")
        except Exception as e:
            logger.error(f"[LLM] Quick check API call FAILED: {type(e).__name__}: {str(e)}")
            logger.error(f"[LLM] Traceback:\n{traceback.format_exc()}")
            raise

        raw_content = response.choices[0].message.content
        logger.info(f"[LLM] Quick check raw response: {raw_content}")

        try:
            result = json.loads(raw_content)
        except json.JSONDecodeError as e:
            logger.error(f"[LLM] Quick check JSON parsing failed: {str(e)}")
            logger.error(f"[LLM] Raw content: {raw_content}")
            raise

        try:
            return QuickCheckResponse(
                has_issues=result.get("has_issues", False),
                issues=[QuickCheckIssue(**i) for i in result.get("issues", [])],
            )
        except Exception as e:
            logger.error(f"[LLM] Quick check response model failed: {type(e).__name__}: {str(e)}")
            logger.error(f"[LLM] Parsed result: {result}")
            raise

    async def extract_vocabulary(self, content: str) -> list[VocabSuggestion]:
        """Extract vocabulary suggestions from text."""
        response = await self.client.chat.completions.create(
            model=self.model_quick,
            messages=[
                {"role": "user", "content": VOCABULARY_EXTRACT_PROMPT.format(content=content)},
            ],
            response_format={"type": "json_object"},
            temperature=0.3,
        )

        # The response should be a JSON object with a "words" array or just an array
        result = json.loads(response.choices[0].message.content)

        # Handle both formats: {"words": [...]} or just [...]
        if isinstance(result, list):
            words = result
        else:
            words = result.get("words", result.get("vocabulary", []))

        return [VocabSuggestion(**v) for v in words]


# Singleton instance
_llm_service: LLMService | None = None


def get_llm_service() -> LLMService:
    global _llm_service
    if _llm_service is None:
        _llm_service = LLMService()
    return _llm_service
