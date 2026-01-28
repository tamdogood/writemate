import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      sessions: {
        Row: {
          id: string
          created_at: string
          last_active_at: string
        }
        Insert: {
          id?: string
          created_at?: string
          last_active_at?: string
        }
        Update: {
          id?: string
          created_at?: string
          last_active_at?: string
        }
      }
      user_personas: {
        Row: {
          id: string
          session_id: string
          goals: string[]
          experience_level: string
          focus_areas: string[]
          preferred_tone: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          session_id: string
          goals: string[]
          experience_level: string
          focus_areas: string[]
          preferred_tone: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          goals?: string[]
          experience_level?: string
          focus_areas?: string[]
          preferred_tone?: string
          created_at?: string
          updated_at?: string
        }
      }
      documents: {
        Row: {
          id: string
          session_id: string
          title: string
          content: string
          content_html: string
          word_count: number
          status: 'draft' | 'analyzed'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          session_id: string
          title?: string
          content?: string
          content_html?: string
          word_count?: number
          status?: 'draft' | 'analyzed'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          title?: string
          content?: string
          content_html?: string
          word_count?: number
          status?: 'draft' | 'analyzed'
          created_at?: string
          updated_at?: string
        }
      }
      feedback_annotations: {
        Row: {
          id: string
          document_id: string
          start_offset: number
          end_offset: number
          category: string
          severity: 'info' | 'warning' | 'error'
          message: string
          suggestion: string | null
          is_dismissed: boolean
          created_at: string
        }
        Insert: {
          id?: string
          document_id: string
          start_offset: number
          end_offset: number
          category: string
          severity: 'info' | 'warning' | 'error'
          message: string
          suggestion?: string | null
          is_dismissed?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          document_id?: string
          start_offset?: number
          end_offset?: number
          category?: string
          severity?: 'info' | 'warning' | 'error'
          message?: string
          suggestion?: string | null
          is_dismissed?: boolean
          created_at?: string
        }
      }
      writing_patterns: {
        Row: {
          id: string
          session_id: string
          pattern_type: string
          description: string
          occurrence_count: number
          last_occurrence_at: string
          is_mastered: boolean
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          pattern_type: string
          description: string
          occurrence_count?: number
          last_occurrence_at?: string
          is_mastered?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          pattern_type?: string
          description?: string
          occurrence_count?: number
          last_occurrence_at?: string
          is_mastered?: boolean
          created_at?: string
        }
      }
      progress_metrics: {
        Row: {
          id: string
          session_id: string
          document_id: string
          grammar_score: number
          clarity_score: number
          vocabulary_score: number
          overall_score: number
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          document_id: string
          grammar_score: number
          clarity_score: number
          vocabulary_score: number
          overall_score: number
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          document_id?: string
          grammar_score?: number
          clarity_score?: number
          vocabulary_score?: number
          overall_score?: number
          created_at?: string
        }
      }
      vocabulary_bank: {
        Row: {
          id: string
          session_id: string
          word: string
          definition: string
          part_of_speech: string
          example_sentence: string | null
          is_learned: boolean
          review_count: number
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          word: string
          definition: string
          part_of_speech: string
          example_sentence?: string | null
          is_learned?: boolean
          review_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          word?: string
          definition?: string
          part_of_speech?: string
          example_sentence?: string | null
          is_learned?: boolean
          review_count?: number
          created_at?: string
        }
      }
      analysis_history: {
        Row: {
          id: string
          document_id: string
          raw_response: Record<string, unknown>
          model_used: string
          tokens_used: number
          created_at: string
        }
        Insert: {
          id?: string
          document_id: string
          raw_response: Record<string, unknown>
          model_used: string
          tokens_used: number
          created_at?: string
        }
        Update: {
          id?: string
          document_id?: string
          raw_response?: Record<string, unknown>
          model_used?: string
          tokens_used?: number
          created_at?: string
        }
      }
    }
  }
}
