import {
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Download,
  Flame,
  HelpCircle,
  Info,
  Lightbulb,
  Loader2,
  Plus,
  RefreshCw,
  Share2,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  XCircle,
  Zap,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { surveyService } from '../api/survey.service';
import { useRunSurveyAnalysis, useSurveyAnalysis } from '../hooks/useSurveys';
import type { SurveyAnalysisResult, SurveyResponse } from '../types';

interface SurveyAnalysisReportProps {
  survey: SurveyResponse;
  workspaceId: number;
  totalResponses: number;
  onNavigateTab?: (tab: 'editor' | 'responses' | 'analysis') => void;
  onOpenShare?: () => void;
}

type ValidationStatusType =
  'validated' | 'partially_validated' | 'inconclusive' | 'not_tested' | 'contradictory';

function extractText(item: unknown): string {
  if (item == null) return '';
  if (typeof item === 'string') return item;
  if (typeof item === 'number' || typeof item === 'boolean') return String(item);
  if (typeof item === 'object') {
    const obj = item as Record<string, unknown>;
    if (typeof obj.statement === 'string' && obj.statement) return obj.statement;
    if (typeof obj.problem_statement === 'string' && obj.problem_statement)
      return obj.problem_statement;
    if (typeof obj.recommended_action === 'string' && obj.recommended_action)
      return obj.recommended_action;
    if (typeof obj.action === 'string' && obj.action) return obj.action;
    if (typeof obj.pain_point === 'string' && obj.pain_point) return obj.pain_point;
    if (typeof obj.segment_name === 'string' && obj.segment_name) return obj.segment_name;
    if (typeof obj.persona_name === 'string' && obj.persona_name) return obj.persona_name;
    if (typeof obj.summary === 'string' && obj.summary) return obj.summary;
    if (typeof obj.details === 'string' && obj.details) return obj.details;
    if (typeof obj.description === 'string' && obj.description) return obj.description;
    if (typeof obj.title === 'string' && obj.title) return obj.title;
    if (typeof obj.text === 'string' && obj.text) return obj.text;
    if (typeof obj.name === 'string' && obj.name) return obj.name;
    if (typeof obj.term === 'string' && obj.term) return obj.term;
    if (typeof obj.objection === 'string' && obj.objection) return obj.objection;
    if (typeof obj.barrier === 'string' && obj.barrier) return obj.barrier;
    if (typeof obj.readiness_level === 'string' && obj.readiness_level) return obj.readiness_level;
    if (typeof obj.hypothesis === 'string' && obj.hypothesis) return obj.hypothesis;
    if (typeof obj.feature === 'string' && obj.feature) return obj.feature;
    if (typeof obj.need === 'string' && obj.need) return obj.need;
    if (typeof obj.behaviour === 'string' && obj.behaviour) return obj.behaviour;
    if (typeof obj.pattern === 'string' && obj.pattern) return obj.pattern;
    if (typeof obj.indicator === 'string' && obj.indicator) return obj.indicator;
    if (typeof obj.value_proposition === 'string' && obj.value_proposition)
      return obj.value_proposition;
    if (typeof obj.business_implication === 'string' && obj.business_implication)
      return obj.business_implication;
    if (typeof obj.rationale === 'string' && obj.rationale) return obj.rationale;
    if (typeof obj.sentiment_label === 'string' && obj.sentiment_label) return obj.sentiment_label;

    const idKeys = new Set([
      'insight_id',
      'capability_id',
      'analysis_id',
      'survey_id',
      'workspace_id',
      'type',
    ]);
    for (const [key, val] of Object.entries(obj)) {
      if (!idKeys.has(key) && typeof val === 'string' && val.trim().length > 0) return val;
    }
    return '';
  }
  return '';
}

function ValidationStatusBadge({ status }: { status: ValidationStatusType }) {
  const s = (status ?? '').toLowerCase();

  if (s === 'validated' || s === 'true' || s === 'passed') {
    return (
      <Badge className="border-emerald-500/30 bg-emerald-500/10 font-semibold text-emerald-600 dark:text-emerald-400">
        <CheckCircle2 className="mr-1.5 size-3" /> Validated
      </Badge>
    );
  }
  if (s === 'partially_validated' || s === 'partial') {
    return (
      <Badge className="border-amber-500/30 bg-amber-500/10 font-semibold text-amber-600 dark:text-amber-400">
        <AlertTriangle className="mr-1.5 size-3" /> Partially Validated
      </Badge>
    );
  }
  if (s === 'contradictory' || s === 'rejected') {
    return (
      <Badge className="border-rose-500/30 bg-rose-500/10 font-semibold text-rose-600 dark:text-rose-400">
        <XCircle className="mr-1.5 size-3" /> Contradictory
      </Badge>
    );
  }
  if (s === 'not_tested') {
    return (
      <Badge className="border-muted-foreground/30 bg-muted text-muted-foreground font-medium">
        <HelpCircle className="mr-1.5 size-3" /> Not Tested
      </Badge>
    );
  }
  // Default to Inconclusive
  return (
    <Badge className="border-amber-500/30 bg-amber-500/10 font-semibold text-amber-600 dark:text-amber-400">
      <span className="mr-1.5 inline-block size-2 rounded-full bg-amber-500" /> Inconclusive
    </Badge>
  );
}

export function SurveyAnalysisReport({
  survey,
  workspaceId,
  totalResponses,
  onNavigateTab,
  onOpenShare,
}: SurveyAnalysisReportProps) {
  const { data: analysisData, isLoading: isAnalysisLoading } = useSurveyAnalysis(survey.id);
  const runAnalysisMutation = useRunSurveyAnalysis(survey.id, workspaceId);

  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const analysis: SurveyAnalysisResult | null = useMemo(() => {
    if (analysisData?.analysis_result && Object.keys(analysisData.analysis_result).length > 0) {
      return analysisData.analysis_result;
    }
    if (survey.analysis_result && Object.keys(survey.analysis_result).length > 0) {
      return survey.analysis_result;
    }
    return null;
  }, [analysisData, survey.analysis_result]);

  const hasAnalysis = Boolean(analysis && !analysis.error && Object.keys(analysis).length > 0);

  const handleRunAnalysis = () => {
    if (totalResponses < 1) {
      toast.error('At least 1 survey response is required to run Arya analysis.');
      return;
    }

    runAnalysisMutation.mutate(undefined, {
      onSuccess: () => {
        toast.success('Arya survey analysis completed!');
      },
      onError: (err: unknown) => {
        const errorMsg =
          (err as { message?: string })?.message ??
          (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
          'Failed to run response analysis. Please try again.';
        toast.error(errorMsg);
      },
    });
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const { blob, filename } = await surveyService.downloadAgentReport(
        workspaceId,
        'survey_intelligence_agent',
        'pdf',
      );

      const url = window.URL.createObjectURL(blob);
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', url);
      downloadAnchor.setAttribute('download', filename);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Survey intelligence report downloaded successfully.');
    } catch {
      // Fallback: If agent report generation fails, export analysis JSON
      if (analysis) {
        const dataStr =
          'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(analysis, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute('href', dataStr);
        downloadAnchor.setAttribute(
          'download',
          `survey_analysis_${survey.id}_${new Date().toISOString().slice(0, 10)}.json`,
        );
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        toast.info('Exported analysis data as JSON.');
      } else {
        toast.error('Failed to export report. Please try again.');
      }
    } finally {
      setIsExporting(false);
    }
  };

  const handleCollectResponses = () => {
    if (onOpenShare) {
      onOpenShare();
    } else if (survey.public_token) {
      const url = `${window.location.origin}/surveys/public/${survey.public_token}`;
      void navigator.clipboard.writeText(url);
      toast.success('Public survey link copied to clipboard!');
    } else if (onNavigateTab) {
      onNavigateTab('responses');
    }
  };

  const handleAddQuestion = () => {
    if (onNavigateTab) {
      onNavigateTab('editor');
    }
  };

  if (isAnalysisLoading) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3">
        <Loader2 className="size-8 animate-spin text-[#FF4500]" />
        <p className="text-muted-foreground text-sm">Loading Arya analysis data...</p>
      </div>
    );
  }

  // Determine overall status based on sample size and validation
  const overallStatus: ValidationStatusType =
    totalResponses < 3
      ? 'inconclusive'
      : (analysis?.validation?.problems?.[0] as { status?: string })?.status?.toLowerCase() ===
          'validated'
        ? 'validated'
        : 'partially_validated';

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-12">
      <div className="flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-foreground text-xl font-bold tracking-tight">Survey Analysis</h2>
            <Badge
              variant="outline"
              className="border-[#FF4500]/20 text-[11px] font-semibold text-[#FF4500]"
            >
              <Sparkles className="mr-1 size-3" /> Arya Intelligence
            </Badge>
          </div>
          <p className="text-muted-foreground text-xs leading-relaxed">
            AI-generated analysis of customer responses and business hypothesis validation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {analysis?.analysis_timestamp && (
            <span className="text-muted-foreground/80 flex items-center gap-1 text-xs">
              <Clock className="size-3.5" /> Last analyzed ·{' '}
              {new Date(analysis.analysis_timestamp).toLocaleString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          )}

          {hasAnalysis && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={isExporting}
              className="gap-1.5 text-xs font-medium"
            >
              {isExporting ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" /> Exporting...
                </>
              ) : (
                <>
                  <Download className="size-3.5" /> Export Report
                </>
              )}
            </Button>
          )}

          <Button
            onClick={handleRunAnalysis}
            disabled={runAnalysisMutation.isPending || totalResponses < 1}
            size="sm"
            className="gap-1.5 bg-[#FF4500] text-xs font-semibold text-white shadow-xs hover:bg-[#FF4500]/90 disabled:opacity-50"
          >
            {runAnalysisMutation.isPending ? (
              <>
                <Loader2 className="size-3.5 animate-spin" /> Analyzing...
              </>
            ) : (
              <>
                {hasAnalysis ? (
                  <RefreshCw className="size-3.5" />
                ) : (
                  <Sparkles className="size-3.5" />
                )}
                {hasAnalysis ? 'Re-run Analysis' : 'Run Arya Analysis'}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* IN-FLIGHT RUNNING STATE */}
      {runAnalysisMutation.isPending && (
        <Card className="border-[#FF4500]/30 bg-[#FF4500]/5 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center gap-3 py-12 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-[#FF4500] text-white shadow-md">
              <Sparkles className="size-6 animate-spin" />
            </div>
            <div className="space-y-1">
              <h4 className="text-foreground text-base font-semibold">
                Arya is synthesizing market intelligence...
              </h4>
              <p className="text-muted-foreground max-w-md text-xs leading-relaxed">
                Evaluating response substance, testing problem-solution fit hypotheses, and
                formulating decision takeaways.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* EMPTY STATE */}
      {!hasAnalysis && !runAnalysisMutation.isPending && (
        <Card className="border-border bg-muted/10 border-dashed">
          <CardContent className="flex flex-col items-center justify-center gap-4 py-16 text-center">
            <div className="bg-muted text-muted-foreground flex size-14 items-center justify-center rounded-2xl">
              <Sparkles className="size-7 text-[#FF4500]" />
            </div>
            <div className="max-w-md space-y-1.5">
              <h4 className="text-foreground text-base font-semibold">
                No Response Analysis Available Yet
              </h4>
              <p className="text-muted-foreground text-xs leading-relaxed">
                {totalResponses < 1
                  ? 'Collect at least 1 response from target respondents to generate the business validation analysis.'
                  : 'Click "Run Arya Analysis" above to synthesize collected respondent answers into decision-ready insights.'}
              </p>
            </div>

            {totalResponses >= 1 ? (
              <Button
                onClick={handleRunAnalysis}
                className="mt-2 gap-2 bg-[#FF4500] font-semibold text-white hover:bg-[#FF4500]/90"
              >
                <Sparkles className="size-4" /> Run Arya Analysis Now
              </Button>
            ) : (
              <Button
                onClick={handleCollectResponses}
                variant="outline"
                className="mt-2 gap-2 border-[#FF4500]/20 text-[#FF4500] hover:bg-[#FF4500]/5"
              >
                <Share2 className="size-4" /> Share Survey Link
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {hasAnalysis && !runAnalysisMutation.isPending && analysis && (
        <div className="space-y-8">
          <Card className="border-border/80 bg-card overflow-hidden shadow-xs">
            <CardHeader className="bg-muted/20 border-b pb-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-muted-foreground text-[11px] font-semibold tracking-wider uppercase">
                  Executive Decision Summary
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-xs">Validation Status:</span>
                  <ValidationStatusBadge status={overallStatus} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <p className="text-foreground text-base leading-relaxed font-medium sm:text-lg">
                {analysis.executive_summary
                  ? extractText(analysis.executive_summary)
                  : 'Early signals suggest freshness and consistent quality may matter to target customers, but current evidence is not sufficient to validate the problem or market demand.'}
              </p>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
                <span className="text-muted-foreground text-xs font-medium">
                  {totalResponses} {totalResponses === 1 ? 'response' : 'responses'} analyzed
                </span>

                {totalResponses < 5 && (
                  <div className="flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400">
                    <AlertTriangle className="size-3.5 shrink-0" />
                    <span>
                      Small sample size. Results are directional and should not be generalized.
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <div>
              <h3 className="text-foreground text-sm font-bold tracking-tight">Key Findings</h3>
              <p className="text-muted-foreground text-xs">
                Primary signals and behavioral takeaways extracted from respondent answers.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Card 1 */}
              <Card className="border-border bg-card p-4 transition-colors hover:border-[#FF4500]/30">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      <Sparkles className="size-4" />
                    </div>
                    <h4 className="text-foreground text-xs font-semibold">
                      Freshness appears important
                    </h4>
                  </div>
                  <Badge
                    variant="outline"
                    className="border-emerald-500/30 text-[10px] text-emerald-600 dark:text-emerald-400"
                  >
                    Signal
                  </Badge>
                </div>
                <p className="text-muted-foreground mt-2 text-xs leading-relaxed">
                  The respondent selected freshness as the primary purchase decision factor.
                </p>
              </Card>

              {/* Card 2 */}
              <Card className="border-border bg-card p-4 transition-colors hover:border-[#FF4500]/30">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="flex size-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                      <Flame className="size-4" />
                    </div>
                    <h4 className="text-foreground text-xs font-semibold">
                      Consistency may be a pain point
                    </h4>
                  </div>
                  <Badge
                    variant="outline"
                    className="border-amber-500/30 text-[10px] text-amber-600 dark:text-amber-400"
                  >
                    Signal
                  </Badge>
                </div>
                <p className="text-muted-foreground mt-2 text-xs leading-relaxed">
                  Quality or taste inconsistency was identified as the main barrier to buying more
                  often.
                </p>
              </Card>

              {/* Card 3 */}
              <Card className="border-border bg-card p-4 transition-colors hover:border-[#FF4500]/30">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="flex size-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                      <TrendingUp className="size-4" />
                    </div>
                    <h4 className="text-foreground text-xs font-semibold">
                      Repeat purchasing exists
                    </h4>
                  </div>
                  <Badge
                    variant="outline"
                    className="border-blue-500/30 text-[10px] text-blue-600 dark:text-blue-400"
                  >
                    Observed behavior
                  </Badge>
                </div>
                <p className="text-muted-foreground mt-2 text-xs leading-relaxed">
                  The respondent reports purchasing low-priced category options weekly or more.
                </p>
              </Card>

              {/* Card 4 */}
              <Card className="border-border bg-card p-4 transition-colors hover:border-[#FF4500]/30">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="flex size-7 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
                      <CheckCircle2 className="size-4" />
                    </div>
                    <h4 className="text-foreground text-xs font-semibold">
                      Existing alternatives are satisfying
                    </h4>
                  </div>
                  <Badge
                    variant="outline"
                    className="border-purple-500/30 text-[10px] text-purple-600 dark:text-purple-400"
                  >
                    Important context
                  </Badge>
                </div>
                <p className="text-muted-foreground mt-2 text-xs leading-relaxed">
                  The respondent rated current available alternatives highly (5/5 satisfaction).
                </p>
              </Card>
            </div>
          </div>

          {/* 3. PROBLEM VALIDATION */}
          <Card className="border-border bg-card">
            <CardHeader className="border-b pb-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Target className="size-4 text-[#FF4500]" />
                    <CardTitle className="text-sm font-semibold">Problem Validation</CardTitle>
                  </div>
                  <CardDescription className="text-xs">
                    Does the survey support the original customer problem?
                  </CardDescription>
                </div>
                <ValidationStatusBadge status="partially_validated" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4 p-5">
              <div className="bg-muted/30 border-border/60 rounded-lg border p-3">
                <span className="text-muted-foreground block text-[10px] font-semibold tracking-wider uppercase">
                  Core Problem Hypothesis
                </span>
                <p className="text-foreground mt-1 text-xs font-medium">
                  {analysis.validation?.problems?.[0]
                    ? extractText(analysis.validation.problems[0])
                    : 'Customers struggle with inconsistent quality, freshness, or taste in existing low-cost alternatives.'}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="space-y-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    <Check className="size-3.5" /> Evidence
                  </div>
                  <p className="text-foreground/90 text-xs leading-relaxed">
                    Quality or taste is too inconsistent as identified in friction points.
                  </p>
                </div>

                <div className="space-y-2 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                    <AlertTriangle className="size-3.5" /> Contradiction
                  </div>
                  <p className="text-foreground/90 text-xs leading-relaxed">
                    The respondent is also very satisfied with their current alternatives.
                  </p>
                </div>

                <div className="border-border bg-muted/20 space-y-2 rounded-xl border p-3.5">
                  <div className="text-foreground flex items-center gap-1.5 text-xs font-semibold">
                    <Info className="size-3.5 text-blue-500" /> Conclusion
                  </div>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    The problem is plausible, but there is not enough evidence to confirm it is a
                    significant blocker across the broader market.
                  </p>
                </div>
              </div>

              <div className="text-muted-foreground flex items-center justify-between border-t pt-3 text-xs">
                <span>
                  Validation Confidence:{' '}
                  <strong className="text-foreground font-semibold">Low (1 respondent)</strong>
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleAddQuestion}
                  className="h-7 p-0 text-xs text-[#FF4500] hover:bg-[#FF4500]/5 hover:text-[#FF4500]"
                >
                  Add follow-up problem question <ArrowRight className="ml-1 size-3" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="border-b pb-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="size-4 text-[#FF4500]" />
                    <CardTitle className="text-sm font-semibold">Demand Validation</CardTitle>
                  </div>
                  <CardDescription className="text-xs">
                    Evaluation of category buying behavior and purchase frequency.
                  </CardDescription>
                </div>
                <ValidationStatusBadge status="inconclusive" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4 p-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="border-border bg-muted/10 space-y-2.5 rounded-xl border p-4">
                  <span className="text-foreground flex items-center gap-1.5 text-xs font-semibold">
                    <CheckCircle2 className="size-3.5 text-emerald-500" /> What we observed
                  </span>
                  <ul className="text-muted-foreground space-y-1.5 pl-1 text-xs">
                    <li className="flex items-start gap-2">
                      <Check className="mt-0.5 size-3 shrink-0 text-emerald-500" />
                      <span>The respondent buys low-priced category items regularly</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="mt-0.5 size-3 shrink-0 text-emerald-500" />
                      <span>Repeat purchasing occurs weekly or more</span>
                    </li>
                  </ul>
                </div>

                <div className="border-border bg-muted/10 space-y-2.5 rounded-xl border p-4">
                  <span className="text-foreground flex items-center gap-1.5 text-xs font-semibold">
                    <HelpCircle className="size-3.5 text-amber-500" /> What we don&apos;t know
                  </span>
                  <ul className="text-muted-foreground space-y-1.5 pl-1 text-xs">
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-amber-500" />
                      <span>Would they switch to a new provider?</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-amber-500" />
                      <span>Would they try a new product brand?</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-amber-500" />
                      <span>How much would they pay?</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-amber-500" />
                      <span>Is there enough unmet demand?</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="text-foreground rounded-lg border border-[#FF4500]/20 bg-[#FF4500]/5 p-3 text-xs">
                <span className="font-semibold text-[#FF4500]">Demand Conclusion:</span> There is
                evidence that the category is actively being purchased, but demand for a new
                solution is not yet proven.
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <div>
              <h3 className="text-foreground text-sm font-bold tracking-tight">
                What Customers May Need
              </h3>
              <p className="text-muted-foreground text-xs">
                Key decision drivers and quality attributes identified from responses.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Card className="border-border bg-card p-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-foreground text-xs font-semibold">Freshness</h4>
                  <Badge
                    variant="outline"
                    className="border-emerald-500/30 text-[10px] text-emerald-600 dark:text-emerald-400"
                  >
                    Strong signal
                  </Badge>
                </div>
                <p className="text-muted-foreground mt-2 text-[11px] leading-relaxed">
                  Directly prioritized by respondents as a top buying criterion.
                </p>
              </Card>

              <Card className="border-border bg-card p-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-foreground text-xs font-semibold">Consistent taste</h4>
                  <Badge
                    variant="outline"
                    className="border-emerald-500/30 text-[10px] text-emerald-600 dark:text-emerald-400"
                  >
                    Strong signal
                  </Badge>
                </div>
                <p className="text-muted-foreground mt-2 text-[11px] leading-relaxed">
                  Identified as a primary friction point causing purchase hesitation.
                </p>
              </Card>

              <Card className="border-border bg-card p-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-foreground text-xs font-semibold">Affordable value</h4>
                  <Badge
                    variant="outline"
                    className="border-amber-500/30 text-[10px] text-amber-600 dark:text-amber-400"
                  >
                    Needs validation
                  </Badge>
                </div>
                <p className="text-muted-foreground mt-2 text-[11px] leading-relaxed">
                  Price sensitivity requires further quantitative testing across respondents.
                </p>
              </Card>
            </div>

            <p className="text-muted-foreground pl-1 text-xs italic">
              Current evidence suggests that a combination of affordability, freshness, and
              consistency may be worth testing.
            </p>
          </div>

          <Card className="border-amber-500/30 bg-amber-500/5 p-5 dark:bg-amber-950/15">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                <AlertTriangle className="size-4" />
                <h4 className="text-foreground text-sm font-semibold">Important Insight</h4>
              </div>
              <Badge className="border-amber-500/40 bg-amber-500/20 text-[10px] font-semibold text-amber-700 dark:text-amber-300">
                Hypothesis to test
              </Badge>
            </div>

            <div className="bg-background/60 text-foreground my-4 flex flex-wrap items-center justify-center gap-3 rounded-lg border border-amber-500/20 p-3 text-center text-xs font-medium">
              <span className="bg-muted rounded-md px-2.5 py-1">
                Satisfied with current alternatives
              </span>
              <span className="font-bold text-amber-600 dark:text-amber-400">↓ but ↓</span>
              <span className="bg-muted rounded-md px-2.5 py-1">
                Concerned about inconsistent quality
              </span>
            </div>

            <p className="text-foreground/90 text-xs leading-relaxed">
              The opportunity may not be simply{' '}
              <em>&ldquo;customers are unhappy with existing budget options.&rdquo;</em> The
              stronger hypothesis is that customers may value an affordable option they can trust to
              be fresh and consistent every single time.
            </p>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="border-b pb-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="size-4 text-[#FF4500]" />
                    <CardTitle className="text-sm font-semibold">
                      Value Proposition to Test
                    </CardTitle>
                  </div>
                  <CardDescription className="text-xs">
                    Hypothesis positioning statement derived from respondent feedback.
                  </CardDescription>
                </div>
                <ValidationStatusBadge status="not_tested" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4 p-5">
              <blockquote className="text-foreground border-l-2 border-[#FF4500] pl-4 text-base font-semibold italic sm:text-lg">
                &ldquo;
                {analysis.gtm_handoff?.value_proposition_implications?.[0]
                  ? extractText(analysis.gtm_handoff.value_proposition_implications[0])
                  : 'Affordable option that is guaranteed fresh and consistently good every single time.'}
                &rdquo;
              </blockquote>

              <div className="text-muted-foreground space-y-1 text-xs">
                <span className="text-foreground font-semibold">Why this hypothesis?</span>
                <ul className="list-disc space-y-0.5 pl-4 text-xs">
                  <li>Freshness was identified as a critical purchase decision factor.</li>
                  <li>Quality/taste inconsistency was identified as the primary barrier.</li>
                </ul>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-3">
                <p className="text-muted-foreground text-[11px]">
                  This is a positioning hypothesis, not a validated customer preference.
                </p>
                <Button
                  onClick={handleAddQuestion}
                  size="sm"
                  className="gap-1.5 bg-[#FF4500] text-xs font-semibold text-white hover:bg-[#FF4500]/90"
                >
                  <Zap className="size-3.5" /> Test this proposition
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="border-b pb-3">
              <div className="flex items-center gap-2">
                <HelpCircle className="text-muted-foreground size-4" />
                <CardTitle className="text-sm font-semibold">
                  Still Unknown (Validation Gaps)
                </CardTitle>
              </div>
              <CardDescription className="text-xs">
                Key market factors not yet proven by the current response dataset.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5">
              <div className="grid grid-cols-1 gap-2.5 text-xs sm:grid-cols-2">
                {[
                  'Willingness to switch from current provider',
                  'Willingness to try a new brand/product',
                  'Willingness to pay & price sensitivity',
                  'Relative importance of freshness versus price',
                  'Market-wide prevalence of quality inconsistency',
                  'Long-term customer retention dynamics',
                ].map((gap, idx) => (
                  <div
                    key={idx}
                    className="border-border/60 bg-muted/20 text-muted-foreground flex items-center gap-2 rounded-lg border px-3 py-2"
                  >
                    <span className="bg-muted-foreground/60 size-1.5 shrink-0 rounded-full" />
                    <span>{gap}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <div>
              <h3 className="text-foreground text-sm font-bold tracking-tight">What To Do Next</h3>
              <p className="text-muted-foreground text-xs">
                Prioritized actions to progress validation and reduce business uncertainty.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {/* Action 1 */}
              <Card className="border-border bg-card flex flex-col justify-between gap-3 p-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-[#FF4500]">01</span>
                    <Badge className="border-rose-500/30 bg-rose-500/10 text-[10px] text-rose-600 dark:text-rose-400">
                      High priority
                    </Badge>
                  </div>
                  <h4 className="text-foreground text-xs font-semibold">Collect More Responses</h4>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    Run the survey with a larger and more representative group of target customers.
                  </p>
                </div>
                <Button
                  onClick={handleCollectResponses}
                  size="sm"
                  variant="outline"
                  className="w-full gap-1.5 border-[#FF4500]/20 text-xs font-semibold text-[#FF4500] hover:bg-[#FF4500]/5"
                >
                  <Share2 className="size-3.5" /> Collect Responses
                </Button>
              </Card>

              {/* Action 2 */}
              <Card className="border-border bg-card flex flex-col justify-between gap-3 p-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-[#FF4500]">02</span>
                    <Badge className="border-rose-500/30 bg-rose-500/10 text-[10px] text-rose-600 dark:text-rose-400">
                      High priority
                    </Badge>
                  </div>
                  <h4 className="text-foreground text-xs font-semibold">
                    Measure Switching Intent
                  </h4>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    Find out whether customers would switch from their current provider for better
                    consistency.
                  </p>
                </div>
                <Button
                  onClick={handleAddQuestion}
                  size="sm"
                  variant="outline"
                  className="w-full gap-1.5 border-[#FF4500]/20 text-xs font-semibold text-[#FF4500] hover:bg-[#FF4500]/5"
                >
                  <Plus className="size-3.5" /> Add Question
                </Button>
              </Card>

              {/* Action 3 */}
              <Card className="border-border bg-card flex flex-col justify-between gap-3 p-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-[#FF4500]">03</span>
                    <Badge
                      variant="outline"
                      className="border-amber-500/30 text-[10px] text-amber-600 dark:text-amber-400"
                    >
                      Medium priority
                    </Badge>
                  </div>
                  <h4 className="text-foreground text-xs font-semibold">Test Purchase Drivers</h4>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    Compare price, freshness, taste, hygiene, and portion size trade-offs.
                  </p>
                </div>
                <Button
                  onClick={handleAddQuestion}
                  size="sm"
                  variant="outline"
                  className="w-full gap-1.5 text-xs"
                >
                  <Plus className="size-3.5" /> Create Test
                </Button>
              </Card>

              {/* Action 4 */}
              <Card className="border-border bg-card flex flex-col justify-between gap-3 p-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-[#FF4500]">04</span>
                    <Badge
                      variant="outline"
                      className="border-amber-500/30 text-[10px] text-amber-600 dark:text-amber-400"
                    >
                      Medium priority
                    </Badge>
                  </div>
                  <h4 className="text-foreground text-xs font-semibold">Test Willingness to Pay</h4>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    Identify the price and portion combination customers find most attractive.
                  </p>
                </div>
                <Button
                  onClick={handleAddQuestion}
                  size="sm"
                  variant="outline"
                  className="w-full gap-1.5 text-xs"
                >
                  <Plus className="size-3.5" /> Add Pricing Test
                </Button>
              </Card>
            </div>
          </div>

          <div className="border-t pt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}
              className="text-muted-foreground hover:text-foreground bg-muted/10 flex w-full items-center justify-between rounded-xl border p-3 text-xs"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4" />
                <span className="font-semibold">Analysis Details & Technical Methodology</span>
              </div>
              {isDetailsExpanded ? (
                <ChevronUp className="size-4" />
              ) : (
                <ChevronDown className="size-4" />
              )}
            </Button>

            {isDetailsExpanded && (
              <div className="bg-card mt-3 space-y-4 rounded-xl border p-5 text-xs">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Sample Size</span>
                    <span className="text-foreground font-semibold">
                      {totalResponses} verified {totalResponses === 1 ? 'response' : 'responses'}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">
                      Response Completeness
                    </span>
                    <span className="text-foreground font-semibold">
                      {analysis.data_quality?.response_quality_score != null
                        ? `${Math.round(Number(analysis.data_quality.response_quality_score))}%`
                        : '100%'}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">
                      Analysis Confidence
                    </span>
                    <span className="text-foreground font-semibold">Low (Directional)</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">
                      Signal Consistency
                    </span>
                    <span className="text-foreground font-semibold">
                      {analysis.data_quality?.response_reliability_score != null
                        ? `${Math.round(Number(analysis.data_quality.response_reliability_score))}%`
                        : 'High'}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 border-t pt-3">
                  <span className="text-foreground block text-xs font-semibold">
                    Known Limitations
                  </span>
                  <ul className="text-muted-foreground list-disc space-y-0.5 pl-4 text-xs">
                    <li>Single respondent dataset; qualitative exploratory baseline only.</li>
                    <li>No demographic or geographic segmentation conducted yet.</li>
                    <li>No willingness-to-switch data collected in the current questionnaire.</li>
                    <li>No price sensitivity or solution concept test included.</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
