import {
  forgotPasswordSchema,
  loginSchema,
  newPasswordSchema,
  registerSchema,
  resetPasswordSchema,
  verifyForgotPasswordSchema,
} from '@schemas/auth.schema';

describe('loginSchema', () => {
  it('accepts a valid email username and password', () => {
    const result = loginSchema.safeParse({
      username: 'user@example.com',
      password: 'password123',
    });

    expect(result.success).toBe(true);
  });

  it('accepts a valid phone number username', () => {
    const result = loginSchema.safeParse({
      username: '1234567890',
      password: 'password123',
    });

    expect(result.success).toBe(true);
  });

  it('accepts an optional remember flag', () => {
    const result = loginSchema.safeParse({
      username: 'user@example.com',
      password: 'password123',
      remember: true,
    });

    expect(result.success).toBe(true);
  });

  it('rejects a username that is neither a valid email nor phone number', () => {
    const result = loginSchema.safeParse({
      username: 'not-valid',
      password: 'password123',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(['username']);
    }
  });

  it('rejects a password shorter than 8 characters', () => {
    const result = loginSchema.safeParse({
      username: 'user@example.com',
      password: 'short',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(['password']);
    }
  });
});

describe('registerSchema', () => {
  it('accepts a valid username and password', () => {
    const result = registerSchema.safeParse({
      username: 'user@example.com',
      password: 'password123',
    });

    expect(result.success).toBe(true);
  });

  it('rejects an invalid username', () => {
    const result = registerSchema.safeParse({
      username: 'no',
      password: 'password123',
    });

    expect(result.success).toBe(false);
  });
});

describe('forgotPasswordSchema', () => {
  it('accepts a valid email', () => {
    const result = forgotPasswordSchema.safeParse({ emailOrMobile: 'user@example.com' });

    expect(result.success).toBe(true);
  });

  it('rejects an empty value', () => {
    const result = forgotPasswordSchema.safeParse({ emailOrMobile: '' });

    expect(result.success).toBe(false);
  });

  it('rejects a value that is not an email or phone number', () => {
    const result = forgotPasswordSchema.safeParse({ emailOrMobile: 'invalid' });

    expect(result.success).toBe(false);
  });
});

describe('verifyForgotPasswordSchema', () => {
  it('accepts a 6-digit code', () => {
    const result = verifyForgotPasswordSchema.safeParse({ code: '123456' });

    expect(result.success).toBe(true);
  });

  it('rejects a code that is not exactly 6 characters', () => {
    const result = verifyForgotPasswordSchema.safeParse({ code: '12345' });

    expect(result.success).toBe(false);
  });
});

describe('newPasswordSchema', () => {
  it('accepts matching passwords', () => {
    const result = newPasswordSchema.safeParse({
      new_password: 'password123',
      confirmPassword: 'password123',
    });

    expect(result.success).toBe(true);
  });

  it('rejects mismatched passwords and flags confirmPassword', () => {
    const result = newPasswordSchema.safeParse({
      new_password: 'password123',
      confirmPassword: 'different123',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(['confirmPassword']);
    }
  });

  it('rejects a new_password shorter than 8 characters', () => {
    const result = newPasswordSchema.safeParse({
      new_password: 'short',
      confirmPassword: 'short',
    });

    expect(result.success).toBe(false);
  });
});

describe('resetPasswordSchema', () => {
  it('accepts matching passwords', () => {
    const result = resetPasswordSchema.safeParse({
      password: 'password123',
      confirmPassword: 'password123',
    });

    expect(result.success).toBe(true);
  });

  it('rejects mismatched passwords and flags confirmPassword', () => {
    const result = resetPasswordSchema.safeParse({
      password: 'password123',
      confirmPassword: 'different123',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(['confirmPassword']);
    }
  });
});
