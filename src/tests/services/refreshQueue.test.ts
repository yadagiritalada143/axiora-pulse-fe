import { runExclusiveRefresh } from '@services/api/refreshQueue';

describe('runExclusiveRefresh', () => {
  it('invokes the refresh function once for concurrent calls and resolves both to the same value', async () => {
    let resolveRefresh!: (token: string) => void;
    const refresh = jest.fn(
      () =>
        new Promise<string>((resolve) => {
          resolveRefresh = resolve;
        }),
    );

    const first = runExclusiveRefresh(refresh);
    const second = runExclusiveRefresh(refresh);

    expect(refresh).toHaveBeenCalledTimes(1);

    resolveRefresh('new-access-token');

    await expect(first).resolves.toBe('new-access-token');
    await expect(second).resolves.toBe('new-access-token');
  });

  it('rejects every concurrent caller when the refresh fails', async () => {
    const error = new Error('refresh failed');
    const refresh = jest.fn(() => Promise.reject(error));

    const first = runExclusiveRefresh(refresh);
    const second = runExclusiveRefresh(refresh);

    expect(refresh).toHaveBeenCalledTimes(1);

    await expect(first).rejects.toBe(error);
    await expect(second).rejects.toBe(error);
  });

  it('starts a fresh refresh once the previous one has settled', async () => {
    const refresh = jest
      .fn<Promise<string>, []>()
      .mockResolvedValueOnce('token-1')
      .mockResolvedValueOnce('token-2');

    await expect(runExclusiveRefresh(refresh)).resolves.toBe('token-1');
    await expect(runExclusiveRefresh(refresh)).resolves.toBe('token-2');

    expect(refresh).toHaveBeenCalledTimes(2);
  });
});
