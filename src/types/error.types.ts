export interface ApiFieldError {
  field: string;
  message: string;
}

/** Normalized shape every service throws, regardless of the raw axios error. */
export interface ApiError {
  status: number;
  code: string;
  message: string;
  fieldErrors?: ApiFieldError[];
}

export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    'code' in error &&
    'message' in error
  );
}

/** Concrete `Error` carrying the normalized `ApiError` shape, so rejections keep a real stack trace. */
export class ApiRequestError extends Error implements ApiError {
  status: number;
  code: string;
  fieldErrors?: ApiFieldError[];

  constructor(apiError: ApiError) {
    super(apiError.message);
    this.name = 'ApiRequestError';
    this.status = apiError.status;
    this.code = apiError.code;
    this.fieldErrors = apiError.fieldErrors;
  }
}
