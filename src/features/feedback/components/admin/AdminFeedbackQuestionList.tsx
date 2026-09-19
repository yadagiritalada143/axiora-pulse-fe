import {
  Check,
  CheckCircle2,
  CheckSquare,
  ChevronDown,
  CircleDot,
  Edit2,
  Eye,
  EyeOff,
  Filter,
  HelpCircle,
  ListFilter,
  PenLine,
  RotateCcw,
  Search,
  Smile,
  Star,
} from 'lucide-react';
import { useMemo, useState } from 'react';

import {
  FEEDBACK_ANSWER_TYPES,
  STAR_DESCRIPTIONS,
  countStars,
  isStarQuestion,
  type FeedbackAnswerType,
  type FeedbackQuestion,
} from '@/types/feedback.types';
import { Loader } from '@components/common/Loader';
import { Badge } from '@components/ui/badge';
import { Button } from '@components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import { Input } from '@components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ui/select';

import { useAdminFeedbackQuestions, useUpdateFeedbackQuestion } from '../../hooks/useFeedback';

import { FeedbackQuestionDialog } from './FeedbackQuestionDialog';

function getEmojiSentimentLabel(ans: string, index?: number, total?: number): string {
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

interface AnswerTypeMeta {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeClass: string;
}

const ANSWER_TYPE_CONFIG: Record<FeedbackAnswerType, AnswerTypeMeta> = {
  textarea: {
    label: 'Text Area',
    icon: PenLine,
    badgeClass: 'border-purple-500/30 bg-purple-500/10 text-purple-700 dark:text-purple-300',
  },
  radiobuttons: {
    label: 'Single Choice',
    icon: CircleDot,
    badgeClass: 'border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300',
  },
  checkboxes: {
    label: 'Multiple Choice',
    icon: CheckSquare,
    badgeClass: 'border-teal-500/30 bg-teal-500/10 text-teal-700 dark:text-teal-300',
  },
  dropdown: {
    label: 'Dropdown',
    icon: ChevronDown,
    badgeClass: 'border-orange-500/30 bg-orange-500/10 text-orange-700 dark:text-orange-300',
  },
  emoji: {
    label: 'Emoji Rating',
    icon: Smile,
    badgeClass: 'border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300',
  },
};

export function AdminFeedbackQuestionList() {
  const { data: questions, isLoading, isError } = useAdminFeedbackQuestions();
  const updateMutation = useUpdateFeedbackQuestion();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [displayFilter, setDisplayFilter] = useState<string>('all');
  const [editingQuestion, setEditingQuestion] = useState<FeedbackQuestion | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const totalQuestionsCount = questions?.length ?? 0;
  const activeQuestionsCount = questions?.filter((q) => q.is_display).length ?? 0;
  const hiddenQuestionsCount = totalQuestionsCount - activeQuestionsCount;

  const filteredQuestions = useMemo(() => {
    if (!questions) return [];

    return questions.filter((q) => {
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesQuestion = q.question.toLowerCase().includes(query);
        const matchesOptions = q.answers?.some((ans) => ans.toLowerCase().includes(query));
        if (!matchesQuestion && !matchesOptions) return false;
      }

      if (selectedType !== 'all' && q.answer_type !== selectedType) {
        return false;
      }

      if (displayFilter === 'displayed' && !q.is_display) return false;
      if (displayFilter === 'hidden' && q.is_display) return false;

      return true;
    });
  }, [questions, searchQuery, selectedType, displayFilter]);

  const handleToggleDisplay = (question: FeedbackQuestion) => {
    updateMutation.mutate({
      questionId: question.id,
      payload: { is_display: !question.is_display },
    });
  };

  const handleEditClick = (question: FeedbackQuestion) => {
    setEditingQuestion(question);
    setIsDialogOpen(true);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedType('all');
    setDisplayFilter('all');
  };

  const hasActiveFilters = searchQuery !== '' || selectedType !== 'all' || displayFilter !== 'all';

  return (
    <Card className="border-border shadow-xs">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-foreground text-lg font-bold sm:text-xl">
              Feedback Questionnaire Questions
            </CardTitle>
            <p className="text-foreground/70 dark:text-muted-foreground mt-1 text-xs">
              Configure questions shown sequentially to founders upon certificate download.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              {activeQuestionsCount} Active
            </span>
            <span className="bg-muted text-foreground/75 dark:text-muted-foreground border-border inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium">
              {hiddenQuestionsCount} Hidden
            </span>
            <span className="text-muted-foreground pl-1 text-xs font-medium">
              ({filteredQuestions.length} shown)
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 pt-3 sm:grid-cols-12">
          <div className="relative sm:col-span-6">
            <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              placeholder="Search by question text or option..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-background text-foreground border-border h-9 pl-9 text-xs"
            />
          </div>

          <div className="sm:col-span-3">
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="bg-background text-foreground border-border h-9 text-xs">
                <div className="flex items-center gap-2 truncate">
                  <Filter className="text-muted-foreground size-3.5 shrink-0" />
                  <SelectValue placeholder="All Answer Types" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Answer Types</SelectItem>
                {FEEDBACK_ANSWER_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2 sm:col-span-3">
            <Select value={displayFilter} onValueChange={setDisplayFilter}>
              <SelectTrigger className="bg-background text-foreground border-border h-9 flex-1 text-xs">
                <div className="flex items-center gap-2 truncate">
                  <ListFilter className="text-muted-foreground size-3.5 shrink-0" />
                  <SelectValue placeholder="All Statuses" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="displayed">Active on Form</SelectItem>
                <SelectItem value="hidden">Hidden from Form</SelectItem>
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleResetFilters}
                className="text-muted-foreground hover:text-foreground size-9 shrink-0"
                title="Reset filters"
              >
                <RotateCcw className="size-3.5" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading && <Loader label="Loading questions..." className="py-12" />}

        {isError && (
          <div className="text-destructive space-y-2 p-8 text-center text-sm">
            <p className="font-semibold">Failed to load feedback questions.</p>
            <p className="text-muted-foreground text-xs">Please refresh the page to try again.</p>
          </div>
        )}

        {!isLoading && !isError && filteredQuestions.length === 0 && (
          <div className="border-border rounded-xl border border-dashed p-12 text-center">
            <div className="bg-muted text-muted-foreground mx-auto mb-3 flex size-12 items-center justify-center rounded-full">
              <HelpCircle className="size-6" />
            </div>
            <p className="text-foreground text-sm font-semibold">No questions found</p>
            <p className="text-muted-foreground mx-auto mt-1 max-w-sm text-xs">
              {questions?.length === 0
                ? 'No feedback questions have been created yet. Click "Add Question" to configure your first question.'
                : 'No questions matched your search query or filter criteria.'}
            </p>
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetFilters}
                className="mt-4 text-xs"
              >
                Reset Filters
              </Button>
            )}
          </div>
        )}

        {!isLoading && !isError && filteredQuestions.length > 0 && (
          <div className="space-y-4">
            {filteredQuestions.map((q, index) => {
              const isStar =
                q.answer_type === 'emoji' && isStarQuestion(q.question, q.answers, q.answer_type);
              const typeConfig = isStar
                ? {
                    label: '5-Star Rating',
                    icon: Star,
                    badgeClass:
                      'border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300',
                  }
                : (ANSWER_TYPE_CONFIG[q.answer_type] ?? {
                    label: q.answer_type,
                    icon: HelpCircle,
                    badgeClass: 'border-border bg-muted text-foreground',
                  });
              const TypeIcon = typeConfig.icon;
              const isPendingThis =
                updateMutation.isPending && updateMutation.variables?.questionId === q.id;

              return (
                <div
                  key={q.id}
                  className={`group bg-card relative rounded-2xl border p-5 transition-all duration-200 sm:p-6 ${
                    q.is_display
                      ? 'border-border shadow-2xs hover:border-[#FF4500]/40 hover:shadow-sm'
                      : 'border-border/60 bg-muted/15 hover:border-border opacity-80 hover:opacity-100'
                  }`}
                >
                  <div className="border-border/60 flex flex-col gap-3 border-b pb-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center rounded-lg border border-orange-500/20 bg-orange-500/10 px-2.5 py-1 text-xs font-bold text-[#FF4500]">
                        Question {index + 1}
                      </span>

                      <Badge
                        variant="outline"
                        className={`flex items-center gap-1.5 text-xs font-semibold ${typeConfig.badgeClass}`}
                      >
                        <TypeIcon
                          className={`size-3.5 ${isStar ? 'fill-amber-400 text-amber-500' : ''}`}
                        />
                        {typeConfig.label}
                      </Badge>

                      <Badge
                        variant="outline"
                        className={
                          q.optional
                            ? 'border-border bg-muted/60 text-foreground/80 dark:text-muted-foreground text-xs font-medium'
                            : 'border-rose-500/30 bg-rose-500/10 text-xs font-semibold text-rose-700 dark:text-rose-400'
                        }
                      >
                        {q.optional ? 'Optional' : 'Required'}
                      </Badge>

                      {q.is_display ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                          <CheckCircle2 className="size-3" />
                          Active on Form
                        </span>
                      ) : (
                        <span className="bg-muted text-muted-foreground border-border inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium">
                          Hidden
                        </span>
                      )}
                    </div>

                    <div className="flex shrink-0 items-center gap-2 self-end sm:self-auto">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleDisplay(q)}
                        disabled={isPendingThis}
                        className={`h-8 gap-1.5 text-xs transition-colors ${
                          q.is_display
                            ? 'text-foreground/80 hover:text-destructive hover:border-destructive/30 hover:bg-destructive/10'
                            : 'border-emerald-500/30 text-emerald-700 hover:border-emerald-500/50 hover:bg-emerald-500/10 dark:text-emerald-400'
                        }`}
                        title={
                          q.is_display
                            ? 'Hide question from user form'
                            : 'Show question on user form'
                        }
                      >
                        {q.is_display ? (
                          <>
                            <EyeOff className="text-muted-foreground size-3.5" />
                            Hide
                          </>
                        ) : (
                          <>
                            <Eye className="size-3.5" />
                            Display
                          </>
                        )}
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditClick(q)}
                        className="border-border text-foreground h-8 gap-1.5 text-xs font-medium transition-colors hover:border-[#FF4500] hover:bg-orange-500/5 hover:text-[#FF4500]"
                        aria-label={`Edit "${q.question}"`}
                      >
                        <Edit2 className="size-3.5" />
                        Edit
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3 pt-3">
                    <h3 className="text-foreground text-base leading-snug font-bold tracking-tight sm:text-lg">
                      {q.question}
                    </h3>

                    {isStar && q.answers && q.answers.length > 0 ? (
                      <div className="space-y-1.5 pt-1">
                        <p className="text-muted-foreground flex items-center gap-1.5 text-[11px] font-bold tracking-wider uppercase">
                          <Star className="size-3.5 fill-amber-400 text-amber-500" />
                          5-Star Rating Scale ({q.answers.length} Levels)
                        </p>
                        <div className="flex flex-wrap items-center gap-2">
                          {q.answers.map((ans, aIdx) => {
                            const starCount = countStars(ans) || aIdx + 1;
                            const starDesc = STAR_DESCRIPTIONS[starCount] ?? `${starCount} Stars`;
                            return (
                              <div
                                key={aIdx}
                                className="text-foreground inline-flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 px-3 py-1.5 transition-transform hover:scale-105"
                              >
                                <span className="text-base tracking-widest text-[#FFB800]">
                                  {ans}
                                </span>
                                <span className="text-foreground/90 text-xs font-semibold">
                                  {starCount} {starCount === 1 ? 'Star' : 'Stars'} — {starDesc}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : q.answer_type === 'emoji' && q.answers && q.answers.length > 0 ? (
                      <div className="space-y-1.5 pt-1">
                        <p className="text-muted-foreground text-[11px] font-bold tracking-wider uppercase">
                          Emoji Sentiment Scale ({q.answers.length} Options)
                        </p>
                        <div className="flex flex-wrap items-center gap-2">
                          {q.answers.map((ans, aIdx) => (
                            <div
                              key={aIdx}
                              className="border-border bg-muted/25 text-foreground inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 transition-transform hover:scale-105"
                            >
                              <span className="text-xl leading-none">{ans}</span>
                              <span className="text-foreground/90 text-xs font-semibold">
                                {getEmojiSentimentLabel(ans, aIdx, q.answers.length)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (q.answer_type === 'radiobuttons' || q.answer_type === 'dropdown') &&
                      q.answers &&
                      q.answers.length > 0 ? (
                      <div className="space-y-1.5 pt-1">
                        <p className="text-muted-foreground text-[11px] font-bold tracking-wider uppercase">
                          Selectable Choices ({q.answers.length} Options)
                        </p>
                        <div className="flex flex-wrap items-center gap-2">
                          {q.answers.map((ans, aIdx) => (
                            <div
                              key={aIdx}
                              className="border-border bg-muted/25 text-foreground inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-medium"
                            >
                              <span className="size-2 shrink-0 rounded-full border-2 border-[#FF4500]" />
                              <span>{ans}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : q.answer_type === 'checkboxes' && q.answers && q.answers.length > 0 ? (
                      <div className="space-y-1.5 pt-1">
                        <p className="text-muted-foreground text-[11px] font-bold tracking-wider uppercase">
                          Multiple-Choice Checkboxes ({q.answers.length} Options)
                        </p>
                        <div className="flex flex-wrap items-center gap-2">
                          {q.answers.map((ans, aIdx) => (
                            <div
                              key={aIdx}
                              className="border-border bg-muted/25 text-foreground inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-medium"
                            >
                              <span className="border-muted-foreground/50 bg-background text-foreground flex size-3.5 shrink-0 items-center justify-center rounded-md border text-[10px]">
                                <Check className="size-2.5 stroke-[3]" />
                              </span>
                              <span>{ans}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : q.answer_type === 'textarea' ? (
                      <div className="space-y-1.5 pt-1">
                        <p className="text-muted-foreground text-[11px] font-bold tracking-wider uppercase">
                          Open-Ended Text Response
                        </p>
                        <div className="border-border bg-muted/15 text-foreground/75 dark:text-muted-foreground flex items-center gap-2.5 rounded-xl border border-dashed p-3.5 text-xs">
                          <PenLine className="size-4 shrink-0 text-[#FF4500]" />
                          <span>
                            Participants enter custom written thoughts in an expandable feedback
                            textarea (up to 500 characters).
                          </span>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>

      <FeedbackQuestionDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setEditingQuestion(null);
        }}
        questionToEdit={editingQuestion}
      />
    </Card>
  );
}
