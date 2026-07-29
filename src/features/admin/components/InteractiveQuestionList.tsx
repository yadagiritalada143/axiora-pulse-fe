import { Trash2 } from 'lucide-react';
import { useState } from 'react';

import { Loader } from '@components/common/Loader';
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
import { Badge } from '@components/ui/badge';
import { Button } from '@components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import { useAdminInteractiveQuestions, useDeleteInteractiveQuestion } from '@features/admin/hooks';
import { INTERACTIVE_QUESTION_TYPE_LABELS } from '@schemas/interactiveQuestion.schema';

export function InteractiveQuestionList() {
  const { data: questions, isLoading, isError } = useAdminInteractiveQuestions();
  const deleteQuestion = useDeleteInteractiveQuestion();
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  const handleConfirmDelete = () => {
    if (pendingDeleteId === null) return;
    deleteQuestion.mutate(pendingDeleteId, { onSuccess: () => setPendingDeleteId(null) });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Existing questions</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && <Loader label="Loading questions" className="py-6" />}

        {isError && (
          <p className="text-destructive text-sm">
            Unable to load the questions. Please try again.
          </p>
        )}

        {!isLoading && !isError && questions?.length === 0 && (
          <p className="text-muted-foreground text-sm">No questions have been added yet.</p>
        )}

        {!isLoading && !isError && questions && questions.length > 0 && (
          <ul className="divide-border divide-y">
            {questions.map((question) => (
              <li key={question.id} className="flex items-start justify-between gap-4 py-4">
                <div className="min-w-0 space-y-2">
                  <p className="text-foreground text-sm font-medium">{question.question}</p>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge variant="secondary">
                      {INTERACTIVE_QUESTION_TYPE_LABELS[question.answer_type]}
                    </Badge>
                    <Badge variant={question.optional ? 'outline' : 'default'}>
                      {question.optional ? 'Optional' : 'Required'}
                    </Badge>
                  </div>
                  {question.answers && question.answers.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {question.answers.map((option) => (
                        <Badge key={option} variant="outline" className="font-normal">
                          {option}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Delete "${question.question}"`}
                  onClick={() => setPendingDeleteId(question.id)}
                  className="text-destructive hover:text-destructive shrink-0"
                >
                  <Trash2 className="size-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>

      <AlertDialog
        open={pendingDeleteId !== null}
        onOpenChange={(open) => !open && setPendingDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this question?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the question for every user, including anyone who already answered it.
              This can&apos;t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteQuestion.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} disabled={deleteQuestion.isPending}>
              {deleteQuestion.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
