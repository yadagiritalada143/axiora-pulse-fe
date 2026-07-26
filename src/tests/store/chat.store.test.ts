import { act } from '@testing-library/react';

import { useChatStore, type ChatDraftAttachment } from '@store/chat.store';

const initialState = useChatStore.getState();

function makeAttachment(id: string): ChatDraftAttachment {
  return { id, file: new File(['content'], `${id}.txt`, { type: 'text/plain' }) };
}

describe('useChatStore', () => {
  afterEach(() => {
    act(() => {
      useChatStore.setState(initialState, true);
    });
  });

  it('has the expected default state', () => {
    const state = useChatStore.getState();
    expect(state.activeConversationId).toBeNull();
    expect(state.selectedModelId).toBeNull();
    expect(state.draftMessage).toBe('');
    expect(state.draftAttachments).toEqual([]);
    expect(state.isStreaming).toBe(false);
  });

  it('setActiveConversationId updates the active conversation id', () => {
    act(() => {
      useChatStore.getState().setActiveConversationId('conv-1');
    });

    expect(useChatStore.getState().activeConversationId).toBe('conv-1');
  });

  it('setSelectedModelId updates the selected model id', () => {
    act(() => {
      useChatStore.getState().setSelectedModelId('model-1');
    });

    expect(useChatStore.getState().selectedModelId).toBe('model-1');
  });

  it('setDraftMessage updates the draft message', () => {
    act(() => {
      useChatStore.getState().setDraftMessage('hello');
    });

    expect(useChatStore.getState().draftMessage).toBe('hello');
  });

  it('addDraftAttachment appends to the draft attachments list', () => {
    const attachment = makeAttachment('a1');

    act(() => {
      useChatStore.getState().addDraftAttachment(attachment);
    });

    expect(useChatStore.getState().draftAttachments).toEqual([attachment]);
  });

  it('removeDraftAttachment removes only the matching attachment', () => {
    const attachment1 = makeAttachment('a1');
    const attachment2 = makeAttachment('a2');

    act(() => {
      useChatStore.getState().addDraftAttachment(attachment1);
      useChatStore.getState().addDraftAttachment(attachment2);
      useChatStore.getState().removeDraftAttachment('a1');
    });

    expect(useChatStore.getState().draftAttachments).toEqual([attachment2]);
  });

  it('clearDraft resets the draft message and attachments', () => {
    act(() => {
      useChatStore.getState().setDraftMessage('hello');
      useChatStore.getState().addDraftAttachment(makeAttachment('a1'));
      useChatStore.getState().clearDraft();
    });

    expect(useChatStore.getState().draftMessage).toBe('');
    expect(useChatStore.getState().draftAttachments).toEqual([]);
  });

  it('setIsStreaming toggles the streaming flag', () => {
    act(() => {
      useChatStore.getState().setIsStreaming(true);
    });

    expect(useChatStore.getState().isStreaming).toBe(true);

    act(() => {
      useChatStore.getState().setIsStreaming(false);
    });

    expect(useChatStore.getState().isStreaming).toBe(false);
  });
});
