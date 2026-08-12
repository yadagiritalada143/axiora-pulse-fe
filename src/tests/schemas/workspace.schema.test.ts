import { workspaceSchema as createWorkspaceSchema } from '@schemas/workspace.schema';

describe('createWorkspaceSchema', () => {
  it('accepts a valid name without a description', () => {
    const result = createWorkspaceSchema.safeParse({ name: 'My Workspace' });

    expect(result.success).toBe(true);
  });

  it('accepts a valid name and description', () => {
    const result = createWorkspaceSchema.safeParse({
      name: 'My Workspace',
      description: 'A place for ideas',
    });

    expect(result.success).toBe(true);
  });

  it('trims whitespace from the name', () => {
    const result = createWorkspaceSchema.safeParse({ name: '  My Workspace  ' });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe('My Workspace');
    }
  });

  it('rejects an empty name', () => {
    const result = createWorkspaceSchema.safeParse({ name: '' });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(['name']);
    }
  });

  it('rejects a name over 100 characters', () => {
    const result = createWorkspaceSchema.safeParse({ name: 'a'.repeat(101) });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(['name']);
    }
  });

  it('rejects a description over 500 characters', () => {
    const result = createWorkspaceSchema.safeParse({
      name: 'My Workspace',
      description: 'a'.repeat(501),
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(['description']);
    }
  });

  it('rejects a whitespace-only name', () => {
    const result = createWorkspaceSchema.safeParse({ name: '   ' });

    expect(result.success).toBe(false);
  });
});
