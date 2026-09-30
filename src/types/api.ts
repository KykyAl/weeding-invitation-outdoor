/** Envelope used by every successful backend response. */
export interface ApiResponse<T> {
  data: T
  message?: string
}

/** Error body of wedding-api: `{ error: { code, message, details? } }`. */
export interface ApiErrorBody {
  error?: {
    code?: string
    message?: string
    /** Per-field validation messages (422), keyed by the backend field name. */
    details?: Record<string, string[] | string | undefined>
  }
}
