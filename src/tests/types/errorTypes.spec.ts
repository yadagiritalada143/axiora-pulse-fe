import { ApiRequestError, isApiError } from '@/types/error.types';

describe('isApiError', () => {
  it('returns true for an object with status, code, and message', () => {
    expect(isApiError({ status: 400, code: 'X', message: 'bad' })).toBe(true);
  });

  it('returns false for null and non-objects', () => {
    expect(isApiError(null)).toBe(false);
    expect(isApiError('error')).toBe(false);
  });

  it('returns false when required keys are missing', () => {
    expect(isApiError({ status: 400 })).toBe(false);
  });
});

describe('ApiRequestError', () => {
  it('is a real Error carrying the normalized fields', () => {
    const error = new ApiRequestError({
      status: 404,
      code: 'NOT_FOUND',
      message: 'missing',
      fieldErrors: [{ field: 'id', message: 'invalid' }],
    });

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('ApiRequestError');
    expect(error.status).toBe(404);
    expect(error.code).toBe('NOT_FOUND');
    expect(error.message).toBe('missing');
    expect(error.fieldErrors).toEqual([{ field: 'id', message: 'invalid' }]);
  });
});
