const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

/**
 * Custom error class for API errors that includes HTTP status, backend message, and diagnostic info
 */
export class ApiError extends Error {
  public readonly status: number
  public readonly statusText: string
  public readonly endpoint: string
  public readonly backendMessage: string | null
  public readonly isNetworkError: boolean

  constructor(options: {
    message: string
    status: number
    statusText: string
    endpoint: string
    backendMessage?: string | null
    isNetworkError?: boolean
  }) {
    const fullMessage = options.isNetworkError
      ? `Network error: ${options.message}`
      : `API error (${options.status} ${options.statusText}): ${options.backendMessage || options.message}`

    super(fullMessage)
    this.name = 'ApiError'
    this.status = options.status
    this.statusText = options.statusText
    this.endpoint = options.endpoint
    this.backendMessage = options.backendMessage || null
    this.isNetworkError = options.isNetworkError || false
  }

  /**
   * Returns a user-friendly error message
   */
  getUserMessage(): string {
    if (this.isNetworkError) {
      return 'Unable to connect to the server. Please check if the backend is running and accessible.'
    }

    if (this.status === 0) {
      return 'Network request failed. This may be due to CORS issues or the server being unavailable.'
    }

    if (this.status === 401) {
      return 'Authentication required. Please log in and try again.'
    }

    if (this.status === 403) {
      return 'You do not have permission to perform this action.'
    }

    if (this.status === 404) {
      return `The requested endpoint was not found: ${this.endpoint}`
    }

    if (this.status === 422) {
      return this.backendMessage || 'Invalid request data. Please check your input.'
    }

    if (this.status >= 500) {
      return this.backendMessage || 'Server error. Please try again later.'
    }

    return this.backendMessage || this.message
  }

  /**
   * Returns detailed diagnostic information for debugging
   */
  getDiagnosticInfo(): string {
    return [
      `Endpoint: ${this.endpoint}`,
      `Status: ${this.status} ${this.statusText}`,
      `Backend Message: ${this.backendMessage || 'N/A'}`,
      `Network Error: ${this.isNetworkError}`,
    ].join('\n')
  }
}

/**
 * Helper function to handle API responses and extract error details
 */
async function handleApiResponse<T>(
  response: Response,
  endpoint: string
): Promise<T> {
  if (!response.ok) {
    let backendMessage: string | null = null

    try {
      const errorBody = await response.json()
      // FastAPI typically returns errors in { detail: string } format
      if (errorBody.detail) {
        backendMessage = typeof errorBody.detail === 'string'
          ? errorBody.detail
          : JSON.stringify(errorBody.detail)
      } else if (errorBody.message) {
        backendMessage = errorBody.message
      } else if (errorBody.error) {
        backendMessage = errorBody.error
      } else {
        backendMessage = JSON.stringify(errorBody)
      }
    } catch {
      // Response body is not JSON or couldn't be parsed
      try {
        backendMessage = await response.text()
      } catch {
        backendMessage = null
      }
    }

    throw new ApiError({
      message: 'API request failed',
      status: response.status,
      statusText: response.statusText,
      endpoint,
      backendMessage,
    })
  }

  return response.json()
}

/**
 * Helper function to make API requests with proper error handling
 */
async function makeApiRequest<T>(
  endpoint: string,
  options: RequestInit
): Promise<T> {
  const url = `${API_URL}${endpoint}`

  try {
    const response = await fetch(url, options)
    return handleApiResponse<T>(response, endpoint)
  } catch (error) {
    // Re-throw ApiError as-is
    if (error instanceof ApiError) {
      throw error
    }

    // Handle network errors (fetch failed entirely)
    if (error instanceof TypeError) {
      throw new ApiError({
        message: error.message || 'Network request failed',
        status: 0,
        statusText: 'Network Error',
        endpoint,
        backendMessage: `Failed to connect to ${url}. Ensure the backend server is running.`,
        isNetworkError: true,
      })
    }

    // Re-throw unknown errors
    throw error
  }
}

export interface AnalysisRequest {
  document_id: string
  content: string
  persona?: {
    goals: string[]
    experience_level: string
    focus_areas: string[]
    preferred_tone: string
  }
  historical_patterns?: string[]
}

export interface Annotation {
  start_offset: number
  end_offset: number
  category: string
  severity: 'info' | 'warning' | 'error'
  message: string
  suggestion: string | null
  rewritten_version: string | null
  principle: string | null
}

export interface AnalysisResponse {
  annotations: Annotation[]
  scores: {
    grammar: number
    clarity: number
    voice: number
    overall: number
  }
  patterns: {
    pattern_type: string
    description: string
  }[]
  vocabulary_suggestions: {
    word: string
    definition: string
    part_of_speech: string
    example_sentence: string
    replaces: string | null
  }[]
  summary: string
}

export interface QuickCheckResponse {
  has_issues: boolean
  issues: {
    message: string
    severity: 'info' | 'warning' | 'error'
  }[]
}

export async function analyzeDocument(request: AnalysisRequest): Promise<AnalysisResponse> {
  return makeApiRequest<AnalysisResponse>('/api/v1/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  })
}

export async function quickCheck(content: string): Promise<QuickCheckResponse> {
  return makeApiRequest<QuickCheckResponse>('/api/v1/analyze/quick', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ content }),
  })
}

export async function extractVocabulary(content: string): Promise<AnalysisResponse['vocabulary_suggestions']> {
  return makeApiRequest<AnalysisResponse['vocabulary_suggestions']>('/api/v1/vocabulary/extract', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ content }),
  })
}

export async function compareProgress(session_id: string): Promise<{
  improvement: number
  areas_improved: string[]
  areas_to_focus: string[]
}> {
  return makeApiRequest<{
    improvement: number
    areas_improved: string[]
    areas_to_focus: string[]
  }>('/api/v1/compare-progress', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ session_id }),
  })
}
