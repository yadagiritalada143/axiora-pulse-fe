import { MessageSquarePlus } from 'lucide-react';

import type { Conversation } from '@/types/chat.types';
import { Button } from '@components/ui/button';
import { cn } from '@lib/utils';
import { formatRelativeTime } from '@utils/date';

interface ConversationListProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelect: (id: string) => void;
  onCreate: () => void;
}

export function ConversationList({
  conversations,
  activeConversationId,
  onSelect,
  onCreate,
}: ConversationListProps) {
  return (
    <div className="border-border flex h-full w-72 shrink-0 flex-col border-r">
      <div className="border-border flex items-center justify-between border-b p-3">
        <span className="text-foreground text-sm font-semibold">Conversations</span>
        <Button variant="ghost" size="icon" aria-label="New conversation" onClick={onCreate}>
          <MessageSquarePlus className="size-4" />
        </Button>
      </div>

      <ul className="flex-1 space-y-1 overflow-y-auto p-2">
        {conversations.map((conversation) => (
          <li key={conversation.id}>
            <button
              type="button"
              onClick={() => onSelect(conversation.id)}
              className={cn(
                'hover:bg-accent w-full rounded-md px-3 py-2 text-left text-sm transition-colors',
                conversation.id === activeConversationId && 'bg-accent text-accent-foreground',
              )}
            >
              <span className="block truncate font-medium">{conversation.title}</span>
              {conversation.lastMessagePreview ? (
                <span className="text-muted-foreground block truncate text-xs">
                  {conversation.lastMessagePreview}
                </span>
              ) : null}
              <span className="text-muted-foreground/70 block text-xs">
                {formatRelativeTime(conversation.updatedAt)}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
