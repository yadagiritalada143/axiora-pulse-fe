import { Loader2, MapPin, Sparkles } from 'lucide-react';
import { useState } from 'react';

import { ApiErrorMessage } from '@components/common/ApiErrorMessage';
import { Input } from '@components/ui/input';
import { Textarea } from '@components/ui/textarea';
import { cn } from '@lib/utils';

const DESCRIPTION_MAX_LENGTH = 2000;

const EXAMPLE_IDEAS = [
  {
    title: 'Example 1',
    description: 'AI-powered platform that helps founders validate their ideas faster.',
  },
  {
    title: 'Example 1',
    description: 'AI-powered platform that helps founders validate their ideas faster.',
  },
  {
    title: 'Example 1',
    description: 'AI-powered platform that helps founders validate their ideas faster.',
  },
  {
    title: 'Example 1',
    description: 'AI-powered platform that helps founders validate their ideas faster.',
  },
];

interface WorkspaceMentorIntakeProps {
  onSubmit: (message: string) => void;
  isPending: boolean;
  error?: unknown;
}

export function WorkspaceMentorIntake({ onSubmit, isPending, error }: WorkspaceMentorIntakeProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const canSubmit = title.trim().length > 0 && description.trim().length > 0 && !isPending;

  function handleContinue() {
    if (!canSubmit) return;
    onSubmit(`Idea title: ${title.trim()}\n\n${description.trim()}`);
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <div>
        <h1 className="text-foreground text-xl font-semibold sm:text-2xl">
          Let&apos;s start with your idea.
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Share your startup idea in your own words. The more context you provide, the better your
          AI Co-Founder can understand your vision and guide you with personalized insights.
        </p>
      </div>

      <div className="border-border rounded-lg border p-4">
        <label htmlFor="idea-title" className="text-foreground mb-2 block text-sm font-medium">
          Idea Title
        </label>
        <Input
          id="idea-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Give your idea a short, memorable title"
          disabled={isPending}
        />
      </div>

      <div className="border-border rounded-lg border p-4">
        <label
          htmlFor="idea-description"
          className="text-foreground mb-2 block text-sm font-medium"
        >
          Describe your startup Idea….
        </label>
        <Textarea
          id="idea-description"
          value={description}
          onChange={(event) => setDescription(event.target.value.slice(0, DESCRIPTION_MAX_LENGTH))}
          placeholder="What problem are you solving Who is it for How does your solution work What makes it different"
          disabled={isPending}
          className="min-h-32 resize-none border-none px-0 shadow-none focus-visible:ring-0"
        />
        <p className="text-muted-foreground text-right text-xs">
          {description.length}/{DESCRIPTION_MAX_LENGTH} Characters
        </p>
      </div>

      <div className="sm:hidden">
        <ContinueButton
          isPending={isPending}
          canSubmit={canSubmit}
          onClick={handleContinue}
          className="w-full"
        />
      </div>

      <div>
        <p className="text-foreground mb-3 text-sm font-medium">Need help getting started?</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {EXAMPLE_IDEAS.map((example, index) => (
            <div key={index} className="border-border rounded-lg border p-4">
              <span className="bg-primary/10 text-primary mb-3 flex size-8 items-center justify-center rounded-full">
                <Sparkles className="size-4" aria-hidden />
              </span>
              <p className="text-foreground text-sm font-medium">{example.title}</p>
              <p className="text-muted-foreground mt-1 text-xs">{example.description}</p>
            </div>
          ))}
        </div>
      </div>

      {error ? <ApiErrorMessage error={error} /> : null}

      <div className="bg-primary/10 flex flex-col gap-3 rounded-lg px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-foreground flex items-center gap-2 text-xs sm:text-sm">
          <MapPin className="size-4 shrink-0" aria-hidden />
          Your idea is safe with us. We treat our information with the highest Confidentiality.
        </p>
        <ContinueButton
          isPending={isPending}
          canSubmit={canSubmit}
          onClick={handleContinue}
          className="hidden shrink-0 sm:flex"
        />
      </div>
    </div>
  );
}

interface ContinueButtonProps {
  isPending: boolean;
  canSubmit: boolean;
  onClick: () => void;
  className?: string;
}

function ContinueButton({ isPending, canSubmit, onClick, className }: ContinueButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!canSubmit}
      className={cn(
        'bg-primary text-primary-foreground hover:bg-primary/90 flex h-9 items-center justify-center gap-2 rounded-md px-6 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
    >
      {isPending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
      {isPending ? 'Starting…' : 'Continue'}
    </button>
  );
}
