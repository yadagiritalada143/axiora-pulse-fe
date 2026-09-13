import { getDisplayName, getUserInitial } from '@utils/user';

describe('user utils', () => {
  describe('getDisplayName', () => {
    it('returns full name from userDetails when both first_name and last_name exist', () => {
      const result = getDisplayName(
        { name: 'Old Name', email: 'old@example.com' },
        { first_name: 'John', last_name: 'Doe' },
      );
      expect(result).toBe('John Doe');
    });

    it('returns first name only from userDetails when last_name is missing', () => {
      const result = getDisplayName(
        { name: 'Old Name', email: 'old@example.com' },
        { first_name: 'John', last_name: '' },
      );
      expect(result).toBe('John');
    });

    it('returns last name only from userDetails when first_name is missing', () => {
      const result = getDisplayName(
        { name: 'Old Name', email: 'old@example.com' },
        { first_name: '', last_name: 'Doe' },
      );
      expect(result).toBe('Doe');
    });

    it('returns full name from user.firstName and user.lastName when userDetails is null', () => {
      const result = getDisplayName({
        firstName: 'Alice',
        lastName: 'Wonderland',
        name: 'alice123',
        email: 'alice@example.com',
      });
      expect(result).toBe('Alice Wonderland');
    });

    it('supports snake_case first_name and last_name on user object', () => {
      const result = getDisplayName({
        first_name: 'Bob',
        last_name: 'Builder',
        name: 'bob123',
      });
      expect(result).toBe('Bob Builder');
    });

    it('prioritizes userDetails over user object', () => {
      const result = getDisplayName(
        { firstName: 'OldFirst', lastName: 'OldLast', name: 'Old Name' },
        { first_name: 'NewFirst', last_name: 'NewLast' },
      );
      expect(result).toBe('NewFirst NewLast');
    });

    it('falls back to user.name if first and last names are empty', () => {
      const result = getDisplayName(
        { name: 'Existing Display Name', email: 'user@example.com' },
        { first_name: '', last_name: '' },
      );
      expect(result).toBe('Existing Display Name');
    });

    it('falls back to email prefix if first and last name and name are empty', () => {
      const result = getDisplayName({
        email: 'founder@axiora.com',
      });
      expect(result).toBe('founder');
    });

    it('returns "Account" if user is null or undefined', () => {
      expect(getDisplayName(null)).toBe('Account');
      expect(getDisplayName(undefined)).toBe('Account');
      expect(getDisplayName({})).toBe('Account');
    });
  });

  describe('getUserInitial', () => {
    it('returns uppercase first character of display name', () => {
      expect(getUserInitial('John Doe')).toBe('J');
      expect(getUserInitial('alice')).toBe('A');
    });

    it('falls back to email initial if display name is "Account"', () => {
      expect(getUserInitial('Account', { email: 'sarah@example.com' })).toBe('S');
    });

    it('returns "U" if display name is "Account" and no email exists', () => {
      expect(getUserInitial('Account', null)).toBe('U');
      expect(getUserInitial('Account', { email: '' })).toBe('U');
    });

    it('returns "U" if display name is empty and no email exists', () => {
      expect(getUserInitial('', null)).toBe('U');
    });
  });
});
