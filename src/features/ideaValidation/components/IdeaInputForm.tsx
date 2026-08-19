import { Loader2, MapPin, Sparkles } from 'lucide-react';
import { useState } from 'react';

import type {
  OrchestrationRunRequest,
  OrchestrationRunResponse,
} from '@/types/orchestration.types';
import { ApiErrorMessage } from '@components/common/ApiErrorMessage';
import { Input } from '@components/ui/input';
import { Textarea } from '@components/ui/textarea';
import { cn } from '@lib/utils';

import { useRunOrchestration } from '../hooks';

const EXAMPLE_IDEAS = [
  {
    title: 'AI Micro-SaaS Accelerator',
    description:
      'A dev-tool that generates production-ready SaaS boilerplates with auth, database, and stripe billing configured in under 5 minutes.',
  },
  {
    title: 'Visual Math AI Tutor',
    description:
      'An interactive mobile learning platform that provides step-by-step visual explanations and personalized AI coaching for students.',
  },
  {
    title: 'Fleet Route Optimizer',
    description:
      'An intelligent route planning system for delivery fleets that dynamically avoids traffic, reduces fuel costs, and lowers CO2 emission.',
  },
  {
    title: 'Lifestyle Health Tracker',
    description:
      'An AI-powered wellness dashboard that monitors habits, provides proactive symptoms screening, and recommends preventative health actions.',
  },
];

interface IdeaInputFormProps {
  workspaceId: string;
  onValidated: (response: OrchestrationRunResponse, title: string) => void;
}

export function IdeaInputForm({ workspaceId, onValidated }: IdeaInputFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const { mutate, isPending, error } = useRunOrchestration();

  const canSubmit = title.trim().length > 0 && description.trim().length > 0 && !isPending;

  const handleContinue = () => {
    if (!canSubmit) return;

    const payload: OrchestrationRunRequest = {
      workspace_id: workspaceId,
      idea_id: '1',
      workflow_type: 'idea_validation',
      idea: {
        idea_title: title.trim(),
        idea_description: description.trim(),
        problem_statement:
          'Small and medium retailers struggle with inventory forecasting, leading to overstocking, stockouts, and revenue loss due to inaccurate demand planning.',
        target_customer:
          'Small and medium-sized retail businesses, e-commerce store owners, and warehouse managers.',
        industry: 'Retail Technology',
        founder_validation_goal:
          'Validate whether retailers are willing to pay for AI-driven inventory forecasting and automation.',
        geography: 'Global',
      },
    };

    mutate(payload, {
      onSuccess: (response) => onValidated(response, title.trim()),
    });
  };

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
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
          Describe your Idea….
        </label>
        <Textarea
          id="idea-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="What problem are you solving Who is it for How does your solution work What makes it different"
          disabled={isPending}
          className="min-h-32 resize-none border-none px-0 shadow-none focus-visible:ring-0"
        />
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
            <button
              key={index}
              type="button"
              onClick={() => {
                setTitle(example.title);
                setDescription(example.description);
              }}
              disabled={isPending}
              className="border-border group cursor-pointer rounded-lg border p-4 text-left transition-all duration-200 hover:border-[#FF4500]/50 hover:bg-[#FF4500]/5 focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-[#FF4500] focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="mb-3 flex size-8 items-center justify-center rounded-full bg-[#FF4500]/10 text-[#FF4500] transition-transform duration-200 group-hover:scale-110">
                <Sparkles className="size-4" aria-hidden />
              </span>
              <p className="text-foreground text-sm font-semibold transition-colors group-hover:text-[#FF4500]">
                {example.title}
              </p>
              <p className="text-muted-foreground mt-1 line-clamp-3 text-xs leading-normal">
                {example.description}
              </p>
            </button>
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
      {isPending ? 'Validating…' : 'Continue'}
    </button>
  );
}
