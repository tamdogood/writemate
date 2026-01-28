# WriteMate Database Schema

## Entity Relationship Diagram

```
sessions (1) ──────< (many) documents
    │                    │
    │                    └──< (many) feedback_annotations
    │                    │
    │                    └──< (many) analysis_history
    │
    ├──< (1) user_personas
    │
    ├──< (many) writing_patterns
    │
    ├──< (many) progress_metrics
    │
    └──< (many) vocabulary_bank
```

## Table Definitions

### 1. sessions
Stores anonymous user sessions identified by localStorage token.

```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  device_fingerprint TEXT,
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_sessions_last_active ON sessions(last_active_at);
```

**Fields:**
- `id`: Unique session identifier, stored in localStorage
- `device_fingerprint`: Optional browser fingerprint for session recovery
- `metadata`: Extensible JSON for future features

---

### 2. user_personas
Writing goals and preferences collected during onboarding.

```sql
CREATE TABLE user_personas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  writing_goals TEXT[],
  experience_level TEXT CHECK (experience_level IN ('beginner', 'intermediate', 'advanced')),
  focus_areas TEXT[],
  preferred_tone TEXT,
  target_audience TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(session_id)
);
```

**Example Values:**
- `writing_goals`: `['academic_papers', 'blog_posts', 'business_emails']`
- `focus_areas`: `['grammar', 'clarity', 'vocabulary', 'tone', 'structure']`
- `preferred_tone`: `'formal'`, `'casual'`, `'persuasive'`, `'neutral'`

---

### 3. documents
User's writing submissions with content and metadata.

```sql
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Untitled',
  content TEXT NOT NULL,
  content_html TEXT,
  word_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_analyzed_at TIMESTAMPTZ,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'analyzing', 'analyzed'))
);

CREATE INDEX idx_documents_session ON documents(session_id);
CREATE INDEX idx_documents_updated ON documents(updated_at DESC);
```

**Fields:**
- `content`: Plain text for analysis
- `content_html`: TipTap's HTML output for rendering
- `status`: Tracks analysis state for UI feedback

---

### 4. feedback_annotations
LLM-generated feedback anchored to specific text ranges.

```sql
CREATE TABLE feedback_annotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,

  -- Position (TipTap-compatible character offsets)
  start_offset INTEGER NOT NULL,
  end_offset INTEGER NOT NULL,
  original_text TEXT NOT NULL,

  -- Feedback
  category TEXT NOT NULL CHECK (category IN (
    'grammar', 'spelling', 'punctuation', 'clarity',
    'conciseness', 'word_choice', 'tone', 'structure', 'style'
  )),
  severity TEXT DEFAULT 'suggestion' CHECK (severity IN ('error', 'warning', 'suggestion')),
  message TEXT NOT NULL,
  suggestion TEXT,
  explanation TEXT,

  -- User interaction
  is_accepted BOOLEAN,
  is_dismissed BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_annotations_document ON feedback_annotations(document_id);
CREATE INDEX idx_annotations_category ON feedback_annotations(category);
```

**Severity Levels:**
- `error`: Must fix (grammar errors, spelling)
- `warning`: Should consider (clarity issues, passive voice)
- `suggestion`: Optional improvement (style, word choice)

---

### 5. writing_patterns
Tracks recurring issues and mastered skills.

```sql
CREATE TABLE writing_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,

  pattern_type TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  example_original TEXT,
  example_corrected TEXT,

  first_seen_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  occurrence_count INTEGER DEFAULT 1,
  resolved_count INTEGER DEFAULT 0,

  is_mastered BOOLEAN DEFAULT FALSE,
  mastered_at TIMESTAMPTZ
);

CREATE INDEX idx_patterns_session ON writing_patterns(session_id);
CREATE INDEX idx_patterns_mastered ON writing_patterns(session_id, is_mastered);
```

**Pattern Types:**
- `passive_voice`, `run_on_sentence`, `comma_splice`
- `subject_verb_agreement`, `dangling_modifier`
- `wordiness`, `redundancy`, `weak_verbs`
- `inconsistent_tense`, `unclear_pronoun`

**Mastery Logic:**
Pattern is mastered when `occurrence_count >= 5` AND no occurrences in last 5 documents.

---

### 6. progress_metrics
Aggregated metrics for progress visualization.

```sql
CREATE TABLE progress_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,

  period_start DATE NOT NULL,
  period_type TEXT DEFAULT 'daily' CHECK (period_type IN ('daily', 'weekly', 'monthly')),

  documents_count INTEGER DEFAULT 0,
  words_written INTEGER DEFAULT 0,
  feedback_received INTEGER DEFAULT 0,
  feedback_accepted INTEGER DEFAULT 0,

  grammar_score DECIMAL(5,2),
  clarity_score DECIMAL(5,2),
  vocabulary_score DECIMAL(5,2),
  overall_score DECIMAL(5,2),

  top_issues JSONB DEFAULT '[]',
  improvements JSONB DEFAULT '[]',

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(session_id, period_start, period_type)
);

CREATE INDEX idx_metrics_session_period ON progress_metrics(session_id, period_start DESC);
```

**Scores:** 0-100 scale calculated from feedback density and severity.

---

### 7. vocabulary_bank
User's vocabulary collection.

```sql
CREATE TABLE vocabulary_bank (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,

  word TEXT NOT NULL,
  definition TEXT,
  part_of_speech TEXT,
  example_sentence TEXT,
  context TEXT,

  source TEXT DEFAULT 'suggestion' CHECK (source IN ('suggestion', 'manual', 'extracted')),
  is_learned BOOLEAN DEFAULT FALSE,
  review_count INTEGER DEFAULT 0,
  last_reviewed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(session_id, word)
);

CREATE INDEX idx_vocabulary_session ON vocabulary_bank(session_id);
```

---

### 8. analysis_history
Complete LLM analysis records for audit and comparison.

```sql
CREATE TABLE analysis_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,

  overall_assessment TEXT,
  strengths JSONB DEFAULT '[]',
  areas_for_improvement JSONB DEFAULT '[]',
  scores JSONB DEFAULT '{}',

  llm_response JSONB,
  model_used TEXT,
  tokens_used INTEGER,
  processing_time_ms INTEGER,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_analysis_document ON analysis_history(document_id);
```

---

## Supabase Row Level Security (RLS)

Since we use anonymous sessions, RLS policies ensure users only access their own data:

```sql
-- Enable RLS on all tables
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_annotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE writing_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE vocabulary_bank ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_history ENABLE ROW LEVEL SECURITY;

-- Sessions: users can only read their own session
CREATE POLICY "Users can read own session"
  ON sessions FOR SELECT
  USING (id = current_setting('app.session_id')::uuid);

-- Documents: users can CRUD their own documents
CREATE POLICY "Users can manage own documents"
  ON documents FOR ALL
  USING (session_id = current_setting('app.session_id')::uuid);

-- Apply similar policies to other tables...
```

**Note:** For anonymous auth, pass session_id via Supabase client headers or use service role with manual filtering.
