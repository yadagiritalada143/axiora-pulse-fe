import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Mail,
  Send,
  Sparkles,
} from 'lucide-react';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { Logo } from '@components/common/Logo';
import { ThemeToggle } from '@components/common/ThemeToggle';
import { Button } from '@components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card';
import { Checkbox } from '@components/ui/checkbox';
import { Input } from '@components/ui/input';
import { Label } from '@components/ui/label';
import { RadioGroup, RadioGroupItem } from '@components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ui/select';
import { Textarea } from '@components/ui/textarea';
import { usePublicSurvey, useSubmitPublicSurvey } from '@features/survey/hooks/useSurveys';
import { cn } from '@lib/utils';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const questionCardVariants = {
  enter: (direction: number) => ({
    opacity: 0,
    x: direction >= 0 ? 25 : -25,
  }),
  center: {
    opacity: 1,
    x: 0,
  },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction >= 0 ? -25 : 25,
  }),
};

export default function PublicSurveyPage() {
  const { surveyId } = useParams<{ surveyId: string }>();
  const token = surveyId ?? '';

  const { data: survey, isLoading, isError } = usePublicSurvey(token);
  const submitSurveyMutation = useSubmitPublicSurvey(token);

  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [answers, setAnswers] = useState<Record<number, string | string[]>>({});
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [stepError, setStepError] = useState<string | null>(null);

  const questions = survey?.questions ?? [];
  const totalQuestions = questions.length;

  const isFinalReviewStep = totalQuestions > 0 && currentStep === totalQuestions;
  const currentQuestion = !isFinalReviewStep && totalQuestions > 0 ? questions[currentStep] : null;

  const handleTextChange = (qId: number, value: string) => {
    setStepError(null);
    setAnswers((prev) => ({ ...prev, [qId]: value }));
  };

  const handleRadioChange = (qId: number, value: string) => {
    setStepError(null);
    setAnswers((prev) => ({ ...prev, [qId]: value }));
  };

  const handleCheckboxChange = (qId: number, option: string, checked: boolean) => {
    setStepError(null);
    setAnswers((prev) => {
      const currentList = (prev[qId] as string[]) || [];
      const updatedList = checked
        ? [...currentList, option]
        : currentList.filter((item) => item !== option);
      return { ...prev, [qId]: updatedList };
    });
  };

  const handleDropdownChange = (qId: number, value: string) => {
    setStepError(null);
    setAnswers((prev) => ({ ...prev, [qId]: value }));
  };

  const isQuestionOptional = (questionText: string) => {
    return /\(optional\)/i.test(questionText);
  };

  const getCleanQuestionText = (questionText: string) => {
    return questionText.replace(/\s*\(optional\)\s*/gi, '').trim();
  };

  const isQuestionAnswered = (qId: number, qType: string) => {
    const val = answers[qId];
    if (qType === 'checkbox') {
      return Array.isArray(val) && val.length > 0;
    }
    return typeof val === 'string' && val.trim().length > 0;
  };

  const isEmailValid = () => {
    const trimmed = email.trim();
    if (!trimmed) return true;
    return EMAIL_REGEX.test(trimmed);
  };

  const validateCurrentQuestion = (): boolean => {
    if (!currentQuestion) return true;
    const isOptional = isQuestionOptional(currentQuestion.question);
    const answered = isQuestionAnswered(currentQuestion.id, currentQuestion.questionType);

    if (!isOptional && !answered) {
      setStepError('Please provide an answer for this required question.');
      return false;
    }
    setStepError(null);
    return true;
  };

  const handleNext = () => {
    if (!validateCurrentQuestion()) {
      return;
    }

    if (currentStep < totalQuestions) {
      setDirection(1);
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep((prev) => prev - 1);
    }
  };

  const executeSubmit = () => {
    if (!survey || !survey.questions) return;

    if (!isEmailValid()) {
      toast.error('Please enter a valid email address.');
      setStepError('Please enter a valid email address.');
      return;
    }

    const unansweredMandatory = survey.questions.filter(
      (q) => !isQuestionOptional(q.question) && !isQuestionAnswered(q.id, q.questionType),
    );

    if (unansweredMandatory.length > 0) {
      toast.error(
        `Please answer all mandatory questions (${unansweredMandatory.length} remaining).`,
      );
      const firstUnansweredIndex = survey.questions.findIndex(
        (q) => !isQuestionOptional(q.question) && !isQuestionAnswered(q.id, q.questionType),
      );
      if (firstUnansweredIndex !== -1) {
        setDirection(-1);
        setCurrentStep(firstUnansweredIndex);
      }
      return;
    }

    const formattedAnswers = Object.entries(answers).map(([qId, val]) => ({
      questionId: Number(qId),
      answer: val,
    }));

    submitSurveyMutation.mutate(
      {
        respondentEmail: email.trim() || undefined,
        answers: formattedAnswers,
      },
      {
        onSuccess: () => {
          setIsSubmitted(true);
        },
      },
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateCurrentQuestion()) {
      return;
    }
    executeSubmit();
  };

  if (isLoading) {
    return (
      <div className="bg-muted flex min-h-screen items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-8 animate-spin text-[#FF4500]" />
          <p className="text-muted-foreground text-sm font-medium">Loading survey questions...</p>
        </div>
      </div>
    );
  }

  if (isError || !survey) {
    return (
      <div className="bg-muted flex min-h-screen items-center justify-center p-4">
        <Card className="border-destructive/20 w-full max-w-md text-center shadow-md">
          <CardHeader>
            <CardTitle className="text-destructive">Survey Not Found</CardTitle>
            <CardDescription className="pt-2 text-xs leading-relaxed">
              This survey link is invalid, expired, or doesn&apos;t exist. Please check the URL and
              try again.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="bg-muted flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-lg border-emerald-500/20 text-center shadow-lg">
          <CardHeader className="flex flex-col items-center pt-8">
            <div className="flex size-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 className="size-8" />
            </div>
            <CardTitle className="text-foreground mt-4 text-2xl font-bold">Thank You!</CardTitle>
            <CardDescription className="text-muted-foreground pt-1 text-sm">
              Your feedback has been successfully submitted.
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-8">
            <p className="text-muted-foreground/80 mx-auto max-w-md text-sm leading-relaxed">
              Your response has been securely recorded. The founders will analyze your responses to
              help build a product that directly solves your challenges.
            </p>
            <div className="border-border text-muted-foreground mt-8 flex items-center justify-center gap-1.5 border-t pt-4 text-xs">
              <Sparkles className="size-3.5 text-[#FF4500]" />
              Powered by <span className="text-foreground font-semibold">Axiora Pulse</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const answeredCount = questions.filter((q) => isQuestionAnswered(q.id, q.questionType)).length;

  return (
    <div className="bg-muted flex min-h-screen flex-col items-center justify-between px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      {/* Branding Header */}
      <header className="flex w-full max-w-2xl items-center justify-between">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <Logo size="lg" />
          <span className="text-muted-foreground/40 font-normal">|</span>
          <span className="text-muted-foreground xs:max-w-[220px] max-w-[140px] truncate text-sm font-bold sm:max-w-none sm:text-base">
            {survey.workspaceName || 'Customer Discovery'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />

          <div className="text-muted-foreground flex items-center gap-1 font-mono text-xs font-semibold">
            <span>{Math.min(currentStep + 1, totalQuestions)}</span>
            <span className="text-muted-foreground/40">/</span>
            <span>{totalQuestions}</span>
          </div>
        </div>
      </header>

      <main className="my-auto w-full max-w-2xl py-6">
        <Card className="border-border bg-card relative overflow-hidden shadow-lg">
          <form onSubmit={handleSubmit} noValidate>
            <CardContent className="flex min-h-[340px] flex-col justify-between p-6 sm:p-8">
              <div
                className="mb-6 flex items-center gap-1.5"
                role="progressbar"
                aria-valuenow={Math.min(currentStep + 1, totalQuestions)}
                aria-valuemin={1}
                aria-valuemax={totalQuestions}
              >
                {Array.from({ length: totalQuestions }).map((_, idx) => (
                  <span
                    key={idx}
                    className={cn(
                      'h-1 flex-1 rounded-full transition-colors duration-200',
                      idx <= currentStep ? 'bg-foreground' : 'bg-border',
                    )}
                  />
                ))}
              </div>

              <AnimatePresence mode="wait" custom={direction}>
                {!isFinalReviewStep && currentQuestion ? (
                  <motion.div
                    key={`step-${currentStep}-${currentQuestion.id}`}
                    custom={direction}
                    variants={questionCardVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                    className="flex flex-1 flex-col justify-between space-y-6"
                  >
                    <div>
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#FF4500]">
                          <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#FF4500]/10 text-[11px] font-bold">
                            {currentStep + 1}
                          </span>
                          Question {currentStep + 1} of {totalQuestions}
                        </span>

                        <span className="text-muted-foreground bg-muted rounded-md px-2.5 py-0.5 text-[11px] font-medium tracking-wider uppercase">
                          {currentQuestion.questionType === 'radio'
                            ? 'Single Choice'
                            : currentQuestion.questionType === 'checkbox'
                              ? 'Multiple Choice'
                              : currentQuestion.questionType === 'dropdown'
                                ? 'Dropdown'
                                : 'Short Answer'}
                        </span>
                      </div>

                      <h2 className="text-foreground text-lg leading-relaxed font-bold sm:text-xl">
                        {getCleanQuestionText(currentQuestion.question)}
                        {isQuestionOptional(currentQuestion.question) ? (
                          <span className="text-muted-foreground ml-2 text-xs font-normal">
                            (Optional)
                          </span>
                        ) : (
                          <span className="ml-1 font-bold text-[#FF4500]">*</span>
                        )}
                      </h2>
                    </div>

                    {(() => {
                      const currentAnswer = answers[currentQuestion.id];
                      const stringAnswer = typeof currentAnswer === 'string' ? currentAnswer : '';
                      const arrayAnswer = Array.isArray(currentAnswer) ? currentAnswer : [];

                      return (
                        <div className="py-2">
                          {currentQuestion.questionType === 'text' && (
                            <div className="space-y-2">
                              <Textarea
                                value={stringAnswer}
                                onChange={(e) =>
                                  handleTextChange(currentQuestion.id, e.target.value)
                                }
                                placeholder="Type your answer here..."
                                rows={4}
                                className={cn(
                                  'bg-background text-foreground rounded-xl p-3.5 text-sm font-normal focus-visible:ring-1',
                                  stepError && 'border-destructive focus-visible:ring-destructive',
                                )}
                              />
                            </div>
                          )}

                          {currentQuestion.questionType === 'radio' && (
                            <RadioGroup
                              value={stringAnswer}
                              onValueChange={(val) => handleRadioChange(currentQuestion.id, val)}
                              className="flex flex-col gap-2.5"
                            >
                              {currentQuestion.options.map((opt, optIdx) => {
                                const isSelected = stringAnswer === opt;
                                const keyLetter = String.fromCharCode(65 + optIdx);

                                return (
                                  <label
                                    key={optIdx}
                                    htmlFor={`q-${currentQuestion.id}-opt-${optIdx}`}
                                    className={cn(
                                      'flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 transition-all select-none',
                                      isSelected
                                        ? 'text-foreground border-[#FF4500] bg-[#FF4500]/5 shadow-xs'
                                        : 'border-border/80 bg-background hover:bg-muted/40 text-foreground',
                                    )}
                                  >
                                    <span
                                      className={cn(
                                        'flex size-6 shrink-0 items-center justify-center rounded-lg font-mono text-xs font-bold transition-colors',
                                        isSelected
                                          ? 'bg-[#FF4500] text-white'
                                          : 'bg-muted text-muted-foreground',
                                      )}
                                    >
                                      {keyLetter}
                                    </span>
                                    <RadioGroupItem
                                      value={opt}
                                      id={`q-${currentQuestion.id}-opt-${optIdx}`}
                                      className="sr-only"
                                    />
                                    <span className="flex-1 text-sm font-medium">{opt}</span>
                                  </label>
                                );
                              })}
                            </RadioGroup>
                          )}

                          {currentQuestion.questionType === 'checkbox' && (
                            <div className="flex flex-col gap-2.5">
                              {currentQuestion.options.map((opt, optIdx) => {
                                const isChecked = arrayAnswer.includes(opt);

                                return (
                                  <label
                                    key={optIdx}
                                    htmlFor={`q-${currentQuestion.id}-opt-${optIdx}`}
                                    className={cn(
                                      'flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 transition-all select-none',
                                      isChecked
                                        ? 'text-foreground border-[#FF4500] bg-[#FF4500]/5 shadow-xs'
                                        : 'border-border/80 bg-background hover:bg-muted/40 text-foreground',
                                    )}
                                  >
                                    <Checkbox
                                      id={`q-${currentQuestion.id}-opt-${optIdx}`}
                                      checked={isChecked}
                                      onCheckedChange={(checked) =>
                                        handleCheckboxChange(currentQuestion.id, opt, !!checked)
                                      }
                                      className="shrink-0"
                                    />
                                    <span className="flex-1 text-sm font-medium">{opt}</span>
                                  </label>
                                );
                              })}
                            </div>
                          )}

                          {currentQuestion.questionType === 'dropdown' && (
                            <div className="space-y-2">
                              <Select
                                value={stringAnswer}
                                onValueChange={(val) =>
                                  handleDropdownChange(currentQuestion.id, val)
                                }
                              >
                                <SelectTrigger
                                  className={cn(
                                    'bg-background h-11 w-full rounded-xl text-sm',
                                    stepError &&
                                      'border-destructive focus-visible:ring-destructive',
                                  )}
                                >
                                  <SelectValue placeholder="Select an option" />
                                </SelectTrigger>
                                <SelectContent>
                                  {currentQuestion.options.map((opt, optIdx) => (
                                    <SelectItem key={optIdx} value={opt}>
                                      {opt}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}

                          {stepError && (
                            <motion.p
                              initial={{ opacity: 0, y: -4 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-destructive mt-3 flex items-center gap-1.5 text-xs font-semibold"
                            >
                              <AlertCircle className="size-4 shrink-0" />
                              {stepError}
                            </motion.p>
                          )}
                        </div>
                      );
                    })()}
                  </motion.div>
                ) : (
                  <motion.div
                    key="step-final-email"
                    custom={direction}
                    variants={questionCardVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                    className="flex flex-1 flex-col justify-between space-y-6"
                  >
                    <div>
                      <div className="mb-3 flex items-center gap-2">
                        <div className="flex size-7 items-center justify-center rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400">
                          <Mail className="size-4" />
                        </div>
                        <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                          Final Step
                        </span>
                      </div>

                      <h2 className="text-foreground text-xl leading-tight font-bold">
                        Almost done! Leave your email to stay in touch
                      </h2>
                      <p className="text-muted-foreground mt-1.5 text-xs">
                        You answered {answeredCount} of {totalQuestions} questions. Enter your email
                        if you&apos;d like to receive updates on product progress.
                      </p>
                    </div>

                    <div className="space-y-3 py-2">
                      <Label htmlFor="respondent-email" className="text-sm font-semibold">
                        Your Email Address{' '}
                        <span className="text-muted-foreground text-xs font-normal">
                          (Optional)
                        </span>
                      </Label>
                      <Input
                        id="respondent-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. customer@example.com"
                        className={cn(
                          'bg-background h-11 rounded-xl text-sm',
                          !isEmailValid() && 'border-destructive focus-visible:ring-destructive',
                        )}
                      />
                      {!isEmailValid() && (
                        <p className="text-destructive flex items-center gap-1 text-xs font-medium">
                          <AlertCircle className="size-3.5" /> Please enter a valid email address.
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="border-border mt-6 flex items-center justify-between gap-3 border-t pt-5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleBack}
                  disabled={currentStep === 0}
                  className="h-9 cursor-pointer gap-1.5 px-3 text-xs font-semibold"
                >
                  <ArrowLeft className="size-3.5" />
                  Back
                </Button>

                <div className="flex items-center gap-2">
                  {!isFinalReviewStep && currentStep < totalQuestions - 1 ? (
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleNext}
                      className="h-9 cursor-pointer gap-1.5 bg-[#FF4500] px-4 text-xs font-semibold text-white hover:bg-[#FF4500]/90"
                    >
                      Next
                      <ArrowRight className="size-3.5" />
                    </Button>
                  ) : !isFinalReviewStep ? (
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleNext}
                      className="h-9 cursor-pointer gap-1.5 bg-[#FF4500] px-4 text-xs font-semibold text-white hover:bg-[#FF4500]/90"
                    >
                      Continue
                      <ArrowRight className="size-3.5" />
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={submitSurveyMutation.isPending}
                      className="h-9 cursor-pointer gap-1.5 bg-[#FF4500] px-5 text-xs font-semibold text-white hover:bg-[#FF4500]/90"
                    >
                      {submitSurveyMutation.isPending ? (
                        <>
                          <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          Submit Response
                          <Send className="size-3.5" />
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </form>
        </Card>
      </main>

      <footer className="w-full max-w-2xl py-2 text-center">
        <div className="text-muted-foreground inline-flex items-center gap-1.5 text-xs">
          <Sparkles className="size-3 text-[#FF4500]" />
          Powered by <span className="text-foreground font-semibold">Axiora Pulse</span>
        </div>
      </footer>
    </div>
  );
}
