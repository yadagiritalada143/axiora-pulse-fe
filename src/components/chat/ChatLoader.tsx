import { Skeleton } from '@components/ui/skeleton';

/** Skeleton shown while a conversation's message history is loading. */
export function ChatLoader() {
  return (
    <div className="space-y-4 p-4">
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className="flex items-start gap-3"
          style={{ flexDirection: index % 2 ? 'row-reverse' : 'row' }}
        >
          <Skeleton className="size-8 shrink-0 rounded-full" />
          <Skeleton className="h-12 w-2/3 rounded-2xl" />
        </div>
      ))}
    </div>
  );
}
