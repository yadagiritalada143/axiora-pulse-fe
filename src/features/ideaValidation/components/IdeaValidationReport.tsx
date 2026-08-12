import { Download, Loader2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import type { OrchestrationRunResponse } from '@/types/orchestration.types';
import { Badge } from '@components/ui/badge';
import { Button } from '@components/ui/button';
import { useExportWorkspaceReport } from '@features/workspace/hooks/useWorkspaceMentor';
import type { WorkspaceReportAgent } from '@features/workspace/types';
import { cn } from '@lib/utils';

interface IdeaValidationReportProps {
  workspaceId: number;
  ideaTitle: string;
  response: OrchestrationRunResponse;
  onRetake?: () => void;
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
  const verdictStyle = result
    ? (VERDICT_STYLES[result.verdict.toLowerCase()] ?? 'bg-primary/10 text-primary')
    : '';

  const ideaValidation = result?.agent_results.idea_validation_agent?.data;
  const marketResearch = result?.agent_results.market_research_agent?.data;
  const surveyIntelligence = result?.agent_results.survey_intelligence_agent?.data;

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <h1 className="text-foreground text-lg font-semibold sm:text-xl">Idea Validation Report</h1>

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

          {ideaValidation ? (
            <AgentReportCard
              workspaceId={workspaceId}
              agentName="idea_validation_agent"
              title="Idea Validation"
            >
              <p className="text-foreground text-sm font-semibold">Problem Statement</p>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {ideaValidation.problem_statement_summary}
              </p>

              {ideaValidation.falsifiable_problem_sentence ? (
                <>
                  <p className="text-foreground pt-2 text-sm font-semibold">
                    Falsifiable Statement
                  </p>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {ideaValidation.falsifiable_problem_sentence}
                  </p>
                </>
              ) : null}

              <p className="text-foreground pt-2 text-sm font-semibold">Who & How Often</p>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {ideaValidation.who_and_frequency}
              </p>

              <SubList title="Current Workarounds" items={ideaValidation.current_workarounds} />
              <SubList title="Key Falsifiable Assumptions" items={ideaValidation.assumption_list} />
              <SubList title="Red Flags" items={ideaValidation.red_flags} />
            </AgentReportCard>
          ) : null}

          {marketResearch ? (
            <AgentReportCard
              workspaceId={workspaceId}
              agentName="market_research_agent"
              title="Market Research"
            >
              <p className="text-foreground text-sm font-semibold">Market Opportunity</p>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {marketResearch.market_opportunity_summary}
              </p>

              <p className="text-foreground pt-2 text-sm font-semibold">
                Primary Ideal Customer Profile
              </p>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {marketResearch.primary_icp_summary}
              </p>

              {marketResearch.persona_summary ? (
                <>
                  <p className="text-foreground pt-2 text-sm font-semibold">Buyer Persona</p>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {marketResearch.persona_summary}
                  </p>
                </>
              ) : null}

              <SubList
                title="Target Customer Segments"
                items={marketResearch.target_customer_segments}
              />
              <SubList title="Competitor Overview" items={marketResearch.competitor_overview} />
              <SubList title="Opportunity Signals" items={marketResearch.opportunity_signals} />
              <SubList title="Market Risk Signals" items={marketResearch.risk_signals} />
            </AgentReportCard>
          ) : null}

          {surveyIntelligence ? (
            <AgentReportCard
              workspaceId={workspaceId}
              agentName="survey_intelligence_agent"
              title="Survey Intelligence"
            >
              <p className="text-foreground text-sm font-semibold">
                {surveyIntelligence.survey_title}
              </p>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {surveyIntelligence.survey_objective}
              </p>

              {surveyIntelligence.target_audience_summary ? (
                <>
                  <p className="text-foreground pt-2 text-sm font-semibold">Target Audience</p>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {surveyIntelligence.target_audience_summary}
                  </p>
                </>
              ) : null}

              {Array.isArray(surveyIntelligence.questions) &&
              surveyIntelligence.questions.length > 0 ? (
                <div className="pt-2">
                  <p className="text-foreground mb-1 text-sm font-semibold">Survey Questions</p>
                  <ul className="text-muted-foreground list-disc space-y-1.5 pl-4 text-sm leading-relaxed">
                    {surveyIntelligence.questions.map((question, index) => (
                      <li key={index}>
                        {question.question_text}
                        <span className="text-muted-foreground/70">
                          {' '}
                          ({question.question_type})
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 flex justify-end">
                    <Button
                      asChild
                      size="sm"
                      className="gap-1.5 bg-[#FF4500] font-semibold text-white hover:bg-[#FF4500]/90"
                    >
                      <Link to={`/workspace/${workspaceId}/survey`}>Edit & Share Survey</Link>
                    </Button>
                  </div>
                </div>
              ) : null}
            </AgentReportCard>
          ) : null}
        </>
      ) : (
        <div className="border-border rounded-lg border p-5">
          <p className="text-foreground text-sm font-medium">Validation failed</p>
          <p className="text-muted-foreground mt-1 text-sm">
            {response.error ?? 'The AI Mentor could not complete this run. Please try again.'}
          </p>
        </div>
      )}

      {onRetake && (
        <div className="border-border flex flex-col gap-3 rounded-lg border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-foreground truncate text-sm font-medium">Idea- {ideaTitle}</p>
          <Button variant="outline" onClick={onRetake} className="shrink-0">
            Retake
          </Button>
        </div>
      )}
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

// Agent output is LLM-generated JSON with no strict schema enforcement on the backend
// (see OutputValidator in the API repo) - a field documented and typed as "array of
// strings" can still arrive as null, a non-array value, or an array of objects (the
// model doesn't always follow the prompt's "return a plain string" instruction), so
// every list item is coerced to a readable string before it's ever handed to React.
function toDisplayString(value: unknown): string {
  if (typeof value === 'string') return value;
  if (value === null || value === undefined) return '';
  if (typeof value === 'object') {
    return Object.values(value as Record<string, unknown>)
      .filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0)
      .join(' — ');
  }
  // Only number/boolean/bigint/symbol/function reach here - object was handled above.
  // eslint-disable-next-line @typescript-eslint/no-base-to-string
  return String(value);
}

function ListSection({ title, items }: { title: string; items: unknown[] | null | undefined }) {
  const list = Array.isArray(items) ? items : [];

  return (
    <div className="border-border rounded-lg border p-5">
      <p className="text-foreground mb-3 text-sm font-semibold">{title}</p>
      <ul className="text-muted-foreground list-disc space-y-1.5 pl-4 text-sm leading-relaxed">
        {list.map((item, index) => (
          <li key={index}>{toDisplayString(item)}</li>
        ))}
      </ul>
    </div>
  );
}

function SubList({ title, items }: { title: string; items: unknown[] | null | undefined }) {
  const list = Array.isArray(items) ? items : [];
  if (list.length === 0) return null;

  return (
    <div className="pt-2">
      <p className="text-foreground mb-1 text-sm font-semibold">{title}</p>
      <ul className="text-muted-foreground list-disc space-y-1.5 pl-4 text-sm leading-relaxed">
        {list.map((item, index) => (
          <li key={index}>{toDisplayString(item)}</li>
        ))}
      </ul>
    </div>
  );
}

function AgentReportCard({
  workspaceId,
  agentName,
  title,
  children,
}: {
  workspaceId: number;
  agentName: WorkspaceReportAgent;
  title: string;
  children: ReactNode;
}) {
  const exportReport = useExportWorkspaceReport(workspaceId);

  function handleExport() {
    exportReport.mutate(
      { agent_name: agentName, format: 'pdf' },
      { onError: () => toast.error('Failed to export the report. Please try again.') },
    );
  }

  return (
    <div className="border-border rounded-lg border p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-foreground text-sm font-semibold">{title}</p>
        <div className="flex items-center gap-2">
          {agentName === 'survey_intelligence_agent' && (
            <Button
              size="sm"
              variant="outline"
              asChild
              className="border-[#FF4500] text-[#FF4500] hover:bg-[#FF4500]/10"
            >
              <Link to={`/workspace/${workspaceId}/survey`}>Manage Survey</Link>
            </Button>
          )}
          <Button
            size="sm"
            className="gap-2"
            onClick={handleExport}
            disabled={exportReport.isPending}
          >
            {exportReport.isPending ? (
              <Loader2 className="size-3.5 animate-spin" aria-hidden />
            ) : (
              <Download className="size-3.5" aria-hidden />
            )}
            Export
          </Button>
        </div>
      </div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}
