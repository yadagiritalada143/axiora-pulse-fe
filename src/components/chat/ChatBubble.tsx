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

      <div
        className={cn(
          'flex flex-col gap-1',
          isRight ? 'max-w-[85%] items-end sm:max-w-[75%]' : 'w-full max-w-full min-w-0 flex-1',
        )}
      >
        <div
          className={cn(
            'bg-muted text-foreground rounded-2xl px-4 py-2.5',
            isRight ? 'rounded-tr-sm' : 'w-full rounded-tl-sm',
          )}
        >
          {children}
        </div>
        {timestamp ? <span className="text-muted-foreground px-1 text-xs">{timestamp}</span> : null}
      </div>
    </div>
  );
}
