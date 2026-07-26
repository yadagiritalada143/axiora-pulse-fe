import { storage } from '@utils/storage';

describe('storage', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.restoreAllMocks();
  });

  describe('get', () => {
    it('returns the parsed value when the key exists', () => {
      localStorage.setItem('key', JSON.stringify({ a: 1 }));

      expect(storage.get('key')).toEqual({ a: 1 });
    });

    it('returns null when the key does not exist', () => {
      expect(storage.get('missing')).toBeNull();
    });

    it('returns null and does not throw when localStorage.getItem throws', () => {
      jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('boom');
      });

      expect(() => storage.get('key')).not.toThrow();
      expect(storage.get('key')).toBeNull();
    });

    it('returns null and does not throw when the stored value is not valid JSON', () => {
      localStorage.setItem('key', '{not-json');

      expect(storage.get('key')).toBeNull();
    });
  });

  describe('set', () => {
    it('stores a JSON-serialized value', () => {
      storage.set('key', { a: 1 });

      expect(localStorage.getItem('key')).toBe(JSON.stringify({ a: 1 }));
    });

    it('does not throw when localStorage.setItem throws', () => {
      jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('quota exceeded');
      });

      expect(() => storage.set('key', { a: 1 })).not.toThrow();
    });
  });

  describe('remove', () => {
    it('removes the stored value', () => {
      localStorage.setItem('key', 'value');

      storage.remove('key');

      expect(localStorage.getItem('key')).toBeNull();
    });

    it('does not throw when localStorage.removeItem throws', () => {
      jest.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
        throw new Error('boom');
      });

      expect(() => storage.remove('key')).not.toThrow();
    });
  });
});
