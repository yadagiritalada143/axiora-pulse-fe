import { copyToClipboard } from '@utils/clipboard';

describe('copyToClipboard', () => {
  const originalClipboard = navigator.clipboard;

  afterEach(() => {
    Object.assign(navigator, { clipboard: originalClipboard });
    jest.restoreAllMocks();
  });

  it('returns true when the clipboard write succeeds', async () => {
    const writeText = jest.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    const result = await copyToClipboard('hello world');

    expect(writeText).toHaveBeenCalledWith('hello world');
    expect(result).toBe(true);
  });

  it('returns false when the clipboard write rejects', async () => {
    const writeText = jest.fn().mockRejectedValue(new Error('denied'));
    Object.assign(navigator, { clipboard: { writeText } });

    const result = await copyToClipboard('hello world');

    expect(result).toBe(false);
  });
});
