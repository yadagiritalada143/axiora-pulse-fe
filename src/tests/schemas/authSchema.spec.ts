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
    expect(
      loginSchema.safeParse({ username: 'user@example.com', password: 'password1' }).success,
    ).toBe(true);
  });

  it('accepts a valid phone username', () => {
    expect(loginSchema.safeParse({ username: '1234567890', password: 'password1' }).success).toBe(
      true,
    );
  });

  it('rejects a username that is neither email nor phone', () => {
    const result = loginSchema.safeParse({ username: 'not-valid', password: 'password1' });
    expect(result.success).toBe(false);
  });

  it('rejects a short password', () => {
    const result = loginSchema.safeParse({ username: 'user@example.com', password: 'short' });
    expect(result.success).toBe(false);
  });
});

describe('registerSchema', () => {
  it('accepts valid credentials', () => {
    expect(
      registerSchema.safeParse({ username: 'user@example.com', password: 'password1' }).success,
    ).toBe(true);
  });

  it('rejects a too-short username', () => {
    expect(registerSchema.safeParse({ username: 'ab', password: 'password1' }).success).toBe(false);
  });
});

describe('forgotPasswordSchema', () => {
  it('accepts a valid email or mobile', () => {
    expect(forgotPasswordSchema.safeParse({ emailOrMobile: 'user@example.com' }).success).toBe(
      true,
    );
  });

  it('rejects an invalid value', () => {
    expect(forgotPasswordSchema.safeParse({ emailOrMobile: 'xx' }).success).toBe(false);
  });
});

describe('verifyForgotPasswordSchema', () => {
  it('requires a 6-digit code', () => {
    expect(verifyForgotPasswordSchema.safeParse({ code: '123456' }).success).toBe(true);
    expect(verifyForgotPasswordSchema.safeParse({ code: '123' }).success).toBe(false);
  });
});

describe('newPasswordSchema', () => {
  it('accepts matching passwords', () => {
    expect(
      newPasswordSchema.safeParse({ new_password: 'password1', confirmPassword: 'password1' })
        .success,
    ).toBe(true);
  });

  it('rejects mismatched passwords on the confirm field', () => {
    const result = newPasswordSchema.safeParse({
      new_password: 'password1',
      confirmPassword: 'password2',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(['confirmPassword']);
    }
  });
});

describe('resetPasswordSchema', () => {
  it('accepts matching passwords', () => {
    expect(
      resetPasswordSchema.safeParse({ password: 'password1', confirmPassword: 'password1' })
        .success,
    ).toBe(true);
  });

  it('rejects mismatched passwords', () => {
    expect(
      resetPasswordSchema.safeParse({ password: 'password1', confirmPassword: 'nope12345' })
        .success,
    ).toBe(false);
  });
});
