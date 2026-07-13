import { z } from 'zod';

export const profileSchema = z.object({
  name: z.string().min(2, 'Name is too short'),
  email: z.email('Enter a valid email address'),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
