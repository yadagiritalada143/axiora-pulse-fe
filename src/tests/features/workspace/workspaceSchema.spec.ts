import { createWorkspaceSchema } from '@features/workspace/schemas/workspace.schema';

describe('createWorkspaceSchema', () => {
  it('accepts a valid name with a description', () => {
    const result = createWorkspaceSchema.safeParse({
      name: 'My Workspace',
      description: 'A short description',
    });

    expect(result.success).toBe(true);
  });

  it('accepts a valid name without a description', () => {
    const result = createWorkspaceSchema.safeParse({ name: 'My Workspace' });

    expect(result.success).toBe(true);
  });

  it('rejects an empty / whitespace-only name', () => {
    const result = createWorkspaceSchema.safeParse({ name: '   ' });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('Workspace name is required');
    }
  });

  it('rejects a missing name', () => {
    const result = createWorkspaceSchema.safeParse({});

    expect(result.success).toBe(false);
  });

  it('rejects a name longer than 100 characters', () => {
    const result = createWorkspaceSchema.safeParse({ name: 'a'.repeat(101) });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        'Workspace name must be less than 100 characters',
      );
    }
  });

  it('rejects a description longer than 500 characters', () => {
    const result = createWorkspaceSchema.safeParse({
      name: 'Valid name',
      description: 'a'.repeat(501),
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('Description must be less than 500 characters');
    }
  });
});
