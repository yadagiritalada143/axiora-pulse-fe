import { profileSchema } from '@schemas/profile.schema';

describe('profileSchema', () => {
  it('accepts a valid name and email', () => {
    expect(profileSchema.safeParse({ name: 'Jane', email: 'jane@example.com' }).success).toBe(true);
  });

  it('rejects a too-short name', () => {
    expect(profileSchema.safeParse({ name: 'J', email: 'jane@example.com' }).success).toBe(false);
  });

  it('rejects an invalid email', () => {
    expect(profileSchema.safeParse({ name: 'Jane', email: 'not-an-email' }).success).toBe(false);
  });
});
