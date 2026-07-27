import { ArrowLeft, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import type { OrchestrationRunResponse } from '@/types/orchestration.types';
import { ROUTES } from '@constants/routes';
import {
  IdeaInputForm,
  IdeaValidationReport,
  MentorShell,
} from '@features/ideaValidation/components';
import { useWorkspace } from '@features/workspace/hooks/useWorkspaces';

export default function WorkspaceDetailPage() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const numericId = Number(workspaceId);
  const { data: workspace, isLoading, isError } = useWorkspace(numericId);

  const [submittedTitle, setSubmittedTitle] = useState('');
  const [validation, setValidation] = useState<OrchestrationRunResponse | null>(null);

  return (
    <MentorShell>
      {isLoading ? (
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="text-muted-foreground size-6 animate-spin" aria-hidden />
        </div>
      ) : isError || !workspace ? (
        <div className="mx-auto flex max-w-md flex-col items-center gap-3 py-16 text-center">
          <h1 className="text-foreground text-lg font-semibold">Workspace not found</h1>
          <p className="text-muted-foreground text-sm">
            This workspace doesn&apos;t exist or you don&apos;t have access to it.
          </p>
          <Link to={ROUTES.WORKSPACE} className="text-primary text-sm font-medium hover:underline">
            Back to workspaces
          </Link>
        </div>
      ) : (
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
          <div className="border-border flex flex-col gap-3 border-b pb-3">
            <Link
              to={ROUTES.WORKSPACE}
              className="text-muted-foreground hover:text-foreground flex w-fit items-center gap-1.5 text-xs font-medium transition-colors"
            >
              <ArrowLeft className="size-3.5" aria-hidden />
              Workspaces
            </Link>

            <div>
              <h1 className="text-foreground text-xl font-semibold tracking-tight sm:text-2xl">
                {workspace.name}
              </h1>
              {workspace.description ? (
                <p className="text-muted-foreground mt-1 text-sm">{workspace.description}</p>
              ) : null}
            </div>

            <div className="flex items-center gap-6 text-sm">
              <span className="text-primary border-primary -mb-px border-b-2 pb-2 font-medium">
                AI Mentor
              </span>
            </div>
          </div>

          {validation ? (
            <IdeaValidationReport
              ideaTitle={submittedTitle}
              response={validation}
              onRetake={() => setValidation(null)}
            />
          ) : (
            <IdeaInputForm
              workspaceId={String(workspace.id)}
              onValidated={(response, title) => {
                setSubmittedTitle(title);
                setValidation(response);
              }}
            />
          )}
        </div>
      )}
    </MentorShell>
  );
}
