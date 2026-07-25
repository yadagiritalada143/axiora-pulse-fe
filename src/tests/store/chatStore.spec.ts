import { useChatStore } from '@store/chat.store';

describe('useChatStore', () => {
  beforeEach(() => {
    useChatStore.setState({
      activeConversationId: null,
      selectedModelId: null,
      draftMessage: '',
      draftAttachments: [],
      isStreaming: false,
    });
  });

  it('sets the active conversation and selected model', () => {
    useChatStore.getState().setActiveConversationId('conv-1');
    useChatStore.getState().setSelectedModelId('gpt');

    expect(useChatStore.getState().activeConversationId).toBe('conv-1');
    expect(useChatStore.getState().selectedModelId).toBe('gpt');
  });

  it('sets the draft message and streaming flag', () => {
    useChatStore.getState().setDraftMessage('hi');
    useChatStore.getState().setIsStreaming(true);

    expect(useChatStore.getState().draftMessage).toBe('hi');
    expect(useChatStore.getState().isStreaming).toBe(true);
  });

  it('adds and removes draft attachments', () => {
    const attachment = { id: 'a1', file: new File(['x'], 'x.txt') };

    useChatStore.getState().addDraftAttachment(attachment);
    expect(useChatStore.getState().draftAttachments).toHaveLength(1);

    useChatStore.getState().removeDraftAttachment('a1');
    expect(useChatStore.getState().draftAttachments).toHaveLength(0);
  });

  it('clears the draft message and attachments', () => {
    useChatStore.getState().setDraftMessage('text');
    useChatStore.getState().addDraftAttachment({ id: 'a2', file: new File(['y'], 'y.txt') });

    useChatStore.getState().clearDraft();

    expect(useChatStore.getState().draftMessage).toBe('');
    expect(useChatStore.getState().draftAttachments).toHaveLength(0);
  });
});
