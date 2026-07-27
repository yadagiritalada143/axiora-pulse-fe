import { Download, Loader2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { toast } from 'sonner';

import type { OrchestrationRunResponse } from '@/types/orchestration.types';
import { Badge } from '@components/ui/badge';
import { Button } from '@components/ui/button';
import { useExportWorkspaceReport } from '@features/workspace/hooks/useWorkspaceMentor';
import { cn } from '@lib/utils';

interface IdeaValidationReportProps {
  workspaceId: number;
  ideaTitle: string;
  response: OrchestrationRunResponse;
  onRetake: () => void;
}

const VERDICT_STYLES: Record<string, string> = {
  build: 'bg-emerald-500/10 text-emerald-600',
  iterate: 'bg-amber-500/10 text-amber-600',
  kill: 'bg-destructive/10 text-destructive',
};

export function IdeaValidationReport({
  workspaceId,
  ideaTitle,
  response,
  onRetake,
}: IdeaValidationReportProps) {
  const { result } = response;
  const agentResult = result ? Object.values(result.agent_results)[0] : undefined;
  const verdictStyle = result
    ? (VERDICT_STYLES[result.verdict.toLowerCase()] ?? 'bg-primary/10 text-primary')
    : '';

  const exportReport = useExportWorkspaceReport(workspaceId);

  function handleExport() {
    exportReport.mutate(
      { agent_name: 'full', format: 'pdf' },
      {
        onError: () => toast.error('Failed to export the report. Please try again.'),
      },
    );
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-foreground text-lg font-semibold sm:text-xl">Idea Validation Report</h1>
        <Button
          className="gap-2 text-white"
          onClick={handleExport}
          disabled={exportReport.isPending}
        >
          {exportReport.isPending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            <Download className="size-4" aria-hidden />
          )}
          Export
        </Button>
      </div>

      {result ? (
        <>
          <div className="border-border flex flex-col gap-4 rounded-lg border p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-muted-foreground text-xs font-medium">Validation Score</p>
              <p className="text-foreground text-3xl font-semibold">
                {result.validation_score}
                <span className="text-muted-foreground text-base font-normal">/100</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge
                className={cn('rounded-md px-3 py-1 text-sm font-semibold uppercase', verdictStyle)}
              >
                {result.verdict}
              </Badge>
              <span className="text-muted-foreground text-xs">
                Confidence {Math.round(result.confidence_rating * 100)}%
              </span>
            </div>
          </div>

          <ReportSection title="Startup Idea Overview">
            <p className="text-foreground text-sm font-semibold">Idea Summary:</p>
            <p className="text-muted-foreground text-sm leading-relaxed">{ideaTitle}</p>

            {agentResult ? (
              <>
                <p className="text-foreground pt-2 text-sm font-semibold">Problem Statement</p>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {agentResult.data.problem_summary}
                </p>

                <p className="text-foreground pt-2 text-sm font-semibold">Customer Hypothesis</p>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {agentResult.data.customer_hypothesis}
                </p>
              </>
            ) : null}
          </ReportSection>

          <div className="grid gap-4 sm:grid-cols-2">
            <ListSection title="Strengths" items={result.strengths} />
            <ListSection title="Risks" items={result.risks} />
            <ListSection title="Key Assumptions" items={result.assumptions} />
            <ListSection title="Recommendations" items={result.recommendations} />
          </div>

          <ReportSection title="Mentor Summary">
            <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
              {result.mentor_summary}
            </p>
          </ReportSection>

          <p className="text-muted-foreground text-xs">{result.disclaimer}</p>
        </>
      ) : (
        <div className="border-border rounded-lg border p-5">
          <p className="text-foreground text-sm font-medium">Validation failed</p>
          <p className="text-muted-foreground mt-1 text-sm">
            {response.error ?? 'The AI Mentor could not complete this run. Please try again.'}
          </p>
        </div>
      )}

      <div className="border-border flex flex-col gap-3 rounded-lg border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-foreground truncate text-sm font-medium">Idea- {ideaTitle}</p>
        <Button variant="outline" onClick={onRetake} className="shrink-0">
          Retake
        </Button>
      </div>
    </div>
  );
}

function ReportSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="border-border rounded-lg border p-5">
      <p className="text-foreground mb-3 text-sm font-semibold">{title}</p>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function ListSection({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="border-border rounded-lg border p-5">
      <p className="text-foreground mb-3 text-sm font-semibold">{title}</p>
      <ul className="text-muted-foreground list-disc space-y-1.5 pl-4 text-sm leading-relaxed">
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
