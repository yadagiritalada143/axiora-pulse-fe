import type { AxiosError } from 'axios';

import { ApiRequestError, type ApiFieldError } from '@/types/error.types';

interface BackendErrorPayload {
  message?: string;
  code?: string;
  errors?: ApiFieldError[];
}

interface FastApiValidationError {
  msg: string;
  loc?: (string | number)[];
  type?: string;
}

interface BackendErrorPayload {
  message?: string;
  code?: string;
  errors?: ApiFieldError[];

  detail?: string | FastApiValidationError[];
}

/**
 * Normalizes any axios failure
 * (HTTP error, network error, timeout, cancel)
 * into ApiRequestError.
 */
export function toApiError(error: AxiosError): ApiRequestError {
  if (error.response) {
    const payload = error.response.data as BackendErrorPayload | undefined;

    let message = payload?.message ?? 'Something went wrong. Please try again.';

    if (Array.isArray(payload?.detail)) {
      message = payload.detail.map((item) => item.msg).join('\n');
    } else if (typeof payload?.detail === 'string') {
      message = payload.detail;
    }

    return new ApiRequestError({
      status: error.response.status,
      code: payload?.code ?? 'API_ERROR',
      message,
      fieldErrors: payload?.errors,
    });
  }

  if (error.code === 'ERR_CANCELED') {
    return new ApiRequestError({
      status: 0,
      code: 'REQUEST_CANCELED',
      message: 'Request was canceled.',
    });
  }

  if (error.code === 'ECONNABORTED') {
    return new ApiRequestError({
      status: 0,
      code: 'TIMEOUT',
      message: 'The request timed out. Please try again.',
    });
  }

  return new ApiRequestError({
    status: 0,
    code: 'NETWORK_ERROR',
    message: 'Unable to reach the server. Check your connection and try again.',
  });
}
