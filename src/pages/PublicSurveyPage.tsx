import { CheckCircle2, ClipboardList, Loader2, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useParams } from 'react-router-dom';

import { Logo } from '@components/common/Logo';
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

export default function PublicSurveyPage() {
  const { surveyId } = useParams<{ surveyId: string }>();
  const numericSurveyId = Number(surveyId);

  const { data: survey, isLoading, isError } = usePublicSurvey(numericSurveyId);
  const submitSurveyMutation = useSubmitPublicSurvey(numericSurveyId);

  const [answers, setAnswers] = useState<Record<number, string | string[]>>({});
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleTextChange = (qId: number, value: string) => {
    setAnswers((prev) => ({ ...prev, [qId]: value }));
  };

  const handleRadioChange = (qId: number, value: string) => {
    setAnswers((prev) => ({ ...prev, [qId]: value }));
  };

  const handleCheckboxChange = (qId: number, option: string, checked: boolean) => {
    setAnswers((prev) => {
      const currentList = (prev[qId] as string[]) || [];
      const updatedList = checked
        ? [...currentList, option]
        : currentList.filter((item) => item !== option);
      return { ...prev, [qId]: updatedList };
    });
  };

  const handleDropdownChange = (qId: number, value: string) => {
    setAnswers((prev) => ({ ...prev, [qId]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

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
        <Card className="border-destructive/20 w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="text-destructive">Survey Not Found</CardTitle>
            <CardDescription className="pt-2">
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
              Your response has been securely recorded. The startup founders will analyze your
              responses to help build a better product fitting your requirements.
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

  return (
    <div className="bg-muted flex min-h-screen flex-col items-center px-4 py-10 sm:px-6 lg:px-8">
      {/* Branding Header */}
      <div className="mb-8 flex items-center gap-3 text-lg font-semibold tracking-wide">
        <Logo size="lg" />
        <span className="text-muted-foreground/50 font-normal">|</span>
        <span className="text-muted-foreground text-sm font-medium">Customer Discovery</span>
      </div>

      <Card className="border-border w-full max-w-2xl border shadow-md">
        <CardHeader className="bg-card border-b p-4 sm:p-8">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-[#FF4500]/10 text-[#FF4500]">
              <ClipboardList className="size-5" />
            </div>
            <div>
              <CardTitle className="text-foreground text-xl font-bold sm:text-2xl">
                {survey.workspaceName}
              </CardTitle>
              <CardDescription className="text-muted-foreground mt-1.5 text-xs font-semibold tracking-wider uppercase">
                Market Research Survey
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-8" noValidate>
            {/* Questions List */}
            <div className="space-y-8">
              {survey.questions.map((q, idx) => {
                const currentAnswer = answers[q.id];
                const isCheckedList = Array.isArray(currentAnswer) ? currentAnswer : [];

                return (
                  <div key={q.id} className="space-y-3">
                    <Label className="text-foreground flex items-start gap-1.5 text-base font-semibold">
                      <span className="text-[#FF4500] select-none">{idx + 1}.</span>
                      {q.question}
                    </Label>

                    {/* RENDER ACCORDING TO TYPE */}
                    {q.questionType === 'text' ? (
                      <Textarea
                        value={typeof currentAnswer === 'string' ? currentAnswer : ''}
                        onChange={(e) => handleTextChange(q.id, e.target.value)}
                        placeholder="Type your answer here..."
                        rows={3}
                        className="bg-background"
                      />
                    ) : q.questionType === 'radio' ? (
                      <RadioGroup
                        value={typeof currentAnswer === 'string' ? currentAnswer : ''}
                        onValueChange={(val) => handleRadioChange(q.id, val)}
                        className="flex flex-col gap-2 pt-1"
                      >
                        {q.options.map((opt, optIdx) => (
                          <div key={optIdx} className="flex items-start gap-2.5 py-1">
                            <RadioGroupItem
                              value={opt}
                              id={`q-${q.id}-opt-${optIdx}`}
                              className="mt-1 shrink-0"
                            />
                            <Label
                              htmlFor={`q-${q.id}-opt-${optIdx}`}
                              className="text-foreground cursor-pointer text-sm leading-relaxed font-normal select-none"
                            >
                              {opt}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    ) : q.questionType === 'checkbox' ? (
                      <div className="flex flex-col gap-2.5 pt-1">
                        {q.options.map((opt, optIdx) => (
                          <div key={optIdx} className="flex items-start gap-2.5 py-1">
                            <Checkbox
                              id={`q-${q.id}-opt-${optIdx}`}
                              checked={isCheckedList.includes(opt)}
                              onCheckedChange={(checked) =>
                                handleCheckboxChange(q.id, opt, !!checked)
                              }
                              className="mt-1 shrink-0"
                            />
                            <Label
                              htmlFor={`q-${q.id}-opt-${optIdx}`}
                              className="text-foreground cursor-pointer text-sm leading-relaxed font-normal select-none"
                            >
                              {opt}
                            </Label>
                          </div>
                        ))}
                      </div>
                    ) : q.questionType === 'dropdown' ? (
                      <Select
                        value={typeof currentAnswer === 'string' ? currentAnswer : ''}
                        onValueChange={(val) => handleDropdownChange(q.id, val)}
                      >
                        <SelectTrigger className="bg-background w-full">
                          <SelectValue placeholder="Select an option" />
                        </SelectTrigger>
                        <SelectContent>
                          {q.options.map((opt, optIdx) => (
                            <SelectItem key={optIdx} value={opt}>
                              {opt}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : null}
                  </div>
                );
              })}
            </div>

            {/* Email Input (Optional) */}
            <div className="border-border space-y-2 border-t pt-8">
              <Label htmlFor="respondent-email" className="text-sm font-semibold">
                Your Email Address{' '}
                <span className="text-muted-foreground font-normal">(Optional)</span>
              </Label>
              <Input
                id="respondent-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. customer@example.com"
                className="bg-background max-w-md"
              />
              <p className="text-muted-foreground/75 text-xs leading-normal">
                Leave your email if you would like the founding team to keep you updated about the
                product launch and milestones.
              </p>
            </div>

            {submitSurveyMutation.error ? (
              <p className="text-destructive text-sm font-medium">
                {submitSurveyMutation.error.message ||
                  'Failed to submit response. Please check inputs.'}
              </p>
            ) : null}

            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                disabled={submitSurveyMutation.isPending}
                className="h-11 w-full bg-[#FF4500] px-6 py-2.5 font-semibold text-white hover:bg-[#FF4500]/90 sm:w-auto"
              >
                {submitSurveyMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" /> Submitting...
                  </>
                ) : (
                  'Submit Response'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
