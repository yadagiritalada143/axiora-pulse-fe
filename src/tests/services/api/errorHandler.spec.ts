import type { AxiosError } from 'axios';

import { ApiRequestError } from '@/types/error.types';
import { toApiError } from '@services/api/errorHandler';

function axiosError(partial: Partial<AxiosError>): AxiosError {
  return partial as AxiosError;
}

describe('toApiError', () => {
  it('joins a FastAPI validation detail array into the message', () => {
    const error = toApiError(
      axiosError({
        response: {
          status: 422,
          data: { detail: [{ msg: 'field a bad' }, { msg: 'field b bad' }] },
        } as AxiosError['response'],
      }),
    );

    expect(error).toBeInstanceOf(ApiRequestError);
    expect(error.status).toBe(422);
    expect(error.message).toBe('field a bad\nfield b bad');
  });

  it('uses a string detail as the message', () => {
    const error = toApiError(
      axiosError({
        response: { status: 404, data: { detail: 'Not Found' } } as AxiosError['response'],
      }),
    );

    expect(error.message).toBe('Not Found');
  });

  it('uses payload.message and maps code and field errors', () => {
    const error = toApiError(
      axiosError({
        response: {
          status: 400,
          data: {
            message: 'Bad input',
            code: 'VALIDATION',
            errors: [{ field: 'name', message: 'required' }],
          },
        } as AxiosError['response'],
      }),
    );

    expect(error.message).toBe('Bad input');
    expect(error.code).toBe('VALIDATION');
    expect(error.fieldErrors).toEqual([{ field: 'name', message: 'required' }]);
  });

  it('falls back to a default message and API_ERROR code', () => {
    const error = toApiError(
      axiosError({ response: { status: 500, data: {} } as AxiosError['response'] }),
    );

    expect(error.message).toBe('Something went wrong. Please try again.');
    expect(error.code).toBe('API_ERROR');
  });

  it('maps a canceled request', () => {
    const error = toApiError(axiosError({ code: 'ERR_CANCELED' }));

    expect(error.status).toBe(0);
    expect(error.code).toBe('REQUEST_CANCELED');
  });

  it('maps a timeout', () => {
    const error = toApiError(axiosError({ code: 'ECONNABORTED' }));

    expect(error.code).toBe('TIMEOUT');
  });

  it('maps a network error when there is no response', () => {
    const error = toApiError(axiosError({}));

    expect(error.code).toBe('NETWORK_ERROR');
  });
});
