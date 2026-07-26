import { profileSchema } from '@schemas/profile.schema';

describe('profileSchema', () => {
  it('accepts a valid name and email', () => {
    const result = profileSchema.safeParse({ name: 'Jane Doe', email: 'jane@example.com' });

    expect(result.success).toBe(true);
  });

  it('rejects a name shorter than 2 characters', () => {
    const result = profileSchema.safeParse({ name: 'J', email: 'jane@example.com' });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(['name']);
    }
  });

  it('rejects an invalid email address', () => {
    const result = profileSchema.safeParse({ name: 'Jane Doe', email: 'not-an-email' });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(['email']);
    }
  });

  it('rejects a missing email', () => {
    const result = profileSchema.safeParse({ name: 'Jane Doe' });

    expect(result.success).toBe(false);
  });
});
