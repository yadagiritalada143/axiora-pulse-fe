import type { ChatMessage } from '@/types/chat.types';
import { formatRelativeTime } from '@utils/date';

import { ChatBubble } from './ChatBubble';

export function UserMessage({ message }: { message: ChatMessage }) {
  return (
    <ChatBubble align="right" avatarLabel="U" timestamp={formatRelativeTime(message.createdAt)}>
      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
    </ChatBubble>
  );
}
