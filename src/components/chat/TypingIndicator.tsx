export function TypingIndicator() {
  return (
    <div
      className="flex items-center gap-1 px-1 py-2"
      role="status"
      aria-label="Assistant is typing"
    >
      {[0, 1, 2].map((index) => (
        <span
          key={index}
          className="bg-muted-foreground/60 size-1.5 animate-bounce rounded-full"
          style={{ animationDelay: `${index * 120}ms` }}
        />
      ))}
    </div>
  );
}
