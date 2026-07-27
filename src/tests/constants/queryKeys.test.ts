import { queryKeys } from '@constants/queryKeys';

describe('queryKeys', () => {
  it('builds auth keys', () => {
    expect(queryKeys.auth.session()).toEqual(['auth', 'session']);
  });

  it('builds chat keys', () => {
    expect(queryKeys.chat.conversations()).toEqual(['chat', 'conversations']);
    expect(queryKeys.chat.conversation('c1')).toEqual(['chat', 'conversations', 'c1']);
    expect(queryKeys.chat.messages('c1')).toEqual(['chat', 'conversations', 'c1', 'messages']);
    expect(queryKeys.chat.models()).toEqual(['chat', 'models']);
  });

  it('builds workspace keys from a shared base', () => {
    expect(queryKeys.workspace.all()).toEqual(['workspace']);
    expect(queryKeys.workspace.list()).toEqual(['workspace', 'list']);
    expect(queryKeys.workspace.detail(1)).toEqual(['workspace', 'detail', 1]);
  });

  it('builds billing, user and onboarding keys', () => {
    expect(queryKeys.billing.plans()).toEqual(['billing', 'plans']);
    expect(queryKeys.user.profile()).toEqual(['user', 'profile']);
    expect(queryKeys.onboarding.interactiveQuestions()).toEqual([
      'onboarding',
      'interactiveQuestions',
    ]);
  });

  it('builds admin keys', () => {
    expect(queryKeys.admin.interactiveQuestions()).toEqual(['admin', 'interactiveQuestions']);
  });
});
