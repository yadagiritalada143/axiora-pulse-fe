import type { ChatMessage } from '@/types/chat.types';
import { formatRelativeTime } from '@utils/date';

import { ChatBubble } from './ChatBubble';
import { MarkdownRenderer } from './MarkdownRenderer';
import { TypingIndicator } from './TypingIndicator';

export function AIMessage({ message }: { message: ChatMessage }) {
  const isTyping = message.isStreaming && !message.content;

  return (
    <ChatBubble
      align="left"
      avatarLabel="AI"
      timestamp={formatRelativeTime(message.createdAt)}
      bubbleClassName={isTyping ? 'w-fit self-start' : undefined}
    >
      {isTyping ? <TypingIndicator /> : <MarkdownRenderer content={message.content} />}
    </ChatBubble>
  );
}
