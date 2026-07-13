import { useEffect, useRef } from 'react';

import {
  AIMessage,
  ChatInput,
  ChatLoader,
  ConversationList,
  ModelSelector,
  UserMessage,
} from '@components/chat';
import { ApiErrorMessage } from '@components/common/ApiErrorMessage';
import {
  useConversations,
  useCreateConversation,
  useMessages,
  useModels,
  useSendMessage,
} from '@features/ai/hooks';
import { useChatStore } from '@store/chat.store';

export function ChatWindow() {
  const { data: conversations = [], isLoading: conversationsLoading } = useConversations();
  const { data: models = [] } = useModels();

  const activeConversationId = useChatStore((state) => state.activeConversationId);
  const setActiveConversationId = useChatStore((state) => state.setActiveConversationId);
  const selectedModelId = useChatStore((state) => state.selectedModelId);
  const setSelectedModelId = useChatStore((state) => state.setSelectedModelId);
  const draftMessage = useChatStore((state) => state.draftMessage);
  const setDraftMessage = useChatStore((state) => state.setDraftMessage);
  const clearDraft = useChatStore((state) => state.clearDraft);

  const createConversation = useCreateConversation();
  const {
    data: messages = [],
    isLoading: messagesLoading,
    error: messagesError,
  } = useMessages(activeConversationId);
  const sendMessage = useSendMessage(activeConversationId ?? '');

  const scrollAnchorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSend = () => {
    if (!activeConversationId || !draftMessage.trim()) return;
    sendMessage.mutate(draftMessage.trim());
    clearDraft();
  };

  return (
    <div className="border-border flex h-full overflow-hidden rounded-lg border">
      <ConversationList
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelect={setActiveConversationId}
        onCreate={() => {
          if (!selectedModelId) return;
          createConversation.mutate(selectedModelId, {
            onSuccess: (conversation) => setActiveConversationId(conversation.id),
          });
        }}
      />

      <div className="flex flex-1 flex-col">
        <div className="border-border flex items-center justify-between border-b p-3">
          <span className="text-foreground text-sm font-semibold">
            {conversations.find((c) => c.id === activeConversationId)?.title ??
              'Let’s start with your idea'}
          </span>
          <ModelSelector
            models={models}
            selectedModelId={selectedModelId}
            onChange={setSelectedModelId}
          />
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {conversationsLoading || messagesLoading ? <ChatLoader /> : null}
          {messagesError ? <ApiErrorMessage error={messagesError} /> : null}

          {!activeConversationId && !conversationsLoading ? (
            <p className="text-muted-foreground mt-10 text-center text-sm">
              Select or start a conversation to begin chatting with your AI co-founder.
            </p>
          ) : null}

          {messages.map((message) =>
            message.role === 'user' ? (
              <UserMessage key={message.id} message={message} />
            ) : (
              <AIMessage key={message.id} message={message} />
            ),
          )}
          <div ref={scrollAnchorRef} />
        </div>

        <div className="border-border border-t p-3">
          <ChatInput
            value={draftMessage}
            onChange={setDraftMessage}
            onSubmit={handleSend}
            disabled={!activeConversationId || sendMessage.isPending}
          />
        </div>
      </div>
    </div>
  );
}
