import axios from 'axios';
import {
  ArrowDown,
  ArrowUp,
  Bot,
  ClipboardList,
  Copy,
  FileText,
  Loader2,
  Plus,
  ShieldCheck,
  Trash2,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useState, useEffect } from 'react';
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
import { ROUTES, buildWorkspaceRoute, buildWorkspaceSurveyRoute } from '@constants/routes';
import { MentorShell, type MentorNavItem } from '@features/ideaValidation/components';
import {
  useSurveyByWorkspace,
  useSurveyResponses,
  useUpdateWorkspaceSurveyQuestions,
} from '@features/survey/hooks/useSurveys';
import type { SingleSurveyResponseItem, WorkspaceSurveyQuestionItem } from '@features/survey/types';
import { useWorkspaceState } from '@features/workspace/hooks/useWorkspaceMentor';
import { useWorkspace } from '@features/workspace/hooks/useWorkspaces';

interface FormQuestion {
  question_text: string;
  question_type: 'text' | 'radio' | 'checkbox' | 'dropdown';
  target_hypothesis: string;
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

  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    if (survey && !hasInitialized) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHasInitialized(true);

      if (survey.questions && survey.questions.length > 0) {
        const mapped: FormQuestion[] = survey.questions.map((q) => ({
          question_text: q.question,
          question_type: q.questionType,
          target_hypothesis: '',
          options: q.options || [],
        }));
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
    { label: 'Founder Intelligence', icon: Users, disabled: true },
    { label: 'Startup Intelligence', icon: TrendingUp, disabled: true },
    { label: 'Documents & reports', icon: FileText, disabled: true },
    { label: 'Risk Management', icon: ShieldCheck, disabled: true },
  ];

  const handleCopyLink = () => {
    if (!survey?.id) return;
    const publicUrl = `${window.location.origin}/surveys/public/${survey.id}`;
    void navigator.clipboard.writeText(publicUrl);
    toast.success('Survey link copied to clipboard!');
  };

  const handleAddQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        question_text: '',
        question_type: 'text',
        target_hypothesis: '',
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
      prev.map((q, idx) =>
        idx === qIndex ? { ...q, options: [...q.options, `Option ${q.options.length + 1}`] } : q,
      ),
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
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q) continue;
      if (!q.question_text.trim()) {
        toast.error(`Question ${i + 1} text cannot be empty.`);
        return;
      }
      if (['radio', 'checkbox', 'dropdown'].includes(q.question_type) && q.options.length < 2) {
        toast.error(`Question ${i + 1} (${q.question_type}) must have at least 2 options.`);
        return;
      }
    }

    const payloadQuestions: WorkspaceSurveyQuestionItem[] = questions.map((q) => ({
      question_text: q.question_text.trim(),
      question_type: q.question_type,
      target_hypothesis: q.target_hypothesis.trim() || null,
      options: ['radio', 'checkbox', 'dropdown'].includes(q.question_type) ? q.options : null,
    }));

    updateSurveyMutation.mutate(
      {
        questions: payloadQuestions,
      },
      {
        onSuccess: () => {
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
        {survey.id ? (
          <Card className="border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-950/10">
            <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <h3 className="text-foreground text-sm font-semibold">Your survey is live!</h3>
                <p className="text-muted-foreground text-xs leading-normal">
                  Share this public URL with target customers, ICP audiences, or respondents to
                  gather feedback.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-background border-border text-foreground flex items-center gap-2 rounded-lg border px-3 py-1.5 font-mono text-xs select-all">
                  {window.location.origin}/surveys/public/{survey.id}
                </div>
                <Button
                  size="icon"
                  variant="outline"
                  className="border-[#FF4500]/20 text-[#FF4500] transition-all duration-150 hover:border-[#FF4500] hover:bg-[#FF4500]/5 hover:text-[#FF4500]"
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
          <TabsList className="grid w-80 grid-cols-2">
            <TabsTrigger value="editor">Questions Editor</TabsTrigger>
            <TabsTrigger value="responses">
              Responses ({responsesData?.total_responses ?? 0})
            </TabsTrigger>
          </TabsList>

          {/* EDITOR TAB */}
          <TabsContent value="editor" className="mt-4 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-foreground text-base font-semibold">
                  Questions ({questions.length})
                </h3>
                <Button
                  onClick={handleAddQuestion}
                  className="gap-1.5 bg-[#FF4500] font-semibold text-white shadow-xs hover:bg-[#FF4500]/90"
                  size="sm"
                >
                  <Plus className="size-4" /> Add Question
                </Button>
              </div>

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
                  {questions.map((q, qIdx) => (
                    <Card key={qIdx} data-question-card className="relative overflow-visible">
                      <CardContent className="space-y-4 pt-6">
                        {/* Question Action Row */}
                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <span className="text-muted-foreground text-xs font-semibold uppercase">
                            Question {qIdx + 1}
                          </span>
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

                        {/* Question Text */}
                        <div className="grid gap-4 md:grid-cols-3">
                          <div className="space-y-1.5 md:col-span-2">
                            <Label>Question Text</Label>
                            <Input
                              value={q.question_text}
                              onChange={(e) =>
                                handleQuestionChange(qIdx, { question_text: e.target.value })
                              }
                              placeholder="e.g. How often do you face this challenge?"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <Label>Question Type</Label>
                            <Select
                              value={q.question_type}
                              onValueChange={(val: FormQuestion['question_type']) =>
                                handleQuestionChange(qIdx, { question_type: val })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="text">Open Text (Comment)</SelectItem>
                                <SelectItem value="radio">
                                  Multiple Choice (Single Select)
                                </SelectItem>
                                <SelectItem value="checkbox">Checkboxes (Multi Select)</SelectItem>
                                <SelectItem value="dropdown">Dropdown Selection</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* Options Editor (Choice Types Only) */}
                        {['radio', 'checkbox', 'dropdown'].includes(q.question_type) ? (
                          <div className="space-y-3 border-t pt-4">
                            <Label className="text-xs">Answer Options</Label>
                            <div className="grid gap-3 sm:grid-cols-2">
                              {q.options.map((opt, optIdx) => (
                                <div key={optIdx} className="flex items-center gap-2">
                                  <Input
                                    value={opt}
                                    onChange={(e) =>
                                      handleOptionChange(qIdx, optIdx, e.target.value)
                                    }
                                    placeholder={`Option ${optIdx + 1}`}
                                    className="h-8 text-xs"
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleRemoveOption(qIdx, optIdx)}
                                    disabled={q.options.length <= 2}
                                    className="text-muted-foreground hover:text-destructive size-8"
                                    title="Remove option"
                                  >
                                    <Trash2 className="size-3.5" />
                                  </Button>
                                </div>
                              ))}
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
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 border-t pt-4">
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
          <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Survey Response Detail</DialogTitle>
            </DialogHeader>

            {selectedResponse ? (
              <div className="space-y-6 pt-4">
                <div className="text-muted-foreground grid grid-cols-2 gap-4 border-b pb-4 text-xs">
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
      </div>
    );
  };

  return (
    <MentorShell navItems={navItems} navSectionLabel={workspace?.name ?? 'Workspace'}>
      {renderContent()}
    </MentorShell>
  );
}
