import { downloadFile } from '@utils/file';

describe('downloadFile', () => {
  let createObjectURL: jest.Mock;
  let revokeObjectURL: jest.Mock;
  let clickSpy: jest.SpyInstance;

  beforeEach(() => {
    createObjectURL = jest.fn().mockReturnValue('blob:mock-url');
    revokeObjectURL = jest.fn();
    Object.assign(URL, { createObjectURL, revokeObjectURL });
    clickSpy = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('creates an object URL, triggers a download anchor, and revokes the URL', () => {
    downloadFile('hello world', 'transcript.txt');

    expect(createObjectURL).toHaveBeenCalledTimes(1);
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
  });

  it('defaults the mime type to text/plain', () => {
    downloadFile('content', 'file.txt');

    const [blobArg] = createObjectURL.mock.calls[0] as [Blob];
    expect(blobArg.type).toBe('text/plain');
  });

  it('uses a custom mime type when provided', () => {
    downloadFile('{}', 'file.json', 'application/json');

    const [blobArg] = createObjectURL.mock.calls[0] as [Blob];
    expect(blobArg.type).toBe('application/json');
  });

  it('handles empty content without throwing', () => {
    expect(() => downloadFile('', 'empty.txt')).not.toThrow();
  });
});
