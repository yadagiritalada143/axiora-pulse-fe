import axios from 'axios';
import {
  AlertCircle,
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Bot,
  ClipboardList,
  Copy,
  Link as LinkIcon,
  Loader2,
  Paperclip,
  Plus,
  Share2,
  Trash2,
} from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { Button } from '@components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@components/ui/dialog';
import { Input } from '@components/ui/input';
import { Label } from '@components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs';
import {
  ROUTES,
  buildWorkspaceAttachmentsRoute,
  buildWorkspaceRoute,
  buildWorkspaceSurveyRoute,
} from '@constants/routes';
import { MentorShell, type MentorNavItem } from '@features/ideaValidation/components';
import {
  useSurveyByWorkspace,
  useSurveyResponses,
  useUpdateWorkspaceSurveyQuestions,
} from '@features/survey/hooks/useSurveys';
import type { SingleSurveyResponseItem, WorkspaceSurveyQuestionItem } from '@features/survey/types';
import { useWorkspaceState } from '@features/workspace/hooks/useWorkspaceMentor';
import { useWorkspace } from '@features/workspace/hooks/useWorkspaces';
import { cn } from '@lib/utils';

interface FormQuestion {
  question_text: string;
  question_type: 'text' | 'radio' | 'checkbox' | 'dropdown';
  optional: boolean;
  options: string[];
}

export default function WorkspaceSurveyPage() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const numericWorkspaceId = Number(workspaceId);

  const {
    data: workspace,
    isLoading: isWorkspaceLoading,
    isError: isWorkspaceError,
  } = useWorkspace(numericWorkspaceId);
  const { data: workspaceState } = useWorkspaceState(numericWorkspaceId);
  const {
    data: survey,
    isLoading: isSurveyLoading,
    isError: isSurveyError,
    error: surveyFetchError,
  } = useSurveyByWorkspace(numericWorkspaceId);
  const updateSurveyMutation = useUpdateWorkspaceSurveyQuestions(numericWorkspaceId);
  const { data: responsesData, isLoading: isResponsesLoading } = useSurveyResponses(
    survey?.id ?? 0,
  );

  const [questions, setQuestions] = useState<FormQuestion[]>([]);
  const [activeTab, setActiveTab] = useState('editor');
  const [selectedResponse, setSelectedResponse] = useState<SingleSurveyResponseItem | null>(null);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [hasAttemptedSave, setHasAttemptedSave] = useState(false);

  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    if (survey && !hasInitialized) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHasInitialized(true);

      if (survey.questions && survey.questions.length > 0) {
        const mapped: FormQuestion[] = survey.questions.map((q) => {
          const isOpt =
            Boolean((q as { optional?: boolean }).optional) || /\(optional\)/i.test(q.question);
          const cleanText = q.question.replace(/\s*\(optional\)\s*/gi, '').trim();

          return {
            question_text: cleanText,
            question_type: q.questionType,
            optional: isOpt,
            options: q.options || [],
          };
        });
        setQuestions(mapped);
      } else {
        setQuestions([]);
      }
    }
  }, [survey, workspaceState, hasInitialized]);

  const navItems: MentorNavItem[] = [
    {
      label: 'AI Mentor',
      icon: Bot,
      href: workspaceId ? buildWorkspaceRoute(workspaceId) : ROUTES.DASHBOARD,
      end: true,
    },
    {
      label: 'Survey Intelligence',
      icon: ClipboardList,
      href: workspaceId ? buildWorkspaceSurveyRoute(workspaceId) : '#',
    },
    {
      label: 'Attachments',
      icon: Paperclip,
      href: workspaceId ? buildWorkspaceAttachmentsRoute(workspaceId) : '#',
    },
  ];

  const validationErrors = useMemo(() => {
    const errors: Record<
      number,
      {
        questionTextError?: string;
        optionsErrors: Record<number, string>;
        generalOptionsError?: string;
        hasError: boolean;
      }
    > = {};

    const trimmedQuestions = questions.map((q) => q.question_text.trim().toLowerCase());

    questions.forEach((q, qIdx) => {
      const trimmedText = q.question_text.trim();
      let questionTextError: string | undefined;

      if (!trimmedText) {
        questionTextError = 'Question text cannot be empty.';
      } else {
        const duplicateCount = trimmedQuestions.filter(
          (t, idx) => t === trimmedText.toLowerCase() && idx !== qIdx,
        ).length;
        if (duplicateCount > 0) {
          questionTextError = 'Duplicate question: A question with this text already exists.';
        }
      }

      const optionsErrors: Record<number, string> = {};
      let generalOptionsError: string | undefined;

      if (['radio', 'checkbox', 'dropdown'].includes(q.question_type)) {
        if (q.options.length < 2) {
          generalOptionsError = 'Choice-based questions must have at least 2 options.';
        }

        const trimmedOptions = q.options.map((opt) => opt.trim().toLowerCase());

        q.options.forEach((opt, optIdx) => {
          const trimmedOpt = opt.trim();
          if (!trimmedOpt) {
            optionsErrors[optIdx] = 'Option cannot be empty.';
          } else {
            const isDup =
              trimmedOptions.filter((o, idx) => o === trimmedOpt.toLowerCase() && idx !== optIdx)
                .length > 0;
            if (isDup) {
              optionsErrors[optIdx] = `Duplicate option "${trimmedOpt}" already exists.`;
            }
          }
        });
      }

      const hasError =
        Boolean(questionTextError) ||
        Boolean(generalOptionsError) ||
        Object.keys(optionsErrors).length > 0;

      errors[qIdx] = {
        questionTextError,
        optionsErrors,
        generalOptionsError,
        hasError,
      };
    });

    return errors;
  }, [questions]);

  const totalErrorsCount = useMemo(() => {
    return Object.values(validationErrors).filter((e) => e.hasError).length;
  }, [validationErrors]);

  const handleCopyLink = () => {
    if (!survey?.public_token) return;
    const publicUrl = `${window.location.origin}/surveys/public/${survey.public_token}`;
    void navigator.clipboard.writeText(publicUrl);
    toast.success('Survey link copied to clipboard!');
  };

  const getShareUrl = () => {
    if (!survey?.public_token) return '';
    return `${window.location.origin}/surveys/public/${survey.public_token}`;
  };

  const socialPlatforms = [
    {
      name: 'Facebook',
      color: '#1877F2',
      buildUrl: (url: string) =>
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="size-[18px]">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
    {
      name: 'X',
      color: '#000000',
      buildUrl: (url: string) => `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}`,
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="size-[18px]">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      name: 'WhatsApp',
      color: '#25D366',
      buildUrl: (url: string) =>
        `https://wa.me/?text=${encodeURIComponent(`Check out this survey: ${url}`)}`,
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="size-[18px]">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      ),
    },
    {
      name: 'Telegram',
      color: '#0088CC',
      buildUrl: (url: string) =>
        `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent('Check out this survey')}`,
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="size-[18px]">
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
        </svg>
      ),
    },
    {
      name: 'LinkedIn',
      color: '#0A66C2',
      buildUrl: (url: string) =>
        `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="size-[18px]">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      ),
    },
  ];

  const handleAddQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        question_text: '',
        question_type: 'text',
        optional: false,
        options: ['Option 1', 'Option 2'],
      },
    ]);
    toast.success('Question added!');

    setTimeout(() => {
      const questionCards = document.querySelectorAll('[data-question-card]');
      if (questionCards.length > 0) {
        const lastCard = questionCards[questionCards.length - 1];
        lastCard?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const input = lastCard?.querySelector('input') as HTMLInputElement | null;
        input?.focus();
      }
    }, 100);
  };

  const handleRemoveQuestion = (index: number) => {
    setQuestions((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleQuestionChange = (index: number, fields: Partial<FormQuestion>) => {
    setQuestions((prev) => prev.map((q, idx) => (idx === index ? { ...q, ...fields } : q)));
  };

  const handleAddOption = (qIndex: number) => {
    setQuestions((prev) =>
      prev.map((q, idx) => {
        if (idx !== qIndex) return q;

        let counter = q.options.length + 1;
        let newOptName = `Option ${counter}`;
        const existingLower = new Set(q.options.map((o) => o.trim().toLowerCase()));
        while (existingLower.has(newOptName.toLowerCase())) {
          counter++;
          newOptName = `Option ${counter}`;
        }

        return { ...q, options: [...q.options, newOptName] };
      }),
    );
  };

  const handleRemoveOption = (qIndex: number, optIndex: number) => {
    setQuestions((prev) =>
      prev.map((q, idx) =>
        idx === qIndex ? { ...q, options: q.options.filter((_, oIdx) => oIdx !== optIndex) } : q,
      ),
    );
  };

  const handleOptionChange = (qIndex: number, optIndex: number, value: string) => {
    setQuestions((prev) =>
      prev.map((q, idx) =>
        idx === qIndex
          ? {
              ...q,
              options: q.options.map((opt, oIdx) => (oIdx === optIndex ? value : opt)),
            }
          : q,
      ),
    );
  };

  const moveQuestion = (index: number, direction: 'up' | 'down') => {
    const nextIdx = direction === 'up' ? index - 1 : index + 1;
    if (nextIdx < 0 || nextIdx >= questions.length) return;

    setQuestions((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      const nextItem = copy[nextIdx];
      if (temp !== undefined && nextItem !== undefined) {
        copy[index] = nextItem;
        copy[nextIdx] = temp;
      }
      return copy;
    });
  };

  const handleSave = () => {
    setHasAttemptedSave(true);

    if (questions.length === 0) {
      toast.error('Please add at least one question before saving.');
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      const qErr = validationErrors[i];
      if (qErr?.hasError) {
        if (qErr.questionTextError) {
          toast.error(`Question ${i + 1}: ${qErr.questionTextError}`);
        } else if (qErr.generalOptionsError) {
          toast.error(`Question ${i + 1}: ${qErr.generalOptionsError}`);
        } else {
          const firstOptErr = Object.values(qErr.optionsErrors)[0];
          toast.error(`Question ${i + 1}: ${firstOptErr ?? 'Please resolve option errors.'}`);
        }

        // Scroll to the first invalid question card
        const questionCards = document.querySelectorAll('[data-question-card]');
        const card = questionCards[i];
        card?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
    }

    const payloadQuestions: WorkspaceSurveyQuestionItem[] = questions.map((q) => {
      const cleanText = q.question_text.replace(/\s*\(optional\)\s*/gi, '').trim();
      const finalText = q.optional ? `${cleanText} (Optional)` : cleanText;

      return {
        question_text: finalText,
        question_type: q.question_type,
        options: ['radio', 'checkbox', 'dropdown'].includes(q.question_type)
          ? q.options.map((opt) => opt.trim())
          : null,
      };
    });

    updateSurveyMutation.mutate(
      {
        questions: payloadQuestions,
      },
      {
        onSuccess: () => {
          setHasAttemptedSave(false);
          toast.success('Survey updated and published successfully!');
        },
        onError: () => {
          toast.error('Failed to update survey questions. Please try again.');
        },
      },
    );
  };

  const isSurvey404 =
    (surveyFetchError as { status?: number })?.status === 404 ||
    (axios.isAxiosError(surveyFetchError) && surveyFetchError.response?.status === 404);

  const renderContent = () => {
    if (isWorkspaceLoading || isSurveyLoading) {
      return (
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="text-muted-foreground size-8 animate-spin" aria-hidden />
        </div>
      );
    }

    if (isWorkspaceError || !workspace) {
      return (
        <div className="mx-auto flex max-w-md flex-col items-center gap-3 py-16 text-center">
          <h1 className="text-foreground text-lg font-semibold">Workspace not found</h1>
          <p className="text-muted-foreground text-sm">
            This workspace doesn&apos;t exist or you don&apos;t have access to it.
          </p>
          <Link to={ROUTES.DASHBOARD} className="text-primary text-sm font-medium hover:underline">
            Back to workspaces
          </Link>
        </div>
      );
    }

    if (isSurveyError && isSurvey404) {
      return (
        <div className="mx-auto flex max-w-lg flex-col items-center gap-4 py-16 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-[#FF4500]/10 text-[#FF4500]">
            <ClipboardList className="size-7" />
          </div>
          <h1 className="text-foreground text-lg font-semibold">No survey generated yet</h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            The Survey Intelligence Agent generates market validation questions after you initiate
            the full validation run. Go to the **AI Mentor** chat and click **Run the Validations**
            to run the agent pipeline.
          </p>
          <Link to={buildWorkspaceRoute(workspace.id)}>
            <Button className="bg-[#FF4500] font-semibold text-white shadow-xs transition-all duration-150 hover:bg-[#FF4500]/90">
              Go to AI Mentor
            </Button>
          </Link>
        </div>
      );
    }

    if (isSurveyError || !survey) {
      return (
        <div className="mx-auto flex max-w-md flex-col items-center gap-3 py-16 text-center">
          <h1 className="text-foreground text-lg font-semibold">Failed to load survey</h1>
          <p className="text-muted-foreground text-sm">
            An error occurred while loading this survey. Please refresh or try again.
          </p>
        </div>
      );
    }

    return (
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        {survey.public_token ? (
          <Card className="border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-950/10">
            <CardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1">
                <h3 className="text-foreground text-sm font-semibold">Your survey is live!</h3>
                <p className="text-muted-foreground text-xs leading-normal">
                  Share this public URL with target customers, ICP audiences, or respondents to
                  gather feedback.
                </p>
              </div>
              <div className="flex max-w-full items-center gap-2 overflow-hidden">
                <div className="bg-background border-border text-foreground flex max-w-full items-center gap-2 truncate rounded-lg border px-3 py-1.5 font-mono text-xs break-all select-all">
                  {window.location.origin}/surveys/public/{survey.public_token}
                </div>
                <Button
                  size="icon"
                  variant="outline"
                  className="shrink-0 border-[#FF4500]/20 text-[#FF4500] transition-all duration-150 hover:border-[#FF4500] hover:bg-[#FF4500]/5 hover:text-[#FF4500]"
                  onClick={handleCopyLink}
                  title="Copy link"
                >
                  <Copy className="size-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : null}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-[345px] grid-cols-2">
            <TabsTrigger value="editor">Questions Editor</TabsTrigger>
            <TabsTrigger value="responses">
              Responses ({responsesData?.total_responses ?? 0})
            </TabsTrigger>
          </TabsList>

          {/* EDITOR TAB */}
          <TabsContent value="editor" className="mt-4 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <h3 className="text-foreground text-base font-semibold">
                    Questions ({questions.length})
                  </h3>
                  {totalErrorsCount > 0 && hasAttemptedSave && (
                    <span className="bg-destructive/10 text-destructive flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium">
                      <AlertCircle className="size-3.5" />
                      {totalErrorsCount} {totalErrorsCount === 1 ? 'error' : 'errors'} to fix
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {survey.public_token ? (
                    <Button
                      onClick={() => setShareDialogOpen(true)}
                      variant="outline"
                      className="gap-1.5 border-[#FF4500]/20 font-semibold text-[#FF4500] transition-all duration-150 hover:border-[#FF4500] hover:bg-[#FF4500]/5 hover:text-[#FF4500]"
                      size="sm"
                    >
                      <Share2 className="size-4" /> Share
                    </Button>
                  ) : null}
                  <Button
                    onClick={handleAddQuestion}
                    className="gap-1.5 bg-[#FF4500] font-semibold text-white shadow-xs hover:bg-[#FF4500]/90"
                    size="sm"
                  >
                    <Plus className="size-4" /> Add Question
                  </Button>
                </div>
              </div>

              {hasAttemptedSave && totalErrorsCount > 0 && (
                <div className="border-destructive/30 bg-destructive/5 text-destructive flex items-start gap-3 rounded-xl border p-4">
                  <AlertCircle className="mt-0.5 size-5 shrink-0" />
                  <div className="space-y-1 text-xs">
                    <p className="font-semibold">
                      Please fix form validation errors before saving:
                    </p>
                    <ul className="list-disc space-y-0.5 pl-4">
                      {questions.map((_q, idx) => {
                        const err = validationErrors[idx];
                        if (!err?.hasError) return null;
                        return (
                          <li key={idx}>
                            <span className="font-semibold">Question {idx + 1}:</span>{' '}
                            {err.questionTextError ??
                              err.generalOptionsError ??
                              Object.values(err.optionsErrors)[0]}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              )}

              {questions.length === 0 ? (
                <Card className="border-dashed p-8 text-center">
                  <p className="text-muted-foreground text-sm">No questions in this survey yet.</p>
                  <Button
                    onClick={handleAddQuestion}
                    className="mt-4 gap-1.5 bg-[#FF4500] font-semibold text-white shadow-xs hover:bg-[#FF4500]/90"
                  >
                    <Plus className="size-4" /> Add your first question
                  </Button>
                </Card>
              ) : (
                <div className="space-y-4">
                  {questions.map((q, qIdx) => {
                    const qErr = validationErrors[qIdx];
                    const hasCardError =
                      (hasAttemptedSave || q.question_text.length > 0) && qErr?.hasError;

                    return (
                      <Card
                        key={qIdx}
                        data-question-card
                        className={cn(
                          'relative overflow-visible transition-all',
                          hasCardError && 'border-destructive/60 bg-destructive/[0.01] shadow-2xs',
                        )}
                      >
                        <CardContent className="space-y-4 pt-6">
                          {/* Question Action Row */}
                          <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-3">
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground text-xs font-semibold uppercase">
                                Question {qIdx + 1}
                              </span>
                              {hasCardError && (
                                <span className="text-destructive bg-destructive/10 flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium">
                                  <AlertCircle className="size-3" />
                                  Needs attention
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                disabled={qIdx === 0}
                                onClick={() => moveQuestion(qIdx, 'up')}
                                title="Move up"
                                className="text-muted-foreground transition-all duration-150 hover:bg-[#FF4500]/5 hover:text-[#FF4500] disabled:opacity-50"
                              >
                                <ArrowUp className="size-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                disabled={qIdx === questions.length - 1}
                                onClick={() => moveQuestion(qIdx, 'down')}
                                title="Move down"
                                className="text-muted-foreground transition-all duration-150 hover:bg-[#FF4500]/5 hover:text-[#FF4500] disabled:opacity-50"
                              >
                                <ArrowDown className="size-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeleteIndex(qIdx)}
                                className="text-destructive hover:bg-destructive/10"
                                title="Delete question"
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Question Text, Type & Optional/Mandatory Dropdown */}
                          <div className="grid gap-4 md:grid-cols-12">
                            {/* Question Text */}
                            <div className="space-y-1.5 md:col-span-6">
                              <Label htmlFor={`q-text-${qIdx}`} className="text-xs font-semibold">
                                Question Text <span className="text-destructive font-bold">*</span>
                              </Label>
                              <Input
                                id={`q-text-${qIdx}`}
                                value={q.question_text}
                                onChange={(e) =>
                                  handleQuestionChange(qIdx, { question_text: e.target.value })
                                }
                                placeholder="e.g. How often do you face this challenge?"
                                className={cn(
                                  (hasAttemptedSave || q.question_text.length > 0) &&
                                    qErr?.questionTextError &&
                                    'border-destructive focus-visible:ring-destructive',
                                )}
                              />
                              {(hasAttemptedSave || q.question_text.length > 0) &&
                                qErr?.questionTextError && (
                                  <p className="text-destructive mt-1 flex items-center gap-1 text-[11px] font-medium">
                                    <AlertCircle className="size-3 shrink-0" />
                                    {qErr.questionTextError}
                                  </p>
                                )}
                            </div>

                            {/* Question Type */}
                            <div className="space-y-1.5 md:col-span-3">
                              <Label className="text-xs font-semibold">
                                Question Type <span className="text-destructive font-bold">*</span>
                              </Label>
                              <Select
                                value={q.question_type}
                                onValueChange={(val: FormQuestion['question_type']) =>
                                  handleQuestionChange(qIdx, { question_type: val })
                                }
                              >
                                <SelectTrigger aria-label="Question Type">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="text">Open Text (Comment)</SelectItem>
                                  <SelectItem value="radio">
                                    Multiple Choice (Single Select)
                                  </SelectItem>
                                  <SelectItem value="checkbox">
                                    Checkboxes (Multi Select)
                                  </SelectItem>
                                  <SelectItem value="dropdown">Dropdown Selection</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Mandatory / Optional Requirement Dropdown */}
                            <div className="space-y-1.5 md:col-span-3">
                              <Label className="text-xs font-semibold">
                                Requirement <span className="text-destructive font-bold">*</span>
                              </Label>
                              <Select
                                value={q.optional ? 'optional' : 'mandatory'}
                                onValueChange={(val) =>
                                  handleQuestionChange(qIdx, { optional: val === 'optional' })
                                }
                              >
                                <SelectTrigger aria-label="Requirement">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="mandatory">Mandatory</SelectItem>
                                  <SelectItem value="optional">Optional</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          {/* Options Editor (Choice Types Only) */}
                          {['radio', 'checkbox', 'dropdown'].includes(q.question_type) ? (
                            <div className="space-y-3 border-t pt-4">
                              <div className="flex items-center justify-between">
                                <Label className="text-xs font-semibold">
                                  Answer Options{' '}
                                  <span className="text-destructive font-bold">*</span>
                                </Label>
                              </div>

                              {qErr?.generalOptionsError && (
                                <p className="text-destructive flex items-center gap-1 text-[11px] font-medium">
                                  <AlertCircle className="size-3 shrink-0" />
                                  {qErr.generalOptionsError}
                                </p>
                              )}

                              <div className="grid gap-3 sm:grid-cols-2">
                                {q.options.map((opt, optIdx) => {
                                  const optErr = qErr?.optionsErrors[optIdx];
                                  const hasOptError =
                                    (hasAttemptedSave || opt.length > 0) && Boolean(optErr);

                                  return (
                                    <div key={optIdx} className="flex flex-col gap-1">
                                      <div className="flex items-center gap-2">
                                        <Input
                                          value={opt}
                                          onChange={(e) =>
                                            handleOptionChange(qIdx, optIdx, e.target.value)
                                          }
                                          placeholder={`Option ${optIdx + 1}`}
                                          className={cn(
                                            'h-8 text-xs',
                                            hasOptError &&
                                              'border-destructive focus-visible:ring-destructive',
                                          )}
                                        />
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => handleRemoveOption(qIdx, optIdx)}
                                          disabled={q.options.length <= 2}
                                          className="text-muted-foreground hover:text-destructive size-8 shrink-0"
                                          title="Remove option"
                                        >
                                          <Trash2 className="size-3.5" />
                                        </Button>
                                      </div>
                                      {hasOptError && (
                                        <span className="text-destructive flex items-center gap-1 text-[10px] font-medium">
                                          <AlertCircle className="size-3 shrink-0" />
                                          {optErr}
                                        </span>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>

                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="mt-2 h-7 border-[#FF4500]/20 text-[11px] font-semibold text-[#FF4500] transition-all duration-150 hover:border-[#FF4500] hover:bg-[#FF4500]/5 hover:text-[#FF4500]"
                                onClick={() => handleAddOption(qIdx)}
                              >
                                <Plus className="mr-1 size-3" /> Add Option
                              </Button>
                            </div>
                          ) : null}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between border-t pt-4">
              <div className="text-muted-foreground text-xs">
                {totalErrorsCount > 0 && hasAttemptedSave ? (
                  <span className="text-destructive flex items-center gap-1 font-medium">
                    <AlertTriangle className="size-3.5" />
                    Please fix the {totalErrorsCount} highlighted issue(s) above.
                  </span>
                ) : (
                  <span>
                    All questions and options must be filled and unique before publishing.
                  </span>
                )}
              </div>

              <Button
                onClick={handleSave}
                disabled={updateSurveyMutation.isPending}
                className="bg-[#FF4500] font-semibold text-white hover:bg-[#FF4500]/90"
              >
                {updateSurveyMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" /> Saving...
                  </>
                ) : (
                  'Save & Publish Survey'
                )}
              </Button>
            </div>
          </TabsContent>

          {/* RESPONSES TAB */}
          <TabsContent value="responses" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Collected Responses</CardTitle>
                <CardDescription>View feedback gathered from external respondents.</CardDescription>
              </CardHeader>
              <CardContent>
                {isResponsesLoading ? (
                  <div className="flex h-32 items-center justify-center">
                    <Loader2 className="text-muted-foreground size-6 animate-spin" />
                  </div>
                ) : !responsesData || responsesData.total_responses === 0 ? (
                  <div className="py-12 text-center">
                    <p className="text-muted-foreground text-sm">No responses recorded yet.</p>
                    <p className="text-muted-foreground/75 mt-1 text-xs">
                      Share the live survey link with target customers to start collecting feedback.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left text-sm">
                      <thead>
                        <tr className="text-muted-foreground border-b font-semibold">
                          <th className="px-4 py-3">Respondent</th>
                          <th className="px-4 py-3">Submitted At</th>
                          <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {responsesData.responses.map((resp) => (
                          <tr key={resp.id} className="hover:bg-muted/30 transition-colors">
                            <td className="px-4 py-3.5 font-medium">
                              {resp.respondent_email ?? (
                                <span className="text-muted-foreground/60 italic">Anonymous</span>
                              )}
                            </td>
                            <td className="text-muted-foreground px-4 py-3.5">
                              {new Date(resp.submitted_at).toLocaleString()}
                            </td>
                            <td className="px-4 py-3.5 text-right">
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-[#FF4500]/20 font-semibold text-[#FF4500] transition-all duration-150 hover:border-[#FF4500] hover:bg-[#FF4500]/5 hover:text-[#FF4500]"
                                onClick={() => setSelectedResponse(resp)}
                              >
                                View Answers
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modal for viewing single response details */}
        <Dialog
          open={selectedResponse !== null}
          onOpenChange={(open) => !open && setSelectedResponse(null)}
        >
          <DialogContent className="max-h-[75vh] max-w-xl overflow-y-auto p-5 sm:p-6">
            <DialogHeader>
              <DialogTitle>Survey Response Detail</DialogTitle>
            </DialogHeader>
            {selectedResponse ? (
              <div className="space-y-6 pt-4">
                <div className="text-muted-foreground grid grid-cols-1 gap-4 border-b pb-4 text-xs sm:grid-cols-2">
                  <div>
                    <span className="text-foreground block font-semibold uppercase">
                      Respondent
                    </span>
                    {selectedResponse.respondent_email ?? 'Anonymous'}
                  </div>
                  <div>
                    <span className="text-foreground block font-semibold uppercase">
                      Submitted At
                    </span>
                    {new Date(selectedResponse.submitted_at).toLocaleString()}
                  </div>
                </div>

                <div className="space-y-5">
                  {survey.questions.map((q) => {
                    const ansItem = selectedResponse.answers.find((a) => a.questionId === q.id);
                    const rawAns = ansItem?.answer;
                    let ansText = '';
                    if (Array.isArray(rawAns)) {
                      ansText = rawAns.join(', ');
                    } else if (
                      typeof rawAns === 'string' ||
                      typeof rawAns === 'number' ||
                      typeof rawAns === 'boolean'
                    ) {
                      ansText = String(rawAns);
                    } else if (rawAns) {
                      ansText = JSON.stringify(rawAns);
                    }

                    return (
                      <div key={q.id} className="space-y-1.5">
                        <p className="text-foreground text-sm font-semibold">
                          Q{q.id}. {q.question}
                        </p>
                        <div className="bg-muted/50 text-foreground rounded-lg border p-3 text-sm leading-relaxed">
                          {ansText.trim() ? (
                            ansText
                          ) : (
                            <span className="text-muted-foreground/60 italic">
                              No response provided
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </DialogContent>
        </Dialog>

        {/* Confirmation Modal for Deleting a Question */}
        <Dialog open={deleteIndex !== null} onOpenChange={(open) => !open && setDeleteIndex(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Delete Question</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this question? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDeleteIndex(null)}>
                Cancel
              </Button>
              <Button
                className="bg-destructive hover:bg-destructive/90 font-semibold text-white"
                onClick={() => {
                  if (deleteIndex !== null) {
                    handleRemoveQuestion(deleteIndex);
                    setDeleteIndex(null);
                    toast.success('Question deleted successfully!');
                  }
                }}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Share Survey Link Dialog */}
        <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
          <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-[500px]">
            {/* Gradient Header */}
            <div className="relative overflow-hidden bg-gradient-to-br from-[#FF4500]/10 via-[#FF6B35]/5 to-transparent px-6 pt-6 pb-5">
              <div className="relative z-10">
                <div className="mb-3 flex size-10 items-center justify-center rounded-xl border border-[#FF4500]/20 bg-[#FF4500]/10">
                  <Share2 className="size-[18px] text-[#FF4500]" />
                </div>
                <DialogTitle className="text-lg font-semibold tracking-tight">
                  Share Survey
                </DialogTitle>
                <DialogDescription className="mt-0.5 text-[13px] leading-relaxed">
                  Send this link to respondents to collect real market feedback.
                </DialogDescription>
              </div>
              <div className="absolute -top-6 -right-6 size-24 rounded-full bg-[#FF4500]/[0.06]" />
              <div className="absolute -top-2 -right-2 size-12 rounded-full bg-[#FF4500]/[0.08]" />
            </div>

            <div className="px-6 pt-5 pb-6">
              {survey?.public_token ? (
                <>
                  <p className="text-muted-foreground mb-1.5 text-[11px] font-medium tracking-wider uppercase">
                    Survey Link
                  </p>
                  <div className="border-border bg-muted/40 mb-2 flex min-w-0 items-center gap-2 overflow-hidden rounded-xl border px-3 py-2.5">
                    <LinkIcon className="text-muted-foreground size-3.5 shrink-0" />
                    <span className="text-foreground min-w-0 flex-1 truncate font-mono text-[12px]">
                      {window.location.origin}/surveys/public/{survey.public_token.slice(0, 21)}…
                    </span>
                  </div>

                  <Button
                    onClick={handleCopyLink}
                    className="mb-5 w-full gap-2 rounded-xl bg-[#FF4500] font-semibold text-white shadow-sm hover:bg-[#FF4500]/90"
                  >
                    <Copy className="size-4" />
                    Copy Link
                  </Button>

                  <div className="mb-4 flex items-center gap-3">
                    <span className="bg-border h-px flex-1" />
                    <span className="text-muted-foreground/60 text-[11px] font-medium tracking-widest uppercase">
                      Share via
                    </span>
                    <span className="bg-border h-px flex-1" />
                  </div>

                  <div className="grid grid-cols-5 gap-3">
                    {socialPlatforms.map((platform) => (
                      <a
                        key={platform.name}
                        href={platform.buildUrl(getShareUrl())}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={`Share on ${platform.name}`}
                        className="group flex flex-col items-center gap-1.5"
                      >
                        <span
                          className="flex size-11 items-center justify-center rounded-xl border transition-all duration-200 group-hover:scale-105 group-hover:shadow-md"
                          style={{
                            backgroundColor: `${platform.color}14`,
                            color: platform.color,
                            borderColor: `${platform.color}25`,
                          }}
                        >
                          {platform.icon}
                        </span>
                        <span className="text-muted-foreground group-hover:text-foreground text-[10px] font-medium transition-colors">
                          {platform.name}
                        </span>
                      </a>
                    ))}
                  </div>
                </>
              ) : (
                <div className="py-6 text-center">
                  <div className="bg-muted/50 mx-auto mb-3 flex size-12 items-center justify-center rounded-full">
                    <LinkIcon className="text-muted-foreground size-5" />
                  </div>
                  <p className="text-foreground text-sm font-medium">No link available yet</p>
                  <p className="text-muted-foreground mt-1 text-[13px]">
                    Save and publish your survey to generate a shareable link.
                  </p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  };

  return (
    <MentorShell navItems={navItems} navSectionLabel={workspace?.name ?? 'Workspace'}>
      {renderContent()}
    </MentorShell>
  );
}
