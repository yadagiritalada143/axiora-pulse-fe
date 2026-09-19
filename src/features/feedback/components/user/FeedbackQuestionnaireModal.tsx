import { Check, ChevronLeft, ChevronRight, Star, X } from 'lucide-react';
import { useMemo, useState } from 'react';

import type { FeedbackAnswerItem, FeedbackQuestion } from '@/types/feedback.types';
import { STAR_DESCRIPTIONS, countStars, isStarQuestion } from '@/types/feedback.types';
import { ButtonLoader } from '@components/common/Loader';
import { Button } from '@components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@components/ui/dialog';
import { Textarea } from '@components/ui/textarea';

import { useDisplayedFeedbackQuestions, useSubmitUserFeedback } from '../../hooks/useFeedback';

interface FeedbackQuestionnaireModalProps {
  workspaceId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

function SpeechBubblesIllustration() {
  return (
    <div className="relative mx-auto flex size-14 items-center justify-center">
      <svg className="absolute -top-1 h-3 w-8 text-orange-400" viewBox="0 0 32 12" fill="none">
        <path d="M6 9L3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M16 8V1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M26 9L29 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <svg className="size-12" viewBox="0 0 48 48" fill="none">
        <path
          d="M19 14C12.3726 14 7 18.9249 7 25C7 27.6745 8.0418 30.1256 9.80004 32.0415L8 37L13.882 35.3194C15.4294 35.7594 17.1706 36 19 36C25.6274 36 31 31.0751 31 25C31 18.9249 25.6274 14 19 14Z"
          className="fill-[#FFE8DE] dark:fill-orange-950/40"
        />
        <circle cx="13" cy="25" r="1.5" className="fill-[#FF8C66] dark:fill-orange-500" />
        <circle cx="18" cy="25" r="1.5" className="fill-[#FF8C66] dark:fill-orange-500" />
        <circle cx="23" cy="25" r="1.5" className="fill-[#FF8C66] dark:fill-orange-500" />

        <path
          d="M29 18C22.9249 18 18 22.4772 18 28C18 30.4314 18.9556 32.6596 20.5701 34.3977L19 39L24.3918 37.4722C25.8113 37.8105 27.3621 38 29 38C35.0751 38 40 33.5228 40 28C40 22.4772 35.0751 18 29 18Z"
          fill="#FF4500"
        />
        <circle cx="26.5" cy="26.5" r="1.5" fill="white" />
      </svg>
    </div>
  );
}

function SuccessCheckIllustration() {
  return (
    <div className="relative mx-auto flex size-20 items-center justify-center">
      <svg className="absolute inset-0 size-20 text-orange-500" viewBox="0 0 80 80" fill="none">
        <circle cx="18" cy="30" r="2.5" className="fill-[#FF8C66] dark:fill-orange-500" />
        <circle cx="64" cy="32" r="2.5" className="fill-[#FFB088] dark:fill-orange-400" />
        <circle cx="61" cy="54" r="3" className="fill-[#FF8C66] dark:fill-orange-500" />
        <circle cx="21" cy="56" r="2" className="fill-[#FFB088] dark:fill-orange-400" />
        <path d="M28 14L34 10" stroke="#FF8C66" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M52 10L58 14" stroke="#FF4500" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M16 48L22 47" stroke="#FF4500" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M60 22L64 25" stroke="#FF8C66" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <div className="flex size-14 items-center justify-center rounded-full border border-orange-200/60 bg-[#FFE8DE] dark:border-orange-900/40 dark:bg-orange-950/50">
        <Check className="size-7 text-[#FF4500]" strokeWidth={3.5} />
      </div>
    </div>
  );
}

interface EmojiOption {
  label: string;
  icon: (isSelected: boolean) => React.ReactNode;
}

const EMOJI_SENTIMENTS: EmojiOption[] = [
  {
    label: 'Not Like',
    icon: (selected) => (
      <svg
        className={`size-10 transition-transform ${
          selected
            ? 'scale-110 text-[#FF4500]'
            : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
        }`}
        viewBox="0 0 36 36"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle
          cx="18"
          cy="18"
          r="15"
          className={selected ? 'fill-orange-50 dark:fill-orange-950/30' : 'fill-none'}
        />
        <circle cx="13" cy="14" r="1.5" fill="currentColor" stroke="none" />
        <circle cx="23" cy="14" r="1.5" fill="currentColor" stroke="none" />
        <path d="M12 24C14 20 22 20 24 24" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: 'Poor',
    icon: (selected) => (
      <svg
        className={`size-10 transition-transform ${
          selected
            ? 'scale-110 text-[#FF4500]'
            : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
        }`}
        viewBox="0 0 36 36"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle
          cx="18"
          cy="18"
          r="15"
          className={selected ? 'fill-orange-50 dark:fill-orange-950/30' : 'fill-none'}
        />
        <circle cx="13" cy="14" r="1.5" fill="currentColor" stroke="none" />
        <circle cx="23" cy="14" r="1.5" fill="currentColor" stroke="none" />
        <path d="M13 23C15 21 21 21 23 23" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: 'Okay',
    icon: (selected) => (
      <svg
        className={`size-10 transition-transform ${
          selected
            ? 'scale-110 text-[#FF4500]'
            : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
        }`}
        viewBox="0 0 36 36"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle
          cx="18"
          cy="18"
          r="15"
          className={selected ? 'fill-orange-50 dark:fill-orange-950/30' : 'fill-none'}
        />
        <circle cx="13" cy="14" r="1.5" fill="currentColor" stroke="none" />
        <circle cx="23" cy="14" r="1.5" fill="currentColor" stroke="none" />
        <line x1="13" y1="22" x2="23" y2="22" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: 'Good',
    icon: (selected) => (
      <svg
        className={`size-10 transition-transform ${
          selected
            ? 'scale-110 text-[#FF4500]'
            : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
        }`}
        viewBox="0 0 36 36"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle
          cx="18"
          cy="18"
          r="15"
          className={selected ? 'fill-orange-50 dark:fill-orange-950/30' : 'fill-none'}
        />
        <circle cx="13" cy="14" r="1.5" fill="currentColor" stroke="none" />
        <circle cx="23" cy="14" r="1.5" fill="currentColor" stroke="none" />
        <path d="M13 21C15 24 21 24 23 21" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: 'Definitely',
    icon: (selected) => (
      <svg
        className={`size-10 transition-transform ${
          selected
            ? 'scale-110 text-[#FF4500]'
            : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
        }`}
        viewBox="0 0 36 36"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle
          cx="18"
          cy="18"
          r="15"
          className={selected ? 'fill-orange-50 dark:fill-orange-950/30' : 'fill-none'}
        />
        <circle cx="13" cy="14" r="1.5" fill="currentColor" stroke="none" />
        <circle cx="23" cy="14" r="1.5" fill="currentColor" stroke="none" />
        <path
          d="M12 20C12 25 24 25 24 20Z"
          fill={selected ? 'currentColor' : 'none'}
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

function getEmojiSentimentTitle(ans: string, index?: number, total?: number): string {
  if (!ans) return '';
  const trimmed = ans.trim();

  if (trimmed.includes('⭐')) {
    const stars = countStars(trimmed) || (index !== undefined ? index + 1 : 1);
    const desc = STAR_DESCRIPTIONS[stars];
    return desc ? `${stars} ${stars === 1 ? 'Star' : 'Stars'} — ${desc}` : `${stars} Stars`;
  }

  const isPureEmoji = /^\p{Extended_Pictographic}+$/u.test(trimmed);
  if (!isPureEmoji && trimmed.length > 2) {
    return trimmed;
  }

  if (
    ['😄', '😁', '😆', '😍', '🤩', '🥳', '🎉', '💯', '🔥', '❤️', '💖', '🌟', '✨'].includes(trimmed)
  ) {
    return 'Definitely';
  }
  if (['😃', '😀', '🙂', '😊', '👍', '👌', '🙌', '👏', '😎'].includes(trimmed)) {
    return 'Good';
  }
  if (['😐', '😑', '😶', '🤔', '🤷', '🤐', '😏', '😌'].includes(trimmed)) {
    return 'Okay';
  }
  if (['😕', '🙁', '😒', '👎', '😟', '🥺', '😥', '😓'].includes(trimmed)) {
    return 'Poor';
  }
  if (
    ['😞', '🤕', '😫', '😢', '😭', '😡', '😠', '😤', '💔', '😣', '😩', '🤢', '🤮', '💀'].includes(
      trimmed,
    )
  ) {
    return 'Not Like';
  }

  if (index !== undefined && total && total > 1) {
    const ratio = index / (total - 1);
    if (ratio >= 0.8) return 'Definitely';
    if (ratio >= 0.6) return 'Good';
    if (ratio >= 0.4) return 'Okay';
    if (ratio >= 0.2) return 'Poor';
    return 'Not Like';
  }

  return trimmed;
}

export function FeedbackQuestionnaireModal({
  workspaceId,
  open,
  onOpenChange,
  onSuccess,
}: FeedbackQuestionnaireModalProps) {
  const { data: questions, isLoading } = useDisplayedFeedbackQuestions(true);
  const submitMutation = useSubmitUserFeedback();

  const [currentStep, setCurrentStep] = useState(0);
  const [answersMap, setAnswersMap] = useState<Record<number, string[]>>({});
  const [starRatings, setStarRatings] = useState<Record<number, number>>({});
  const [hoverStarRating, setHoverStarRating] = useState<number | null>(null);
  const [optionalThoughts, setOptionalThoughts] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const activeQuestionsList = useMemo(() => questions ?? [], [questions]);
  const totalQuestions = activeQuestionsList.length;
  const currentQuestion: FeedbackQuestion | undefined = activeQuestionsList[currentStep];
  const isLastQuestion = currentStep === totalQuestions - 1;

  const isStarRating = useMemo(() => {
    if (!currentQuestion) return false;
    return (
      currentQuestion.answer_type === 'emoji' &&
      isStarQuestion(currentQuestion.question, currentQuestion.answers, currentQuestion.answer_type)
    );
  }, [currentQuestion]);

  const currentRating = useMemo(() => {
    if (!currentQuestion) return 0;
    const explicitRating = starRatings[currentQuestion.id];
    if (explicitRating != null && explicitRating > 0) {
      return explicitRating;
    }
    const savedAnswers = answersMap[currentQuestion.id] ?? [];
    const firstAns = savedAnswers[0];
    if (firstAns) {
      const starMatches = countStars(firstAns);
      if (starMatches > 0) {
        return Math.min(5, Math.max(1, starMatches));
      }
      const answersList = currentQuestion.answers ?? [];
      const idx = answersList.indexOf(firstAns);
      if (idx !== -1) {
        return idx + 1;
      }
      const num = parseInt(firstAns, 10);
      if (!isNaN(num) && num >= 1 && num <= 5) {
        return num;
      }
    }
    return 0;
  }, [currentQuestion, starRatings, answersMap]);

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setCurrentStep(0);
      setAnswersMap({});
      setStarRatings({});
      setHoverStarRating(null);
      setOptionalThoughts('');
      setValidationError(null);
      setIsSubmitted(false);
    }, 200);
  };

  const handleSelectRadio = (questionId: number, value: string) => {
    setAnswersMap((prev) => ({
      ...prev,
      [questionId]: [value],
    }));
    setValidationError(null);
  };

  const handleSelectStar = (questionId: number, starValue: number) => {
    setStarRatings((prev) => ({
      ...prev,
      [questionId]: starValue,
    }));
    const answersList = currentQuestion?.answers ?? [];
    let answerToSubmit = '⭐'.repeat(starValue);
    const candidateAnswer = answersList[starValue - 1];
    if (candidateAnswer) {
      if (candidateAnswer === '⭐' && starValue > 1) {
        answerToSubmit = '⭐'.repeat(starValue);
      } else {
        answerToSubmit = candidateAnswer;
      }
    }
    handleSelectRadio(questionId, answerToSubmit);
  };

  const handleToggleCheckbox = (questionId: number, value: string) => {
    setAnswersMap((prev) => {
      const current = prev[questionId] ?? [];
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return {
        ...prev,
        [questionId]: updated,
      };
    });
    setValidationError(null);
  };

  const handleTextareaChange = (questionId: number, value: string) => {
    setAnswersMap((prev) => ({
      ...prev,
      [questionId]: value.trim() ? [value] : [],
    }));
    setValidationError(null);
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      setValidationError(null);
    }
  };

  const emojiOptions = useMemo(() => {
    if (currentQuestion?.answer_type !== 'emoji') return [];
    const answers = currentQuestion.answers ?? [];
    return answers.map((ans, idx) => {
      const isEmojiChar = /\p{Extended_Pictographic}/u.test(ans);
      const dynamicTitle = getEmojiSentimentTitle(ans, idx, answers.length);
      const fallbackPreset = EMOJI_SENTIMENTS[idx] ?? EMOJI_SENTIMENTS[EMOJI_SENTIMENTS.length - 1];
      return {
        value: ans,
        isEmojiChar,
        displayLabel: dynamicTitle,
        icon: fallbackPreset?.icon,
      };
    });
  }, [currentQuestion]);

  const handleNextOrSubmit = () => {
    if (!currentQuestion) return;

    const currentAnswers = answersMap[currentQuestion.id] ?? [];

    if (!currentQuestion.optional && currentAnswers.length === 0) {
      setValidationError('Please provide an answer before continuing.');
      return;
    }

    setValidationError(null);

    if (!isLastQuestion) {
      setCurrentStep((prev) => prev + 1);
      return;
    }

    const payloadItems: FeedbackAnswerItem[] = [];

    for (const q of activeQuestionsList) {
      let answers = answersMap[q.id] ?? [];

      if (q.answer_type === 'emoji' && optionalThoughts.trim()) {
        answers = answers.slice(0, 1);
      }

      if (answers.length > 0) {
        payloadItems.push({
          questionnaire_id: q.id,
          user_answers: answers,
        });
      }
    }

    submitMutation.mutate(
      {
        workspace_id: workspaceId,
        answers: payloadItems,
      },
      {
        onSuccess: () => {
          setIsSubmitted(true);
          onSuccess?.();
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        showCloseButton={false}
        className="border-border/80 bg-card fixed top-1/2 left-1/2 max-h-[90vh] w-[95vw] max-w-[480px] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl p-6 shadow-2xl sm:rounded-3xl sm:p-7"
        aria-describedby="feedback-wizard-description"
      >
        <DialogDescription id="feedback-wizard-description" className="sr-only">
          Venture validation feedback questionnaire for downloading completion certificate.
        </DialogDescription>
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close feedback modal"
          className="text-muted-foreground hover:text-foreground hover:bg-muted/60 absolute top-4 right-4 z-10 rounded-full p-1.5 transition-colors"
        >
          <X className="size-4" />
        </button>

        {isSubmitted ? (
          <div className="animate-in fade-in zoom-in-95 flex flex-col items-center space-y-4 py-4 text-center duration-200">
            <SuccessCheckIllustration />

            <div className="space-y-2">
              <DialogTitle className="text-foreground text-xl font-bold tracking-tight sm:text-2xl">
                Thank you for your feedback!
              </DialogTitle>
              <p className="text-muted-foreground mx-auto max-w-sm text-xs leading-relaxed sm:text-sm">
                Your feedback has been submitted successfully. It helps us improve Axiora Pulse and
                build a better experience for founders like you.
              </p>
            </div>

            <div className="w-full pt-4">
              <Button
                type="button"
                onClick={handleClose}
                className="h-11 w-full rounded-xl bg-[#FF4500] text-sm font-semibold text-white shadow-md transition-colors hover:bg-[#FF4500]/90"
              >
                Got it
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col space-y-4">
            {totalQuestions > 0 && !isLoading && currentQuestion ? (
              <div className="text-muted-foreground flex items-center justify-between px-1 text-xs">
                <span className="font-semibold text-[#FF4500]">
                  Question {currentStep + 1} of {totalQuestions}
                </span>
                <div className="flex items-center gap-1.5">
                  {activeQuestionsList.map((q, idx) => (
                    <span
                      key={q.id}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        idx === currentStep
                          ? 'w-6 bg-[#FF4500]'
                          : idx < currentStep
                            ? 'w-2 bg-orange-400'
                            : 'bg-muted w-2'
                      }`}
                    />
                  ))}
                </div>
              </div>
            ) : null}

            <SpeechBubblesIllustration />

            {isLoading ? (
              <div className="text-muted-foreground py-12 text-center text-sm">
                <ButtonLoader className="mx-auto mb-2 text-[#FF4500]" />
                Loading feedback questionnaire...
              </div>
            ) : !currentQuestion ? (
              <div className="space-y-3 py-8 text-center">
                <p className="text-foreground text-sm font-semibold">
                  No feedback questions are currently required.
                </p>
                <Button
                  onClick={handleClose}
                  className="bg-[#FF4500] text-xs text-white hover:bg-[#FF4500]/90"
                >
                  Close
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-1.5 text-center">
                  <DialogTitle className="text-foreground px-2 text-lg leading-snug font-bold sm:text-xl">
                    {currentQuestion.question}
                  </DialogTitle>
                </div>

                <div className="flex min-h-[140px] flex-col justify-center py-1">
                  {isStarRating ? (
                    <div className="flex flex-col items-center justify-center gap-2 py-4">
                      <div
                        className="flex items-center justify-center gap-2 sm:gap-3"
                        onMouseLeave={() => setHoverStarRating(null)}
                      >
                        {[1, 2, 3, 4, 5].map((starValue) => {
                          const activeRating = hoverStarRating ?? currentRating;
                          const isFilled = starValue <= activeRating;

                          return (
                            <button
                              key={starValue}
                              type="button"
                              onClick={() => handleSelectStar(currentQuestion.id, starValue)}
                              onMouseEnter={() => setHoverStarRating(starValue)}
                              className="cursor-pointer rounded-xl p-1 transition-all duration-150 hover:scale-120 focus:outline-hidden sm:p-1.5"
                              aria-label={`Rate ${starValue} stars`}
                            >
                              <Star
                                className={`size-8 transition-all duration-150 sm:size-10 ${
                                  isFilled
                                    ? 'fill-[#FFB800] text-[#FFB800] drop-shadow-[0_2px_8px_rgba(255,184,0,0.4)]'
                                    : 'fill-slate-100 text-slate-400 hover:fill-amber-100/60 hover:text-amber-500 dark:fill-slate-800/40 dark:text-slate-600 dark:hover:fill-amber-950/30'
                                }`}
                              />
                            </button>
                          );
                        })}
                      </div>

                      <div className="flex min-h-[26px] items-center justify-center pt-1">
                        {(hoverStarRating ?? currentRating) > 0 ? (
                          <span className="animate-in fade-in text-xs font-semibold text-[#FF4500]">
                            {hoverStarRating ?? currentRating} Star
                            {(hoverStarRating ?? currentRating) !== 1 ? 's' : ''} —{' '}
                            {STAR_DESCRIPTIONS[hoverStarRating ?? currentRating] ??
                              `${hoverStarRating ?? currentRating} Stars`}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-xs">Tap a star to rate</span>
                        )}
                      </div>
                    </div>
                  ) : currentQuestion.answer_type === 'emoji' ? (
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-center justify-around gap-1 pt-1 sm:flex-nowrap">
                        {emojiOptions.map((opt) => {
                          const isSelected =
                            (answersMap[currentQuestion.id] ?? [])[0] === opt.value;

                          return (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => handleSelectRadio(currentQuestion.id, opt.value)}
                              className={`group flex cursor-pointer flex-col items-center gap-1.5 rounded-2xl p-1.5 transition-all focus:outline-hidden ${
                                isSelected
                                  ? 'scale-105 bg-orange-500/10 ring-2 ring-[#FF4500]'
                                  : 'hover:bg-muted/40 hover:scale-105'
                              }`}
                            >
                              <div
                                className={`flex size-11 items-center justify-center rounded-full transition-all sm:size-12 ${
                                  isSelected
                                    ? 'bg-orange-500/20 text-[#FF4500]'
                                    : 'bg-muted/40 text-foreground group-hover:bg-muted'
                                }`}
                              >
                                {opt.isEmojiChar ? (
                                  <span className="text-2xl leading-none select-none sm:text-3xl">
                                    {opt.value}
                                  </span>
                                ) : (
                                  (opt.icon?.(isSelected) ?? (
                                    <span className="text-xs font-semibold">{opt.value}</span>
                                  ))
                                )}
                              </div>
                              <span
                                className={`max-w-[72px] truncate text-center text-[11px] font-medium transition-colors ${
                                  isSelected
                                    ? 'font-bold text-[#FF4500]'
                                    : 'text-foreground/75 group-hover:text-foreground dark:text-muted-foreground dark:group-hover:text-foreground font-semibold'
                                }`}
                              >
                                {opt.displayLabel}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      <div className="flex min-h-[28px] items-center justify-center">
                        {(() => {
                          const selectedVal = (answersMap[currentQuestion.id] ?? [])[0];
                          if (!selectedVal) {
                            return (
                              <span className="text-muted-foreground text-xs">
                                Select an emoji to rate your experience
                              </span>
                            );
                          }
                          const title = getEmojiSentimentTitle(selectedVal);
                          return (
                            <div className="animate-in fade-in zoom-in-95 inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1 text-xs font-semibold text-[#FF4500]">
                              <span className="text-base leading-none">{selectedVal}</span>
                              <span>{title}</span>
                            </div>
                          );
                        })()}
                      </div>

                      <div className="relative pt-1">
                        <Textarea
                          placeholder="Share your thoughts (optional)"
                          value={optionalThoughts}
                          onChange={(e) => {
                            if (e.target.value.length <= 500) {
                              setOptionalThoughts(e.target.value);
                            }
                          }}
                          className="border-border bg-background placeholder:text-muted-foreground min-h-[85px] resize-none rounded-xl p-3 text-xs focus-visible:ring-1 focus-visible:ring-[#FF4500]"
                        />
                        <span className="text-muted-foreground pointer-events-none absolute right-3 bottom-2.5 text-[10px]">
                          {optionalThoughts.length}/500
                        </span>
                      </div>
                    </div>
                  ) : currentQuestion.answer_type === 'checkboxes' ? (
                    <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                      {currentQuestion.answers.map((option) => {
                        const isChecked = (answersMap[currentQuestion.id] ?? []).includes(option);

                        return (
                          <button
                            type="button"
                            key={option}
                            onClick={() => handleToggleCheckbox(currentQuestion.id, option)}
                            className={`flex w-full cursor-pointer items-center gap-3 rounded-xl border p-3 text-left transition-all select-none ${
                              isChecked
                                ? 'text-foreground border-[#FF4500] bg-orange-500/10 ring-1 ring-[#FF4500]/30'
                                : 'border-border bg-card hover:bg-muted/40 text-foreground'
                            }`}
                          >
                            <div
                              className={`flex size-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
                                isChecked
                                  ? 'border-[#FF4500] bg-[#FF4500] text-white'
                                  : 'bg-background border-slate-400/80 dark:border-slate-600'
                              }`}
                            >
                              {isChecked && <Check className="size-3.5 stroke-[3]" />}
                            </div>
                            <span className="text-foreground text-xs leading-snug font-medium sm:text-sm">
                              {option}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  ) : currentQuestion.answer_type === 'radiobuttons' ||
                    currentQuestion.answer_type === 'dropdown' ? (
                    <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                      {currentQuestion.answers.map((option) => {
                        const isSelected = (answersMap[currentQuestion.id] ?? [])[0] === option;

                        return (
                          <button
                            type="button"
                            key={option}
                            onClick={() => handleSelectRadio(currentQuestion.id, option)}
                            className={`flex w-full cursor-pointer items-center gap-3 rounded-xl border p-3 text-left transition-all select-none ${
                              isSelected
                                ? 'text-foreground border-[#FF4500] bg-orange-500/10 ring-1 ring-[#FF4500]/30'
                                : 'border-border bg-card hover:bg-muted/40 text-foreground'
                            }`}
                          >
                            <div
                              className={`flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors ${
                                isSelected
                                  ? 'border-[#FF4500] bg-transparent'
                                  : 'bg-background border-slate-400/80 dark:border-slate-600'
                              }`}
                            >
                              {isSelected && <div className="size-2.5 rounded-full bg-[#FF4500]" />}
                            </div>
                            <span className="text-foreground text-xs leading-snug font-medium sm:text-sm">
                              {option}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="relative">
                      <Textarea
                        placeholder="Write your feedback here..."
                        value={(answersMap[currentQuestion.id] ?? [])[0] ?? ''}
                        onChange={(e) => handleTextareaChange(currentQuestion.id, e.target.value)}
                        className="border-border bg-background placeholder:text-muted-foreground min-h-[120px] resize-none rounded-xl p-3.5 text-xs focus-visible:ring-1 focus-visible:ring-[#FF4500] sm:text-sm"
                      />
                    </div>
                  )}
                </div>
                {validationError && (
                  <p className="text-destructive animate-in fade-in text-center text-xs font-medium">
                    {validationError}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-3 pt-2">
                  {currentStep > 0 ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handlePrevious}
                      disabled={submitMutation.isPending}
                      className="border-border bg-background text-foreground hover:bg-muted h-11 gap-1.5 rounded-xl border text-xs font-semibold shadow-2xs transition-colors sm:text-sm"
                    >
                      <ChevronLeft className="size-4" />
                      Previous
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleClose}
                      disabled={submitMutation.isPending}
                      className="border-border bg-background text-foreground hover:bg-muted h-11 rounded-xl border text-xs font-semibold shadow-2xs transition-colors sm:text-sm"
                    >
                      Cancel
                    </Button>
                  )}

                  <Button
                    type="button"
                    onClick={handleNextOrSubmit}
                    disabled={submitMutation.isPending}
                    className="h-11 gap-1.5 rounded-xl bg-[#FF4500] text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#FF4500]/90 sm:text-sm"
                  >
                    {submitMutation.isPending ? <ButtonLoader className="mr-2" /> : null}
                    {isLastQuestion ? (
                      <>
                        Submit Feedback
                        <Check className="size-4" />
                      </>
                    ) : (
                      <>
                        Next
                        <ChevronRight className="size-4" />
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
