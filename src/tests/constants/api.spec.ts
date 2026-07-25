import { API_ENDPOINTS, HTTP_STATUS } from '@constants/api';

describe('API_ENDPOINTS', () => {
  it('exposes static auth endpoints', () => {
    expect(API_ENDPOINTS.AUTH.LOGIN).toBe('/v1/auth/login');
  });

  it('builds dynamic chat endpoints from an id', () => {
    expect(API_ENDPOINTS.CHAT.CONVERSATION('c1')).toBe('/chat/conversations/c1');
    expect(API_ENDPOINTS.CHAT.MESSAGES('c1')).toBe('/chat/conversations/c1/messages');
    expect(API_ENDPOINTS.CHAT.STREAM('c1')).toBe('/chat/conversations/c1/stream');
  });

  it('builds workspace detail/delete endpoints relative to the list endpoint', () => {
    expect(API_ENDPOINTS.WORKSPACE.DETAIL(5)).toBe(`${API_ENDPOINTS.WORKSPACE.LIST}/5`);
    expect(API_ENDPOINTS.WORKSPACE.DELETE(5)).toBe(`${API_ENDPOINTS.WORKSPACE.CREATE}/5`);
  });
});

describe('HTTP_STATUS', () => {
  it('maps status names to codes', () => {
    expect(HTTP_STATUS.OK).toBe(200);
    expect(HTTP_STATUS.UNAUTHORIZED).toBe(401);
    expect(HTTP_STATUS.INTERNAL_SERVER_ERROR).toBe(500);
  });
});
