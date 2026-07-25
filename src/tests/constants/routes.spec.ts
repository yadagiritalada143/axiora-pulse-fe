import { buildConversationRoute, GUEST_ROUTES, PROTECTED_ROUTES, ROUTES } from '@constants/routes';

describe('routes', () => {
  it('exposes route path constants', () => {
    expect(ROUTES.LOGIN).toBe('/login');
    expect(ROUTES.WORKSPACE).toBe('/workspace');
    expect(ROUTES.AI_CHAT).toBe('/workspace/ai-chat');
  });

  it('lists guest and protected routes', () => {
    expect(GUEST_ROUTES).toContain(ROUTES.LOGIN);
    expect(PROTECTED_ROUTES).toContain(ROUTES.DASHBOARD);
    expect(PROTECTED_ROUTES).toContain(ROUTES.WORKSPACE);
  });

  it('builds a conversation route from an id', () => {
    expect(buildConversationRoute('abc123')).toBe('/workspace/ai-chat/abc123');
  });
});
