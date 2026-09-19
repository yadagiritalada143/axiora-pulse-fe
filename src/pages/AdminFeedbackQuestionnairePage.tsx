import { CheckCircle2, HelpCircle, MessageSquareHeart, Plus, Users } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@components/ui/button';
import { Card, CardContent } from '@components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs';
import { useAdminFeedbackQuestions, useAdminUserFeedbackSubmissions } from '@features/feedback';
import {
  AdminFeedbackQuestionList,
  AdminFeedbackSubmissionsTable,
  FeedbackQuestionDialog,
} from '@features/feedback/components/admin';

export default function AdminFeedbackQuestionnairePage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'questions' | 'submissions'>('questions');

  const { data: questions } = useAdminFeedbackQuestions();
  const { data: submissionsData } = useAdminUserFeedbackSubmissions({ limit: 1, offset: 0 });

  const totalQuestions = questions?.length ?? 0;
  const activeQuestions = questions?.filter((q) => q.is_display).length ?? 0;
  const totalSubmissions = submissionsData?.pagination.total ?? 0;

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
              Feedback Questionnaire
            </h1>
            <span className="rounded-md border border-orange-500/20 bg-orange-500/10 px-2.5 py-0.5 text-xs font-semibold text-[#FF4500]">
              Admin
            </span>
          </div>
          <p className="text-foreground/75 dark:text-muted-foreground mt-1.5 text-sm">
            Manage feedback questions asked during certificate downloads and inspect user responses.
          </p>
        </div>

        <Button
          onClick={() => setIsAddDialogOpen(true)}
          className="gap-2 self-start bg-[#FF4500] font-semibold text-white shadow-xs hover:bg-[#FF4500]/90 sm:self-auto"
        >
          <Plus className="size-4" />
          Add Question
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="border-border shadow-2xs">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-orange-500/20 bg-orange-500/10 text-[#FF4500]">
              <HelpCircle className="size-5" />
            </div>
            <div>
              <p className="text-foreground/70 dark:text-muted-foreground text-xs font-medium">
                Total Questions
              </p>
              <p className="text-foreground text-2xl font-bold">{totalQuestions}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-2xs">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="size-5" />
            </div>
            <div>
              <p className="text-foreground/70 dark:text-muted-foreground text-xs font-medium">
                Active on Form
              </p>
              <p className="text-foreground text-2xl font-bold">{activeQuestions}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-2xs">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-700 dark:text-blue-400">
              <Users className="size-5" />
            </div>
            <div>
              <p className="text-foreground/70 dark:text-muted-foreground text-xs font-medium">
                Total Submissions
              </p>
              <p className="text-foreground text-2xl font-bold">{totalSubmissions}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(val) => setActiveTab(val as 'questions' | 'submissions')}
        className="w-full space-y-4"
      >
        <TabsList className="grid w-full grid-cols-2 sm:w-[340px]">
          <TabsTrigger value="questions" className="gap-2 text-xs">
            <HelpCircle className="size-3.5" />
            Questions
          </TabsTrigger>
          <TabsTrigger value="submissions" className="gap-2 text-xs">
            <MessageSquareHeart className="size-3.5" />
            Submissions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="questions" className="space-y-4">
          <AdminFeedbackQuestionList />
        </TabsContent>

        <TabsContent value="submissions" className="space-y-4">
          <AdminFeedbackSubmissionsTable />
        </TabsContent>
      </Tabs>

      <FeedbackQuestionDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />
    </div>
  );
}
