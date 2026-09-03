import { createWorkspaceSchema } from '@features/workspace/schemas/workspace.schema';

describe('createWorkspaceSchema (feature)', () => {
  it('accepts a valid payload', () => {
    const result = createWorkspaceSchema.safeParse({ name: 'Growth Idea' });
    expect(result.success).toBe(true);
  });

  it('accepts an optional description', () => {
    const result = createWorkspaceSchema.safeParse({
      name: 'Growth Idea',
      description: 'a description',
    });
    expect(result.success).toBe(true);
  });

  it('trims name whitespace', () => {
    const result = createWorkspaceSchema.safeParse({ name: '  spaced  ' });
    if (result.success) {
      expect(result.data.name).toBe('spaced');
    }
  });

  it('rejects empty name', () => {
    const result = createWorkspaceSchema.safeParse({ name: '' });
    expect(result.success).toBe(false);
  });

  it('rejects name over 100 characters', () => {
    const result = createWorkspaceSchema.safeParse({ name: 'a'.repeat(101) });
    expect(result.success).toBe(false);
  });

  it('rejects description over 500 characters', () => {
    const result = createWorkspaceSchema.safeParse({
      name: 'ok',
      description: 'b'.repeat(501),
    });
    expect(result.success).toBe(false);
  });
});
