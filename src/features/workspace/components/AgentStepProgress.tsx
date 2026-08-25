import { Check, ChevronDown, ChevronUp, Loader2, Sparkles, TrendingUp } from 'lucide-react';
import { useState } from 'react';

import { cn } from '@/lib/utils';
import { Badge } from '@components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';

import { AGENT_STEPS } from '../utils/agentStep.utils';

interface AgentStepProgressProps {
  currentStep?: number;
  isRunning?: boolean;
  className?: string;
}

export function AgentStepProgress({
  currentStep = 1,
  isRunning = false,
  className,
}: AgentStepProgressProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [selectedStep, setSelectedStep] = useState<number | null>(null);

  const activeStepObj = AGENT_STEPS.find((s) => s.id === currentStep) ??
    AGENT_STEPS[0] ?? {
      id: 1,
      name: 'Idea Validation',
    };

  const toggleStepDetails = (id: number) => {
    setSelectedStep((prev) => (prev === id ? null : id));
  };

  return (
    <div className={cn('w-full', className)}>
      <div className="mb-4 block lg:hidden">
        <Card className="border-border bg-card shadow-2xs">
          <button
            type="button"
            onClick={() => setIsMobileOpen((prev) => !prev)}
            className="hover:bg-muted/30 flex w-full items-center justify-between rounded-xl p-3.5 text-left transition-colors"
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#FF4500]/10 text-[#FF4500]">
                <Sparkles className="size-4 animate-pulse" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                    Agent Workflow
                  </p>
                  <Badge variant="secondary" className="h-4 px-1.5 py-0 text-[10px]">
                    Step {currentStep} of {AGENT_STEPS.length}
                  </Badge>
                </div>
                <p className="text-foreground mt-0.5 truncate text-sm font-semibold">
                  {activeStepObj.name}
                </p>
              </div>
            </div>
            <div className="text-muted-foreground ml-2 shrink-0">
              {isMobileOpen ? <ChevronUp className="size-5" /> : <ChevronDown className="size-5" />}
            </div>
          </button>

          {isMobileOpen ? (
            <CardContent className="border-border mt-1 max-h-[60vh] overflow-y-auto border-t px-4 pt-0 pb-4">
              <div className="space-y-3 pt-3">
                {AGENT_STEPS.map((step) => {
                  const isCompleted = step.id < currentStep;
                  const isActive = step.id === currentStep;
                  const isExpanded = selectedStep === step.id;

                  return (
                    <div
                      key={step.id}
                      className={cn(
                        'flex flex-col gap-1.5 rounded-lg p-2 transition-colors',
                        isExpanded ? 'bg-muted/40' : 'hover:bg-muted/20',
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => toggleStepDetails(step.id)}
                        className="flex w-full items-center gap-3 text-left focus:outline-none"
                      >
                        <div
                          className={cn(
                            'flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all duration-300',
                            isCompleted
                              ? 'animate-in zoom-in-50 bg-emerald-500 text-white'
                              : isActive
                                ? cn(
                                    'bg-[#FF4500] text-white ring-2 ring-[#FF4500]/30',
                                    isRunning && 'animate-pulse',
                                  )
                                : 'border-border text-muted-foreground bg-background border',
                          )}
                        >
                          {isCompleted ? <Check className="size-4 stroke-[3]" /> : step.id}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <p
                              className={cn(
                                'text-xs font-medium',
                                isActive
                                  ? 'text-foreground font-semibold'
                                  : isCompleted
                                    ? 'text-foreground/80'
                                    : 'text-muted-foreground',
                              )}
                            >
                              {step.name}
                            </p>
                          </div>
                        </div>
                        {isCompleted ? (
                          <Badge
                            variant="outline"
                            className="border-emerald-500/20 bg-emerald-500/10 text-[10px] text-emerald-600"
                          >
                            Completed
                          </Badge>
                        ) : isActive ? (
                          <Badge variant="default" className="bg-[#FF4500] text-[10px]">
                            {isRunning ? 'Running' : 'Active'}
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-muted-foreground text-[10px]">
                            Pending
                          </Badge>
                        )}
                      </button>

                      {isExpanded ? (
                        <div className="animate-in fade-in pt-1 pl-10 text-[11px] duration-200">
                          <p className="text-muted-foreground/80 mb-1.5 text-[10px] font-medium">
                            {step.description}
                          </p>
                          <ul className="text-muted-foreground space-y-1 border-l-2 border-[#FF4500]/30 pl-2.5">
                            {step.details.map((detail, idx) => (
                              <li key={idx} className="leading-tight">
                                • {detail}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          ) : null}
        </Card>
      </div>

      <div className="hidden lg:block">
        <Card className="border-border bg-card/60 flex h-[570px] max-h-[570px] flex-col overflow-hidden rounded-2xl shadow-xs backdrop-blur-xs">
          <CardHeader className="border-border bg-muted/20 shrink-0 border-b p-4 pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-lg bg-[#FF4500]/10 text-[#FF4500]">
                  <TrendingUp className="size-4 text-green-500" />
                </div>
                <CardTitle className="text-sm font-bold tracking-tight">
                  Business Lifecycle
                </CardTitle>
              </div>
              <Badge
                variant="outline"
                className="border-[#FF4500]/30 bg-[#FF4500]/5 font-mono text-[11px] font-medium text-[#FF4500]"
              >
                {currentStep}/{AGENT_STEPS.length} Steps
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="min-h-0 flex-1 scrollbar-thin overflow-y-auto p-3 pr-2">
            <div className="relative space-y-2.5">
              {AGENT_STEPS.map((step, index) => {
                const isCompleted = step.id < currentStep;
                const isActive = step.id === currentStep;
                const isLast = index === AGENT_STEPS.length - 1;
                const isExpanded = selectedStep === step.id;

                return (
                  <div
                    key={step.id}
                    className={cn(
                      'group relative flex items-start gap-3 rounded-xl p-2 transition-all duration-200',
                      isExpanded
                        ? 'bg-muted/50 ring-border/80 shadow-2xs ring-1'
                        : 'hover:bg-muted/20',
                    )}
                  >
                    {!isLast && (
                      <div
                        className={cn(
                          'absolute top-8 bottom-[-14px] left-5.5 z-0 w-[2px] transition-colors duration-500',
                          isCompleted ? 'bg-emerald-500' : 'bg-border dark:bg-muted/40',
                        )}
                      />
                    )}

                    <div
                      className={cn(
                        'relative z-10 mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold shadow-2xs transition-all duration-300',
                        isCompleted
                          ? 'animate-in zoom-in-75 bg-emerald-500 text-white shadow-emerald-500/20 duration-300'
                          : isActive
                            ? 'scale-105 bg-[#FF4500] text-white ring-4 shadow-[#FF4500]/30 ring-[#FF4500]/20'
                            : isExpanded
                              ? 'bg-background border-2 border-[#FF4500]/50 text-[#FF4500] ring-2 ring-[#FF4500]/15'
                              : 'border-border bg-background text-muted-foreground border-2',
                      )}
                    >
                      {isCompleted ? (
                        <Check className="animate-in fade-in zoom-in size-3.5 stroke-[3] duration-300" />
                      ) : (
                        <span>{step.id}</span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={() => toggleStepDetails(step.id)}
                        className="w-full text-left focus:outline-none"
                      >
                        <div className="flex items-start justify-between gap-1.5">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <p
                                className={cn(
                                  'text-xs leading-tight font-bold transition-colors group-hover:text-[#FF4500]',
                                  isActive
                                    ? 'text-foreground font-bold'
                                    : isCompleted
                                      ? 'text-foreground/90'
                                      : 'text-muted-foreground',
                                )}
                              >
                                {step.name}
                              </p>
                            </div>
                          </div>

                          {isCompleted ? (
                            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                              Done
                            </span>
                          ) : isActive ? (
                            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#FF4500]/10 px-1.5 py-0.5 text-[10px] font-semibold text-[#FF4500]">
                              {isRunning && <Loader2 className="size-2.5 animate-spin" />}
                              {isRunning ? 'Running' : 'Active'}
                            </span>
                          ) : (
                            <span className="text-muted-foreground/60 shrink-0 text-[10px]">
                              Pending
                            </span>
                          )}
                        </div>

                        <p className="text-muted-foreground mt-1 text-[11px] leading-snug">
                          {step.description}
                        </p>
                      </button>

                      {isExpanded ? (
                        <div className="animate-in fade-in mt-2 border-l-2 border-[#FF4500]/30 pl-2.5 duration-200">
                          <p className="text-muted-foreground/90 mb-1 text-[10px] font-medium tracking-wide uppercase">
                            Key Activities & Scope
                          </p>
                          <ul className="text-muted-foreground space-y-1 text-[11px]">
                            {step.details.map((detail, idx) => (
                              <li key={idx} className="leading-tight">
                                • {detail}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
