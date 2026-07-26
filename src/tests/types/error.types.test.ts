import { ApiRequestError, isApiError } from '@/types/error.types';

describe('isApiError', () => {
  it('returns true for a real ApiRequestError instance', () => {
    const error = new ApiRequestError({ status: 400, code: 'BAD_REQUEST', message: 'Bad request' });

    expect(isApiError(error)).toBe(true);
  });

  it('returns true for a plain object with the required shape', () => {
    const shape = { status: 500, code: 'SERVER_ERROR', message: 'Something broke' };

    expect(isApiError(shape)).toBe(true);
  });

  it('returns false for a generic Error instance', () => {
    expect(isApiError(new Error('plain error'))).toBe(false);
  });

  it('returns false for null', () => {
    expect(isApiError(null)).toBe(false);
  });

  it('returns false for an empty object', () => {
    expect(isApiError({})).toBe(false);
  });

  it('returns false for a non-object primitive', () => {
    expect(isApiError('just a string')).toBe(false);
  });

  it('returns false for undefined', () => {
    expect(isApiError(undefined)).toBe(false);
  });
});
