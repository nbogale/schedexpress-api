export interface ApiErrorResponse {
  errorCode: string;
  errorMessage?: string;
  timestamp?: string;
  validationErrors?: ValidationError[];
  path?: string;
}

export interface ValidationError {
    code: string;
    filed: string;
    rejectedValue: string;
}