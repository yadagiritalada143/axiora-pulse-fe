import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles, Target } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import type { SurveyIntelligenceQuestion } from '@/types/orchestration.types';
import { Button } from '@components/ui/button';
import { cn } from '@lib/utils';

const SHEET_DEPTHS = [
  { y: 6, rotate: -2, scale: 0.98, opacity: 0.8 },
  { y: 12, rotate: 2.5, scale: 0.95, opacity: 0.5 },
];

const questionCardVariants = {
  enter: (direction: number) => ({ opacity: 0, x: direction >= 0 ? 16 : -16 }),
  center: { opacity: 1, x: 0 },
  exit: (direction: number) => ({ opacity: 0, x: direction >= 0 ? -16 : 16 }),
};

interface InteractiveSurveyQuestionsProps {
  questions: SurveyIntelligenceQuestion[];
  workspaceId: number | string;
  className?: string;
}

export function InteractiveSurveyQuestions({
  questions,
  workspaceId,
  className,
}: InteractiveSurveyQuestionsProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  if (!questions || questions.length === 0) {
    return (
      <div className="border-border text-muted-foreground rounded-lg border border-dashed p-6 text-center text-xs">
        No survey questions generated yet.
      </div>
    );
  }

  const total = questions.length;
  const currentQuestion = questions[Math.min(stepIndex, total - 1)] ?? questions[0];
  if (!currentQuestion) return null;
  const upcomingQuestions = questions.slice(stepIndex + 1, stepIndex + 1 + SHEET_DEPTHS.length);

  const handleNext = () => {
    if (stepIndex < total - 1) {
      setDirection(1);
      setStepIndex((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (stepIndex > 0) {
      setDirection(-1);
      setStepIndex((prev) => prev - 1);
    }
  };

  return (
    <div className={cn('relative my-3 w-full', className)}>
      <div className="relative mx-auto w-full max-w-2xl">
        {/* Layered paper deck behind the active question card */}
        <AnimatePresence initial={false}>
          {upcomingQuestions.map((q, depth) => {
            const sheet = SHEET_DEPTHS[depth];
            return (
              <motion.div
                key={`sheet-${stepIndex + 1 + depth}-${q.question_text.slice(0, 15)}`}
                aria-hidden
                className="bg-card border-border absolute inset-0 rounded-xl border shadow-xs"
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
            key={`question-${stepIndex}`}
            custom={direction}
            variants={questionCardVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.18, ease: 'easeOut' }}
            style={{ zIndex: 20 }}
            className="bg-card border-border relative flex flex-col overflow-hidden rounded-xl border p-6 shadow-sm sm:p-8"
          >
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
                    'h-1 flex-1 rounded-full transition-colors duration-200',
                    idx <= stepIndex ? 'bg-foreground' : 'bg-border',
                  )}
                />
              ))}
            </div>

            <div className="flex items-center justify-between">
              <p className="text-muted-foreground text-xs font-medium">
                Question {stepIndex + 1} of {total} &nbsp;
                <span className="text-muted-foreground/70 font-mono text-[11px]">
                  ({currentQuestion.question_type})
                </span>
              </p>

              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#FF4500]">
                <Sparkles className="size-3" />
                AI Generated
              </span>
            </div>

            <div className="mt-2 mb-6 flex items-baseline gap-1.5">
              <h2 className="text-foreground text-lg leading-relaxed font-semibold sm:text-xl">
                {currentQuestion.question_text}
              </h2>
            </div>

            {currentQuestion.target_hypothesis && (
              <div className="mb-2 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3.5 text-xs">
                <div className="mb-1 flex items-center gap-1.5 font-semibold text-amber-700 dark:text-amber-400">
                  <Target className="size-3.5" />
                  <span>Validation Hypothesis</span>
                </div>
                <p className="text-muted-foreground text-[12px] leading-relaxed">
                  {currentQuestion.target_hypothesis}
                </p>
              </div>
            )}

            <div className="mt-6 flex items-center justify-between gap-3 pt-2">
              <span className="text-muted-foreground font-mono text-xs">
                {stepIndex + 1} / {total}
              </span>

              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleBack}
                  disabled={stepIndex === 0}
                >
                  Back
                </Button>

                {stepIndex < total - 1 ? (
                  <Button
                    type="button"
                    size="sm"
                    className="bg-[#FF4500] font-semibold text-white hover:bg-[#FF4500]/90"
                    onClick={handleNext}
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    asChild
                    size="sm"
                    className="bg-[#FF4500] font-semibold text-white hover:bg-[#FF4500]/90"
                  >
                    <Link to={`/workspace/${workspaceId}/survey`}>Go to Survey</Link>
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
