from pydantic import BaseModel
from typing import Optional


class Persona(BaseModel):
    goals: list[str]
    experience_level: str
    focus_areas: list[str]
    preferred_tone: str


class AnalysisRequest(BaseModel):
    document_id: str
    content: str
    persona: Optional[Persona] = None
    historical_patterns: Optional[list[str]] = None


class QuickCheckRequest(BaseModel):
    content: str


class Annotation(BaseModel):
    start_offset: int
    end_offset: int
    category: str
    severity: str  # 'info', 'warning', 'error'
    message: str
    suggestion: Optional[str] = None
    rewritten_version: Optional[str] = None
    principle: Optional[str] = None


class Scores(BaseModel):
    grammar: float
    clarity: float
    voice: float
    overall: float


class Pattern(BaseModel):
    pattern_type: str
    description: str


class VocabSuggestion(BaseModel):
    word: str
    definition: str
    part_of_speech: str
    example_sentence: str
    replaces: Optional[str] = None


class AnalysisResponse(BaseModel):
    annotations: list[Annotation]
    scores: Scores
    patterns: list[Pattern]
    vocabulary_suggestions: list[VocabSuggestion]
    summary: str


class QuickCheckIssue(BaseModel):
    message: str
    severity: str


class QuickCheckResponse(BaseModel):
    has_issues: bool
    issues: list[QuickCheckIssue]


class VocabularyExtractRequest(BaseModel):
    content: str


class CompareProgressRequest(BaseModel):
    session_id: str


class CompareProgressResponse(BaseModel):
    improvement: float
    areas_improved: list[str]
    areas_to_focus: list[str]
