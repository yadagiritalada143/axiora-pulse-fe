import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, X } from 'lucide-react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';

import { ButtonLoader } from '@components/common/Loader';
import { Button } from '@components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import { Checkbox } from '@components/ui/checkbox';
import {
  Form,
  FormControl,
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
import { useCreateInteractiveQuestion } from '@features/admin/hooks';
import {
  createInteractiveQuestionSchema,
  INTERACTIVE_QUESTION_TYPE_LABELS,
  INTERACTIVE_QUESTION_TYPES,
  type CreateInteractiveQuestionFormValues,
} from '@schemas/interactiveQuestion.schema';

const DEFAULT_VALUES: CreateInteractiveQuestionFormValues = {
  question: '',
  question_type: 'text',
  optional: false,
  options: [],
};

export function InteractiveQuestionForm() {
  const createQuestion = useCreateInteractiveQuestion();

  const form = useForm<CreateInteractiveQuestionFormValues>({
    resolver: zodResolver(createInteractiveQuestionSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'options' });
  const questionType = useWatch({ control: form.control, name: 'question_type' });
  const showOptions = questionType !== 'text';

  const handleTypeChange = (value: CreateInteractiveQuestionFormValues['question_type']) => {
    form.setValue('question_type', value, { shouldValidate: true });

    if (value === 'text') {
      form.setValue('options', []);
      return;
    }

    if (fields.length === 0) {
      append({ value: '' });
      append({ value: '' });
    }
  };

  const onSubmit = (values: CreateInteractiveQuestionFormValues) => {
    createQuestion.mutate(
      {
        question: values.question,
        question_type: values.question_type,
        optional: values.optional,
        answers: values.question_type === 'text' ? undefined : values.options.map((o) => o.value),
      },
      { onSuccess: () => form.reset(DEFAULT_VALUES) },
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add a question</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <FormField
              control={form.control}
              name="question"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Question title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. What best describes your role?" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="question_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Question type</FormLabel>
                  <Select value={field.value} onValueChange={handleTypeChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a question type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {INTERACTIVE_QUESTION_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {INTERACTIVE_QUESTION_TYPE_LABELS[type]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {showOptions && (
              <FormItem>
                <FormLabel>Options</FormLabel>
                <div className="space-y-2">
                  {fields.map((field, index) => (
                    <FormField
                      key={field.id}
                      control={form.control}
                      name={`options.${index}.value`}
                      render={({ field: optionField }) => (
                        <FormItem>
                          <div className="flex items-center gap-2">
                            <FormControl>
                              <Input placeholder={`Option ${index + 1}`} {...optionField} />
                            </FormControl>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              aria-label="Remove option"
                              onClick={() => remove(index)}
                              disabled={fields.length <= 2}
                            >
                              <X className="size-4" />
                            </Button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-fit"
                  onClick={() => append({ value: '' })}
                >
                  <Plus className="size-4" />
                  Add option
                </Button>
                {form.formState.errors.options?.message && (
                  <p className="text-destructive text-sm">
                    {form.formState.errors.options.message}
                  </p>
                )}
              </FormItem>
            )}

            <FormField
              control={form.control}
              name="optional"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center gap-2 space-y-0">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className="font-normal">This question is optional</FormLabel>
                </FormItem>
              )}
            />

            <Button type="submit" disabled={createQuestion.isPending}>
              {createQuestion.isPending ? <ButtonLoader className="mr-2" /> : null}
              Add question
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
