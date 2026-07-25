import { runExclusiveRefresh } from '@services/api/refreshQueue';

describe('runExclusiveRefresh', () => {
  it('coalesces concurrent refreshes into a single call', async () => {
    let calls = 0;
    const refresh = () => {
      calls += 1;
      return Promise.resolve(`token-${calls}`);
    };

    const first = runExclusiveRefresh(refresh);
    const second = runExclusiveRefresh(refresh);

    expect(first).toBe(second);
    await expect(first).resolves.toBe('token-1');
    expect(calls).toBe(1);
  });

  it('allows a new refresh after the previous one settles', async () => {
    let calls = 0;
    const refresh = () => {
      calls += 1;
      return Promise.resolve(`token-${calls}`);
    };

    await runExclusiveRefresh(refresh);
    const result = await runExclusiveRefresh(refresh);

    expect(result).toBe('token-2');
    expect(calls).toBe(2);
  });
});
