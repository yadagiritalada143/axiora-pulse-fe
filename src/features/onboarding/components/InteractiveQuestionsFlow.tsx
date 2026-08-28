import { AnimatePresence, motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { useState } from 'react';
import { createPortal } from 'react-dom';

import type {
  InteractiveAnswerDraft,
  InteractiveAnswerPayload,
  InteractiveQuestion,
} from '@/types/onboarding.types';
import { ThemeToggle } from '@components/common/ThemeToggle';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@components/ui/alert-dialog';
import { Button } from '@components/ui/button';
import { STORAGE_KEYS } from '@constants/storage';
import { useSubmitInteractiveAnswers } from '@features/onboarding/hooks';
import { cn } from '@lib/utils';
import { useAuthStore } from '@store/auth.store';
import { storage } from '@utils/storage';

import { QuestionRenderer } from './QuestionRenderer';

type Phase = 'questions' | 'complete';

interface QuestionsDraft {
  stepIndex: number;
  answers: InteractiveAnswerDraft;
}

function loadDraft(): QuestionsDraft | null {
  const draft = storage.get<QuestionsDraft>(STORAGE_KEYS.INTERACTIVE_QUESTIONS_DRAFT);
  return draft && Object.keys(draft.answers).length > 0 ? draft : null;
}

function persistDraft(draft: QuestionsDraft): void {
  storage.set(STORAGE_KEYS.INTERACTIVE_QUESTIONS_DRAFT, draft);
}

/**
 * Both radio/dropdown (`['other', text]`) and multi-select (`[...selections, 'other', text]`)
 * encode a free-text "Other" answer as the sentinel followed by the entered text.
 */
function isAnswered(value: string[] | undefined): boolean {
  if (!value || value.length === 0) return false;
  const otherIndex = value.indexOf('other');
  if (otherIndex === -1) return value.some((v) => v.trim().length > 0);
  const hasRegularSelection = otherIndex > 0;
  const otherText = value[otherIndex + 1] ?? '';
  return hasRegularSelection || otherText.trim().length > 0;
}

/** Depth styling for the "papers" stacked behind the current question card, nearest first. */
const SHEET_DEPTHS = [
  { y: 8, rotate: -2.5, scale: 0.97, opacity: 0.9 },
  { y: 16, rotate: 3, scale: 0.94, opacity: 0.6 },
];

/** Slide direction is passed in via the `custom` prop so enter/exit read the same step. */
const questionCardVariants = {
  enter: (direction: number) => ({ opacity: 0, x: direction >= 0 ? 16 : -16 }),
  center: { opacity: 1, x: 0 },
  exit: (direction: number) => ({ opacity: 0, x: direction >= 0 ? -16 : 16 }),
};

interface InteractiveQuestionsFlowProps {
  questions: InteractiveQuestion[];
  onCompleted?: () => void;
}

export function InteractiveQuestionsFlow({
  questions,
  onCompleted,
}: InteractiveQuestionsFlowProps) {
  const [dismissed, setDismissed] = useState(false);
  const [phase, setPhase] = useState<Phase>('questions');
  const [stepIndex, setStepIndex] = useState(() => loadDraft()?.stepIndex ?? 0);
  const [answers, setAnswers] = useState<InteractiveAnswerDraft>(() => loadDraft()?.answers ?? {});
  const [showRetakeConfirm, setShowRetakeConfirm] = useState(false);
  const [direction, setDirection] = useState(1);

  const submitAnswers = useSubmitInteractiveAnswers();

  const setHasCompletedQuestionnaire = useAuthStore((state) => state.setHasCompletedQuestionnaire);

  const currentQuestion = questions[Math.min(stepIndex, questions.length - 1)];

  if (dismissed || questions.length === 0 || !currentQuestion) return null;

  const total = questions.length;
  const currentValue = answers[currentQuestion.id] ?? [];
  const canGoNext = currentQuestion.optional || isAnswered(currentValue);
  const upcomingQuestions = questions.slice(stepIndex + 1, stepIndex + 1 + SHEET_DEPTHS.length);

  const handleAnswerChange = (value: string[]) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }));
  };

  const handleNext = () => {
    const nextStepIndex = stepIndex + 1;
    persistDraft({ stepIndex: nextStepIndex, answers });
    setDirection(1);

    if (nextStepIndex >= total) {
      setPhase('complete');
    } else {
      setStepIndex(nextStepIndex);
    }
  };

  const handleBack = () => {
    if (stepIndex === 0) return;
    const prevStepIndex = stepIndex - 1;
    setDirection(-1);
    setStepIndex(prevStepIndex);
    persistDraft({ stepIndex: prevStepIndex, answers });
  };

  const handleRetakeConfirmed = () => {
    storage.remove(STORAGE_KEYS.INTERACTIVE_QUESTIONS_DRAFT);
    setAnswers({});
    setDirection(-1);
    setStepIndex(0);
    setShowRetakeConfirm(false);
    setPhase('questions');
  };

  const handleSubmit = () => {
    const payload: InteractiveAnswerPayload[] = questions
      .filter((question) => isAnswered(answers[question.id]))
      .map((question) => ({
        questionnaire_id: question.id,
        user_answers: answers[question.id] ?? [],
      }));

    submitAnswers.mutate(payload, {
      onSuccess: () => {
        storage.remove(STORAGE_KEYS.INTERACTIVE_QUESTIONS_DRAFT);
        setHasCompletedQuestionnaire(true);
        setDismissed(true);

        if (onCompleted) {
          onCompleted();
        }
      },
    });
  };

  return createPortal(
    <>
      {phase === 'questions' ? (
        <div className="bg-background fixed inset-0 z-50 flex flex-col overflow-y-auto">
          <div
            aria-hidden
            className="from-primary/25 via-primary/5 pointer-events-none absolute inset-0 bg-gradient-to-br to-transparent"
          />

          <div className="relative z-10 flex items-center justify-between px-4 pt-4 sm:px-8 sm:pt-6">
            <PulseWordmark />
            <ThemeToggle />
          </div>

          <div className="relative z-10 flex flex-1 items-center justify-center px-4 py-6 sm:px-8">
            <div className="relative w-full max-w-lg">
              <AnimatePresence initial={false}>
                {upcomingQuestions.map((question, depth) => {
                  const sheet = SHEET_DEPTHS[depth];
                  return (
                    <motion.div
                      key={question.id}
                      aria-hidden
                      className="bg-card border-border absolute inset-0 rounded-lg border shadow-sm"
                      style={{ zIndex: 10 - depth }}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={sheet}
                      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
                      transition={{ duration: 0.25, ease: 'easeOut' }}
                    />
                  );
                })}
              </AnimatePresence>

              <AnimatePresence mode="popLayout" initial={false} custom={direction}>
                <motion.div
                  key={currentQuestion.id}
                  custom={direction}
                  variants={questionCardVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                  style={{ zIndex: 20 }}
                  className="bg-background relative flex flex-col overflow-hidden rounded-lg shadow-lg"
                >
                  <QuestionView
                    question={currentQuestion}
                    stepIndex={stepIndex}
                    total={total}
                    value={currentValue}
                    canGoNext={canGoNext}
                    onChange={handleAnswerChange}
                    onBack={handleBack}
                    onNext={handleNext}
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-muted fixed inset-0 z-50 flex flex-col px-4 pt-2 pb-4 sm:px-6 sm:pb-6">
          <div className="bg-background relative mx-auto flex w-full flex-1 flex-col justify-center overflow-hidden rounded-lg shadow-sm">
            <CompleteView
              submitting={submitAnswers.isPending}
              onRetake={() => setShowRetakeConfirm(true)}
              onSubmit={handleSubmit}
            />
          </div>
        </div>
      )}

      <RetakeConfirmDialog
        open={showRetakeConfirm}
        onOpenChange={setShowRetakeConfirm}
        onConfirm={handleRetakeConfirmed}
      />
    </>,
    document.body,
  );
}
function PulseWordmark() {
  return (
    <div className="w-24">
      <p className="font-display text-foreground text-xs font-semibold">AXIORA</p>

      <div className="flex justify-end">
        <span className="font-display text-foreground flex items-center text-2xl font-semibold">
          Pulse
          <span className="bg-primary ml-0.5 size-1.5 rounded-full" />
        </span>
      </div>
    </div>
  );
}

function QuestionView({
  question,
  stepIndex,
  total,
  value,
  canGoNext,
  onChange,
  onBack,
  onNext,
}: {
  question: InteractiveQuestion;
  stepIndex: number;
  total: number;
  value: string[];
  canGoNext: boolean;
  onChange: (value: string[]) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex flex-col px-6 py-8">
      <div
        className="mb-6 flex items-center gap-1.5"
        role="progressbar"
        aria-valuenow={stepIndex + 1}
        aria-valuemin={1}
        aria-valuemax={total}
      >
        {Array.from({ length: total }).map((_, idx) => (
          <span
            key={idx}
            className={cn(
              'h-1 flex-1 rounded-full',
              idx <= stepIndex ? 'bg-foreground' : 'bg-border',
            )}
          />
        ))}
      </div>

      <div className="flex items-start justify-between">
        <p className="text-muted-foreground text-xs font-medium">
          Question {stepIndex + 1} &nbsp;
          {question.optional ? (
            <span className="text-muted-foreground text-xs font-normal">(Optional)</span>
          ) : (
            <span className="text-destructive text-sm" aria-hidden>
              *
            </span>
          )}
        </p>

        {question.optional && (
          <button
            type="button"
            aria-label="Close"
            onClick={onNext}
            className="text-muted-foreground hover:text-foreground -mt-1 -mr-1 rounded-full p-1 transition-colors"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      <div className="mt-1 mb-6 flex items-baseline gap-1.5">
        <h2 className="text-xl font-semibold">{question.question}</h2>
      </div>

      <QuestionRenderer question={question} value={value} onChange={onChange} />

      <div className="mt-8 flex justify-end gap-3">
        <Button variant="outline" onClick={onBack} disabled={stepIndex === 0}>
          Back
        </Button>
        <Button className="text-white" onClick={onNext} disabled={!canGoNext}>
          Next
        </Button>
      </div>
    </div>
  );
}

function CompleteView({
  submitting,
  onRetake,
  onSubmit,
}: {
  submitting: boolean;
  onRetake: () => void;
  onSubmit: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-10 text-center">
      <span className="bg-primary flex size-14 items-center justify-center rounded-full">
        <Check className="text-primary-foreground size-7" />
      </span>

      <div className="space-y-2">
        <h2 className="font-display text-2xl font-bold tracking-tight">You&apos;re All Set!</h2>
        <p className="text-muted-foreground mx-auto max-w-sm text-sm">
          Review your answers and submit your data. You can retake the questions to update your
          response.
        </p>
      </div>

      <div className="flex w-full max-w-xs gap-3">
        <Button variant="outline" className="flex-1" onClick={onRetake} disabled={submitting}>
          Retake
        </Button>
        <Button className="flex-1 text-white" onClick={onSubmit} disabled={submitting}>
          {submitting ? 'Submitting...' : 'Submit Data'}
        </Button>
      </div>
    </div>
  );
}

function RetakeConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Retake the questions?</AlertDialogTitle>
          <AlertDialogDescription>
            This will delete all the answers you&apos;ve given so far about you, and we&apos;ll
            start fresh from Question 1. This can&apos;t be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Yes, start over</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
