import { z } from 'zod';

export const createWorkspaceSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Workspace name is required')
    .max(100, 'Workspace name must be less than 100 characters'),

  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
});

export type CreateWorkspaceFormData = z.infer<typeof createWorkspaceSchema>;
