import type { ChatMessage } from '@/types/chat.types';
import { formatRelativeTime } from '@utils/date';

import { ChatBubble } from './ChatBubble';
import { MarkdownRenderer } from './MarkdownRenderer';
import { TypingIndicator } from './TypingIndicator';

export function AIMessage({ message }: { message: ChatMessage }) {
  return (
    <ChatBubble align="left" avatarLabel="AI" timestamp={formatRelativeTime(message.createdAt)}>
      {message.isStreaming && !message.content ? (
        <TypingIndicator />
      ) : (
        <MarkdownRenderer content={message.content} />
      )}
    </ChatBubble>
  );
}
