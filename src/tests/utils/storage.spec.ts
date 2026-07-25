import { storage } from '@utils/storage';

describe('storage', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.restoreAllMocks();
  });

  it('sets and gets a JSON-serialized value', () => {
    storage.set('key', { a: 1 });

    expect(storage.get<{ a: number }>('key')).toEqual({ a: 1 });
  });

  it('returns null for a missing key', () => {
    expect(storage.get('missing')).toBeNull();
  });

  it('returns null when the stored value is not valid JSON', () => {
    localStorage.setItem('bad', '{not-json');

    expect(storage.get('bad')).toBeNull();
  });

  it('removes a key', () => {
    storage.set('key', 'value');
    storage.remove('key');

    expect(storage.get('key')).toBeNull();
  });

  it('swallows errors when setItem throws', () => {
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota');
    });

    expect(() => storage.set('key', 'value')).not.toThrow();
  });

  it('swallows errors when removeItem throws', () => {
    jest.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new Error('fail');
    });

    expect(() => storage.remove('key')).not.toThrow();
  });
});
