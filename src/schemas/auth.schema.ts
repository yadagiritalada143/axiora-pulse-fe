import { z } from 'zod';

const usernameSchema = z
  .string()
  .min(3, 'Username is required')
  .refine(
    (value) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const phoneRegex = /^[0-9]{10,15}$/;

      return emailRegex.test(value) || phoneRegex.test(value);
    },
    {
      message: 'Enter a valid email address or mobile number',
    },
  );

export const loginSchema = z.object({
  username: usernameSchema,
  password: z.string().min(8, 'Password must be at least 8 characters'),
  remember: z.boolean().optional(),
});

export const registerSchema = z.object({
  username: usernameSchema,
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const forgotPasswordSchema = z.object({
  emailOrMobile: z
    .string()
    .min(1, 'Email or mobile number is required')
    .refine(
      (value) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^[0-9]{10,15}$/;
        return emailRegex.test(value) || phoneRegex.test(value);
      },
      { message: 'Enter a valid email address or mobile number' },
    ),
});

export const verifyForgotPasswordSchema = z.object({
  code: z.string().length(6, 'Please enter the 6-digit code'),
});

export const newPasswordSchema = z
  .object({
    new_password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.new_password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
export type VerifyForgotPasswordFormValues = z.infer<typeof verifyForgotPasswordSchema>;
export type NewPasswordFormValues = z.infer<typeof newPasswordSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
