import { Bot, Check, ChevronDown, ChevronUp, Loader2, Sparkles } from 'lucide-react';
import { useState } from 'react';

import { cn } from '@/lib/utils';
import { Badge } from '@components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';

import { AGENT_STEPS } from '../utils/agentStep.utils';

interface AgentStepProgressProps {
  currentStep?: number;
  className?: string;
}

export function AgentStepProgress({ currentStep = 1, className }: AgentStepProgressProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  const activeStepObj = AGENT_STEPS.find((s) => s.id === currentStep) ?? {
    id: 1,
    name: 'Idea Validation Agent',
  };

  const toggleDetails = (id: number) => {
    setExpandedStep((prev) => (prev === id ? null : id));
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
            <CardContent className="border-border mt-1 border-t px-4 pt-0 pb-4">
              <div className="space-y-3 pt-3">
                {AGENT_STEPS.map((step) => {
                  const isCompleted = step.id < currentStep;
                  const isActive = step.id === currentStep;

                  return (
                    <div key={step.id} className="flex flex-col gap-1">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            'flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all duration-300',
                            isCompleted
                              ? 'animate-in zoom-in-50 bg-emerald-500 text-white'
                              : isActive
                                ? 'animate-pulse bg-[#FF4500] text-white ring-2 ring-[#FF4500]/30'
                                : 'border-border text-muted-foreground bg-background border',
                          )}
                        >
                          {isCompleted ? <Check className="size-4 stroke-[3]" /> : step.id}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p
                            className={cn(
                              'truncate text-xs font-medium',
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
                        {isCompleted ? (
                          <Badge
                            variant="outline"
                            className="border-emerald-500/20 bg-emerald-500/10 text-[10px] text-emerald-600"
                          >
                            Completed
                          </Badge>
                        ) : isActive ? (
                          <Badge variant="default" className="bg-[#FF4500] text-[10px]">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-muted-foreground text-[10px]">
                            Pending
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          ) : null}
        </Card>
      </div>

      <div className="hidden lg:block">
        <Card className="border-border bg-card/60 sticky top-4 overflow-hidden rounded-2xl shadow-xs backdrop-blur-xs">
          <CardHeader className="border-border bg-muted/20 border-b p-4 pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-lg bg-[#FF4500]/10 text-[#FF4500]">
                  <Bot className="size-4" />
                </div>
                <CardTitle className="text-sm font-bold tracking-tight">Agent Pipeline</CardTitle>
              </div>
              <Badge
                variant="outline"
                className="border-[#FF4500]/30 bg-[#FF4500]/5 font-mono text-[11px] font-medium text-[#FF4500]"
              >
                {currentStep}/{AGENT_STEPS.length} Steps
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-4">
            <div className="relative space-y-4">
              {AGENT_STEPS.map((step, index) => {
                const isCompleted = step.id < currentStep;
                const isActive = step.id === currentStep;
                const isLast = index === AGENT_STEPS.length - 1;
                const isExpanded = expandedStep === step.id;

                return (
                  <div key={step.id} className="group relative flex items-start gap-3">
                    {!isLast && (
                      <div
                        className={cn(
                          'absolute top-8 bottom-[-16px] left-3.5 z-0 w-[2px] transition-colors duration-500',
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
                      <div className="flex items-start justify-between gap-1.5">
                        <button
                          type="button"
                          onClick={() => toggleDetails(step.id)}
                          className="text-left transition-colors group-hover:text-[#FF4500] focus:outline-none"
                        >
                          <p
                            className={cn(
                              'text-xs leading-tight font-bold transition-colors',
                              isActive
                                ? 'text-foreground font-bold'
                                : isCompleted
                                  ? 'text-foreground/90'
                                  : 'text-muted-foreground',
                            )}
                          >
                            {step.name}
                          </p>
                        </button>

                        {isCompleted ? (
                          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                            Done
                          </span>
                        ) : isActive ? (
                          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#FF4500]/10 px-1.5 py-0.5 text-[10px] font-semibold text-[#FF4500]">
                            <Loader2 className="size-2.5 animate-spin" />
                            Running
                          </span>
                        ) : (
                          <span className="text-muted-foreground/60 shrink-0 text-[10px]">
                            Pending
                          </span>
                        )}
                      </div>

                      <p className="text-muted-foreground mt-0.5 text-[11px] leading-snug">
                        {step.description}
                      </p>

                      {isExpanded ? (
                        <ul className="text-muted-foreground/90 animate-in fade-in mt-2 space-y-1 border-l-2 border-[#FF4500]/30 pl-3 text-[11px] duration-200">
                          {step.details.map((detail, idx) => (
                            <li key={idx} className="leading-tight">
                              • {detail}
                            </li>
                          ))}
                        </ul>
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
