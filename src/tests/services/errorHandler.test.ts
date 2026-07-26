import type { AxiosError, InternalAxiosRequestConfig } from 'axios';

import { toApiError } from '@services/api/errorHandler';

function makeAxiosError(overrides: Partial<AxiosError>): AxiosError {
  return {
    isAxiosError: true,
    name: 'AxiosError',
    message: 'Request failed',
    toJSON: () => ({}),
    ...overrides,
  } as AxiosError;
}

describe('toApiError', () => {
  it('maps a standard backend error payload to an ApiRequestError', () => {
    const error = makeAxiosError({
      response: {
        status: 422,
        statusText: 'Unprocessable Entity',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
        data: {
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          errors: [{ field: 'email', message: 'Invalid email' }],
        },
      },
    });

    const apiError = toApiError(error);

    expect(apiError.status).toBe(422);
    expect(apiError.code).toBe('VALIDATION_ERROR');
    expect(apiError.message).toBe('Validation failed');
    expect(apiError.fieldErrors).toEqual([{ field: 'email', message: 'Invalid email' }]);
  });

  it('falls back to a default message and code when the payload omits them', () => {
    const error = makeAxiosError({
      response: {
        status: 500,
        statusText: 'Internal Server Error',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
        data: {},
      },
    });

    const apiError = toApiError(error);

    expect(apiError.status).toBe(500);
    expect(apiError.code).toBe('API_ERROR');
    expect(apiError.message).toBe('Something went wrong. Please try again.');
    expect(apiError.fieldErrors).toBeUndefined();
  });

  it('joins FastAPI-style validation detail arrays into a single message', () => {
    const error = makeAxiosError({
      response: {
        status: 400,
        statusText: 'Bad Request',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
        data: {
          detail: [
            { msg: 'field required', loc: ['body', 'email'] },
            { msg: 'must be a string', loc: ['body', 'name'] },
          ],
        },
      },
    });

    const apiError = toApiError(error);

    expect(apiError.message).toBe('field required\nmust be a string');
  });

  it('uses a string detail field as the message when present', () => {
    const error = makeAxiosError({
      response: {
        status: 400,
        statusText: 'Bad Request',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
        data: { detail: 'Malformed request body' },
      },
    });

    const apiError = toApiError(error);

    expect(apiError.message).toBe('Malformed request body');
  });

  it('maps a canceled request to REQUEST_CANCELED', () => {
    const error = makeAxiosError({ code: 'ERR_CANCELED' });

    const apiError = toApiError(error);

    expect(apiError.status).toBe(0);
    expect(apiError.code).toBe('REQUEST_CANCELED');
  });

  it('maps a timeout to TIMEOUT', () => {
    const error = makeAxiosError({ code: 'ECONNABORTED' });

    const apiError = toApiError(error);

    expect(apiError.status).toBe(0);
    expect(apiError.code).toBe('TIMEOUT');
  });

  it('falls back to NETWORK_ERROR for any other response-less failure', () => {
    const error = makeAxiosError({});

    const apiError = toApiError(error);

    expect(apiError.status).toBe(0);
    expect(apiError.code).toBe('NETWORK_ERROR');
    expect(apiError.message).toBe(
      'Unable to reach the server. Check your connection and try again.',
    );
  });
});
