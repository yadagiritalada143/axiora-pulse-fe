import { buildConversationRoute, ROUTES } from '@constants/routes';

describe('buildConversationRoute', () => {
  it('substitutes the conversation id into the route pattern', () => {
    expect(buildConversationRoute('abc')).toBe('/workspace/ai-chat/abc');
  });

  it('matches ROUTES.AI_CHAT_CONVERSATION with the placeholder replaced', () => {
    expect(buildConversationRoute('123')).toBe(
      ROUTES.AI_CHAT_CONVERSATION.replace(':conversationId', '123'),
    );
  });

  it('handles an empty conversation id', () => {
    expect(buildConversationRoute('')).toBe('/workspace/ai-chat/');
  });
});
