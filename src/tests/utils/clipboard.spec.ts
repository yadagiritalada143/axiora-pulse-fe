import { copyToClipboard } from '@utils/clipboard';

describe('copyToClipboard', () => {
  const writeText = jest.fn();

  beforeAll(() => {
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns true and writes the text on success', async () => {
    writeText.mockResolvedValue(undefined);

    await expect(copyToClipboard('hello')).resolves.toBe(true);
    expect(writeText).toHaveBeenCalledWith('hello');
  });

  it('returns false when the clipboard write rejects', async () => {
    writeText.mockRejectedValue(new Error('denied'));

    await expect(copyToClipboard('nope')).resolves.toBe(false);
  });
});
