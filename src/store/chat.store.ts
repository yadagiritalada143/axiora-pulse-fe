import { create } from 'zustand';

export interface ChatDraftAttachment {
  id: string;
  file: File;
}

interface ChatState {
  /** Conversation currently open in the workspace. Message/history data itself is server state (TanStack Query). */
  activeConversationId: string | null;
  /** Model selection is client state; available models come from the server. */
  selectedModelId: string | null;
  draftMessage: string;
  draftAttachments: ChatDraftAttachment[];
  isStreaming: boolean;
}

interface ChatActions {
  setActiveConversationId: (id: string | null) => void;
  setSelectedModelId: (modelId: string | null) => void;
  setDraftMessage: (message: string) => void;
  addDraftAttachment: (attachment: ChatDraftAttachment) => void;
  removeDraftAttachment: (id: string) => void;
  clearDraft: () => void;
  setIsStreaming: (isStreaming: boolean) => void;
}

/** In-flight chat UI state. Persisted conversations/messages belong in TanStack Query. */
export const useChatStore = create<ChatState & ChatActions>((set) => ({
  activeConversationId: null,
  selectedModelId: null,
  draftMessage: '',
  draftAttachments: [],
  isStreaming: false,

  setActiveConversationId: (activeConversationId) => set({ activeConversationId }),
  setSelectedModelId: (selectedModelId) => set({ selectedModelId }),
  setDraftMessage: (draftMessage) => set({ draftMessage }),
  addDraftAttachment: (attachment) =>
    set((state) => ({ draftAttachments: [...state.draftAttachments, attachment] })),
  removeDraftAttachment: (id) =>
    set((state) => ({
      draftAttachments: state.draftAttachments.filter((attachment) => attachment.id !== id),
    })),
  clearDraft: () => set({ draftMessage: '', draftAttachments: [] }),
  setIsStreaming: (isStreaming) => set({ isStreaming }),
}));
