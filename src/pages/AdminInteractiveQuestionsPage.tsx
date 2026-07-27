import { InteractiveQuestionForm, InteractiveQuestionList } from '@features/admin/components';

export default function AdminInteractiveQuestionsPage() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8">
      <div>
        <h1 className="text-foreground text-2xl font-semibold tracking-tight sm:text-3xl">
          Interactive Questions
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Manage the questions users answer the first time they log in. New questions apply to
          everyone; deleting one removes it for all users, including those who already answered.
        </p>
      </div>

      <InteractiveQuestionForm />
      <InteractiveQuestionList />
    </div>
  );
}
