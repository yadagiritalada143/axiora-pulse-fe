import { Plus, Smile, Star, Trash2 } from 'lucide-react';
import { useEffect } from 'react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';

import {
  CUMULATIVE_STAR_OPTIONS,
  FEEDBACK_ANSWER_TYPES,
  countStars,
  type CreateFeedbackQuestionPayload,
  type FeedbackAnswerType,
  type FeedbackQuestion,
  type UpdateFeedbackQuestionPayload,
} from '@/types/feedback.types';
import { ButtonLoader } from '@components/common/Loader';
import { Button } from '@components/ui/button';
import { Checkbox } from '@components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@components/ui/form';
import { Input } from '@components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ui/select';

import { useCreateFeedbackQuestion, useUpdateFeedbackQuestion } from '../../hooks/useFeedback';

const DEFAULT_EMOJI_OPTIONS = ['😄', '😃', '😐', '😕', '😞'];
const DEFAULT_SENTIMENT_OPTIONS = ['Not Like', 'Poor', 'Okay', 'Good', 'Definitely'];

interface FormData {
  question: string;
  answer_type: FeedbackAnswerType;
  optional: boolean;
  is_display: boolean;
  options: { value: string }[];
}

interface FeedbackQuestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  questionToEdit?: FeedbackQuestion | null;
}

export function FeedbackQuestionDialog({
  open,
  onOpenChange,
  questionToEdit,
}: FeedbackQuestionDialogProps) {
  const isEdit = Boolean(questionToEdit);
  const createMutation = useCreateFeedbackQuestion();
  const updateMutation = useUpdateFeedbackQuestion();

  const form = useForm<FormData>({
    defaultValues: {
      question: '',
      answer_type: 'radiobuttons',
      optional: false,
      is_display: true,
      options: [{ value: '' }, { value: '' }],
    },
  });

  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: 'options',
  });

  const selectedAnswerType = useWatch({ control: form.control, name: 'answer_type' });
  const watchedOptions = useWatch({ control: form.control, name: 'options' });
  const isChoiceType = selectedAnswerType !== 'textarea';

  useEffect(() => {
    if (questionToEdit) {
      let rawAnswers = questionToEdit.answers ?? [];
      const hasStars = rawAnswers.some((a) => a.includes('⭐'));
      const isAllSingleStars = hasStars && rawAnswers.every((a) => a.trim() === '⭐');
      if (isAllSingleStars && rawAnswers.length === 5) {
        rawAnswers = CUMULATIVE_STAR_OPTIONS;
      }

      form.reset({
        question: questionToEdit.question,
        answer_type: questionToEdit.answer_type,
        optional: questionToEdit.optional,
        is_display: questionToEdit.is_display,
        options:
          rawAnswers.length > 0
            ? rawAnswers.map((ans) => ({ value: ans }))
            : [{ value: '' }, { value: '' }],
      });
    } else {
      form.reset({
        question: '',
        answer_type: 'radiobuttons',
        optional: false,
        is_display: true,
        options: [{ value: '' }, { value: '' }],
      });
    }
  }, [questionToEdit, form, open]);

  const handleTypeChange = (type: FeedbackAnswerType) => {
    form.setValue('answer_type', type, { shouldValidate: true });

    if (type === 'textarea') {
      replace([]);
    } else if (type === 'emoji' && fields.length === 0) {
      replace(CUMULATIVE_STAR_OPTIONS.map((opt) => ({ value: opt })));
    } else if (fields.length < 2) {
      replace([{ value: '' }, { value: '' }]);
    }
  };

  const onSubmit = (data: FormData) => {
    let cleanedAnswers = isChoiceType
      ? data.options.map((o) => o.value.trim()).filter((val) => val.length > 0)
      : [];

    if (isChoiceType && cleanedAnswers.length < 2) {
      form.setError('options', {
        message: 'Choice-based questions require at least 2 non-empty options.',
      });
      return;
    }

    if (data.answer_type === 'emoji') {
      const hasStars = cleanedAnswers.some((a) => a.includes('⭐'));
      const allSingleStars = hasStars && cleanedAnswers.every((a) => a === '⭐');
      if (allSingleStars && cleanedAnswers.length === 5) {
        cleanedAnswers = CUMULATIVE_STAR_OPTIONS;
      }
    }

    if (isEdit && questionToEdit) {
      const payload: UpdateFeedbackQuestionPayload = {
        question: data.question.trim(),
        answer_type: data.answer_type,
        optional: data.optional,
        is_display: data.is_display,
        answers: cleanedAnswers,
      };

      updateMutation.mutate(
        { questionId: questionToEdit.id, payload },
        {
          onSuccess: () => onOpenChange(false),
        },
      );
    } else {
      const payload: CreateFeedbackQuestionPayload = {
        question: data.question.trim(),
        answer_type: data.answer_type,
        optional: data.optional,
        is_display: data.is_display,
        answers: cleanedAnswers,
      };

      createMutation.mutate(payload, {
        onSuccess: () => onOpenChange(false),
      });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Feedback Question' : 'Add Feedback Question'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update the question settings shown to users on venture completion.'
              : 'Add a new feedback question for users downloading their venture certificate.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-1">
            <FormField
              control={form.control}
              name="question"
              rules={{ required: 'Question text is required' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Question Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. What gave you the MOST value today?" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="answer_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Answer Type</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={(val) => handleTypeChange(val as FeedbackAnswerType)}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-background text-foreground border-border/80 dark:border-border dark:data-[placeholder]:text-muted-foreground dark:[&_svg]:text-muted-foreground h-14 w-full border p-5 text-xs font-medium shadow-2xs transition-colors hover:border-[#FF4500]/60 focus:border-[#FF4500] focus:ring-1 focus:ring-[#FF4500] data-[placeholder]:text-slate-700 sm:text-sm [&_svg]:text-slate-700">
                        <SelectValue placeholder="Select an answer type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-popover text-popover-foreground border-border border shadow-md">
                      {FEEDBACK_ANSWER_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value} className="cursor-pointer">
                          <div className="flex flex-col py-0.5 text-left">
                            <span className="text-foreground text-xs font-semibold sm:text-sm">
                              {type.label}
                            </span>
                            <span className="dark:text-muted-foreground text-[11px] leading-snug text-slate-600">
                              {type.description}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isChoiceType && (
              <div className="border-border bg-muted/20 space-y-3 rounded-lg border p-3.5">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <FormLabel className="text-xs font-semibold">Answer Options</FormLabel>
                    <p className="text-muted-foreground text-xs">
                      Provide at least 2 selectable options
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => append({ value: '' })}
                    className="h-8 cursor-pointer gap-1.5 self-start border-2 border-[#FF4500] bg-orange-500/10 px-3 text-xs font-bold text-[#FF4500] shadow-xs transition-all hover:bg-[#FF4500] hover:text-white sm:self-auto dark:bg-orange-950/40 dark:hover:bg-[#FF4500] dark:hover:text-white"
                  >
                    <Plus className="size-3.5 stroke-[2.5]" />
                    Add Option
                  </Button>
                </div>

                {selectedAnswerType === 'emoji' && (
                  <div className="flex flex-wrap items-center gap-1.5 pb-1">
                    <span className="text-muted-foreground text-[11px] font-medium">Presets:</span>
                    <button
                      type="button"
                      onClick={() => replace(CUMULATIVE_STAR_OPTIONS.map((v) => ({ value: v })))}
                      className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-800 transition-colors hover:bg-amber-500/20 dark:text-amber-300"
                    >
                      <Star className="size-3 fill-amber-400 text-amber-500" />
                      5-Star Rating (⭐ - ⭐⭐⭐⭐⭐)
                    </button>
                    <button
                      type="button"
                      onClick={() => replace(DEFAULT_EMOJI_OPTIONS.map((v) => ({ value: v })))}
                      className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 text-[11px] font-semibold text-blue-800 transition-colors hover:bg-blue-500/20 dark:text-blue-300"
                    >
                      <Smile className="size-3 text-blue-500" />
                      5-Emoji Smileys
                    </button>
                    <button
                      type="button"
                      onClick={() => replace(DEFAULT_SENTIMENT_OPTIONS.map((v) => ({ value: v })))}
                      className="border-border bg-muted/40 text-foreground/80 hover:bg-muted inline-flex cursor-pointer items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-medium transition-colors"
                    >
                      Sentiment Labels
                    </button>
                  </div>
                )}

                <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
                  {fields.map((fieldItem, idx) => {
                    const optVal = watchedOptions?.[idx]?.value ?? '';
                    const hasStar = optVal.includes('⭐');
                    const stars = hasStar ? countStars(optVal) || idx + 1 : 0;
                    return (
                      <div key={fieldItem.id} className="flex items-center gap-2">
                        <Input
                          placeholder={`Option ${idx + 1}`}
                          className="bg-background text-foreground border-border h-9 flex-1 text-xs"
                          {...form.register(`options.${idx}.value` as const, {
                            required: 'Option cannot be empty',
                          })}
                        />
                        {hasStar && (
                          <span className="shrink-0 rounded-md border border-amber-500/20 bg-amber-500/10 px-2 py-1 text-[11px] font-semibold text-amber-700 dark:text-amber-300">
                            {stars} {stars === 1 ? 'Star' : 'Stars'}
                          </span>
                        )}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(idx)}
                          disabled={fields.length <= 2}
                          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 size-9 shrink-0"
                          aria-label={`Remove option ${idx + 1}`}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
                {form.formState.errors.options && (
                  <p className="text-destructive text-xs font-medium">
                    {form.formState.errors.options.message ??
                      form.formState.errors.options.root?.message}
                  </p>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 gap-3 pt-1 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="optional"
                render={({ field }) => (
                  <FormItem className="border-border bg-card flex flex-row items-center space-y-0 space-x-2.5 rounded-lg border p-3 shadow-2xs">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        id="feedback-optional"
                      />
                    </FormControl>
                    <div className="space-y-0.5 leading-none">
                      <FormLabel
                        htmlFor="feedback-optional"
                        className="text-foreground cursor-pointer text-xs font-semibold"
                      >
                        Optional Question
                      </FormLabel>
                      <FormDescription className="text-foreground/70 dark:text-muted-foreground text-[11px]">
                        Users can skip answering
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_display"
                render={({ field }) => (
                  <FormItem className="border-border bg-card flex flex-row items-center space-y-0 space-x-2.5 rounded-lg border p-3 shadow-2xs">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        id="feedback-display"
                      />
                    </FormControl>
                    <div className="space-y-0.5 leading-none">
                      <FormLabel
                        htmlFor="feedback-display"
                        className="text-foreground cursor-pointer text-xs font-semibold"
                      >
                        Active on Form
                      </FormLabel>
                      <FormDescription className="text-foreground/70 dark:text-muted-foreground text-[11px]">
                        Visible to participants
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="gap-2 pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
                className="border-border text-foreground hover:bg-muted font-medium"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="bg-[#FF4500] font-semibold text-white shadow-xs hover:bg-[#FF4500]/90"
              >
                {isPending && <ButtonLoader className="mr-2" />}
                {isEdit ? 'Save Changes' : 'Create Question'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
