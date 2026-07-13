import type { ReactNode } from 'react';

import { Avatar, AvatarFallback } from '@components/ui/avatar';
import { cn } from '@lib/utils';

interface ChatBubbleProps {
  align: 'left' | 'right';
  avatarLabel: string;
  timestamp?: string;
  children: ReactNode;
}

/** Shared bubble shell used by both `UserMessage` and `AIMessage`. */
export function ChatBubble({ align, avatarLabel, timestamp, children }: ChatBubbleProps) {
  const isRight = align === 'right';

  return (
    <div className={cn('flex w-full items-start gap-3', isRight && 'flex-row-reverse')}>
      <Avatar className="mt-0.5 size-8 shrink-0">
        <AvatarFallback className={isRight ? 'bg-primary text-primary-foreground' : undefined}>
          {avatarLabel}
        </AvatarFallback>
      </Avatar>

      <div className={cn('flex max-w-[75%] flex-col gap-1', isRight && 'items-end')}>
        <div
          className={cn(
            'rounded-2xl px-4 py-2.5',
            isRight
              ? 'bg-primary text-primary-foreground rounded-tr-sm'
              : 'bg-muted text-foreground rounded-tl-sm',
          )}
        >
          {children}
        </div>
        {timestamp ? <span className="text-muted-foreground px-1 text-xs">{timestamp}</span> : null}
      </div>
    </div>
  );
}
