import {
  AlertCircle,
  AlertTriangle,
  Brain,
  CheckCircle2,
  Clock,
  Compass,
  FileCheck2,
  FileText,
  Flame,
  HelpCircle,
  Lightbulb,
  Loader2,
  MessageSquare,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  XCircle,
  Zap,
} from 'lucide-react';
import { useMemo } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

import { useRunSurveyAnalysis, useSurveyAnalysis } from '../hooks/useSurveys';
import type { SurveyAnalysisResult, SurveyResponse } from '../types';

interface SurveyAnalysisReportProps {
  survey: SurveyResponse;
  workspaceId: number;
  totalResponses: number;
}

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

function extractList(items: unknown): string[] {
  if (!items) return [];
  if (Array.isArray(items)) {
    return items.map(extractText).filter((t) => Boolean(t && t.trim().length > 0));
  }
  if (typeof items === 'string') {
    return [items];
  }
  if (typeof items === 'object') {
    const text = extractText(items);
    return text ? [text] : [];
  }
  return [];
}

export function SurveyAnalysisReport({
  survey,
  workspaceId,
  totalResponses,
}: SurveyAnalysisReportProps) {
  const { data: analysisData, isLoading: isAnalysisLoading } = useSurveyAnalysis(survey.id);
  const runAnalysisMutation = useRunSurveyAnalysis(survey.id, workspaceId);

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
      toast.error('At least 1 survey response is required to run AI analysis.');
      return;
    }

    runAnalysisMutation.mutate(undefined, {
      onSuccess: () => {
        toast.success('Survey response intelligence analysis completed!');
      },
      onError: (err: unknown) => {
        const errorMsg =
          (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
          'Failed to run response analysis. Please try again.';
        toast.error(errorMsg);
      },
    });
  };

  const getScoreColor = (score: number | null | undefined, isRisk = false) => {
    if (score === null || score === undefined) return 'text-muted-foreground';
    if (isRisk) {
      if (score < 30) return 'text-emerald-500';
      if (score < 60) return 'text-amber-500';
      return 'text-rose-500';
    }
    if (score >= 75) return 'text-emerald-500';
    if (score >= 50) return 'text-amber-500';
    return 'text-rose-500';
  };

  const getStatusBadge = (status?: string) => {
    const s = (status ?? '').toLowerCase();
    if (s === 'validated' || s === 'true' || s === 'passed') {
      return (
        <Badge className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="mr-1 size-3" /> Validated
        </Badge>
      );
    }
    if (s === 'partially_validated') {
      return (
        <Badge className="border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400">
          <AlertTriangle className="mr-1 size-3" /> Partial
        </Badge>
      );
    }
    if (s === 'rejected') {
      return (
        <Badge className="border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400">
          <XCircle className="mr-1 size-3" /> Rejected
        </Badge>
      );
    }
    return (
      <Badge className="border-muted-foreground/30 bg-muted text-muted-foreground">
        <HelpCircle className="mr-1 size-3" /> {status ?? 'Inconclusive'}
      </Badge>
    );
  };

  if (isAnalysisLoading) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3">
        <Loader2 className="size-8 animate-spin text-[#FF4500]" />
        <p className="text-muted-foreground text-sm">Loading survey intelligence data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-border from-background via-muted/20 to-background relative overflow-hidden bg-gradient-to-r shadow-xs">
        <div className="pointer-events-none absolute top-0 right-0 h-full w-1/3 bg-gradient-to-l from-[#FF4500]/5 to-transparent" />
        <CardContent className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-xl border border-[#FF4500]/20 bg-[#FF4500]/10 text-[#FF4500]">
                <Sparkles className="size-5" />
              </div>
              <div>
                <h3 className="text-foreground text-base font-semibold tracking-tight">
                  Survey Response Intelligence
                </h3>
                <p className="text-muted-foreground text-xs">
                  AI-synthesized respondent feedback, hypothesis validation, customer sentiment, and
                  strategic go-to-market insights.
                </p>
              </div>
            </div>
            {analysis?.analysis_timestamp && (
              <p className="text-muted-foreground/80 flex items-center gap-1.5 pl-11 text-[11px]">
                <Clock className="size-3" /> Last analyzed on{' '}
                {new Date(analysis.analysis_timestamp).toLocaleString()}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right sm:block">
              <span className="text-muted-foreground block text-[11px] font-medium">
                Collected Responses
              </span>
              <span className="text-foreground text-sm font-semibold">
                {totalResponses} {totalResponses === 1 ? 'response' : 'responses'}
              </span>
            </div>

            <Button
              onClick={handleRunAnalysis}
              disabled={runAnalysisMutation.isPending || totalResponses < 1}
              className="gap-2 bg-[#FF4500] font-semibold text-white shadow-sm transition-all duration-150 hover:bg-[#FF4500]/90 disabled:opacity-50"
            >
              {runAnalysisMutation.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Analyzing Responses...
                </>
              ) : (
                <>
                  {hasAnalysis ? <RefreshCw className="size-4" /> : <Brain className="size-4" />}
                  {hasAnalysis ? 'Re-run Analysis' : 'Run AI Analysis'}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* In-Flight Analysis State */}
      {runAnalysisMutation.isPending && (
        <Card className="border-[#FF4500]/30 bg-[#FF4500]/5 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center gap-3 py-12 text-center">
            <div className="relative">
              <div className="absolute -inset-2 animate-ping rounded-full bg-[#FF4500]/20" />
              <div className="relative flex size-12 items-center justify-center rounded-full bg-[#FF4500] text-white shadow-md">
                <Sparkles className="size-6 animate-spin" />
              </div>
            </div>
            <div className="space-y-1">
              <h4 className="text-foreground text-base font-semibold">
                Synthesizing Market Intelligence...
              </h4>
              <p className="text-muted-foreground max-w-md text-xs leading-relaxed">
                Evaluating response authenticity, scoring quality & fraud signals, validating
                customer hypotheses, and extracting GTM positioning takeaways.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State when no analysis has been run */}
      {!hasAnalysis && !runAnalysisMutation.isPending && (
        <Card className="border-border bg-muted/10 border-dashed">
          <CardContent className="flex flex-col items-center justify-center gap-4 py-16 text-center">
            <div className="bg-muted text-muted-foreground flex size-14 items-center justify-center rounded-2xl">
              <Brain className="size-7" />
            </div>
            <div className="max-w-md space-y-1.5">
              <h4 className="text-foreground text-base font-semibold">
                No Response Analysis Available Yet
              </h4>
              <p className="text-muted-foreground text-xs leading-relaxed">
                {totalResponses < 1
                  ? 'Collect at least 1 response from participants to unlock the Survey Intelligence Agent report.'
                  : 'Click "Run AI Analysis" above to process your collected responses through the Survey Intelligence validation pipeline.'}
              </p>
            </div>

            {totalResponses >= 1 && (
              <Button
                onClick={handleRunAnalysis}
                className="mt-2 gap-2 bg-[#FF4500] font-semibold text-white hover:bg-[#FF4500]/90"
              >
                <Sparkles className="size-4" /> Run AI Analysis Now
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Analysis Results Display */}
      {hasAnalysis && !runAnalysisMutation.isPending && analysis && (
        <div className="space-y-6">
          {/* Executive Summary Card if present */}
          {Boolean(analysis.executive_summary ?? analysis.purpose) && (
            <Card className="border-border bg-card">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="size-4 text-[#FF4500]" />
                  <CardTitle className="text-sm font-semibold">Executive Summary</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-muted-foreground space-y-2 text-xs leading-relaxed">
                {analysis.executive_summary && (
                  <p className="text-foreground text-sm font-medium">
                    {extractText(analysis.executive_summary)}
                  </p>
                )}
                {analysis.purpose && (
                  <p>
                    <span className="font-semibold">Survey Purpose:</span>{' '}
                    {extractText(analysis.purpose)}
                  </p>
                )}
                {analysis.target_population?.definition && (
                  <p>
                    <span className="font-semibold">Target Audience:</span>{' '}
                    {extractText(analysis.target_population.definition)}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* KPI Scorecards Grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {/* Response Quality */}
            <Card className="border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-[11px] font-medium uppercase">
                  Response Quality
                </span>
                <FileCheck2 className="text-muted-foreground size-4" />
              </div>
              <div className="mt-2">
                <span
                  className={`text-2xl font-bold ${getScoreColor(analysis.data_quality?.response_quality_score)}`}
                >
                  {analysis.data_quality?.response_quality_score != null
                    ? `${Math.round(Number(analysis.data_quality.response_quality_score))}%`
                    : 'N/A'}
                </span>
                <p className="text-muted-foreground/80 mt-0.5 text-[10px]">
                  Substance & completeness
                </p>
              </div>
            </Card>

            {/* Validation Confidence */}
            <Card className="border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-[11px] font-medium uppercase">
                  Validation Confidence
                </span>
                <TrendingUp className="text-muted-foreground size-4" />
              </div>
              <div className="mt-2">
                <span
                  className={`text-2xl font-bold ${getScoreColor(analysis.validation?.validation_confidence_score)}`}
                >
                  {analysis.validation?.validation_confidence_score != null
                    ? `${Math.round(Number(analysis.validation.validation_confidence_score))}%`
                    : 'N/A'}
                </span>
                <p className="text-muted-foreground/80 mt-0.5 text-[10px]">
                  Hypothesis validation certainty
                </p>
              </div>
            </Card>

            {/* Evidence Strength */}
            <Card className="border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-[11px] font-medium uppercase">
                  Evidence Strength
                </span>
                <Target className="text-muted-foreground size-4" />
              </div>
              <div className="mt-2">
                <span
                  className={`text-2xl font-bold ${getScoreColor(analysis.validation?.evidence_strength_score)}`}
                >
                  {analysis.validation?.evidence_strength_score != null
                    ? `${Math.round(Number(analysis.validation.evidence_strength_score))}%`
                    : 'N/A'}
                </span>
                <p className="text-muted-foreground/80 mt-0.5 text-[10px]">
                  Supporting signal strength
                </p>
              </div>
            </Card>

            {/* Reliability */}
            <Card className="border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-[11px] font-medium uppercase">
                  Reliability
                </span>
                <ShieldCheck className="text-muted-foreground size-4" />
              </div>
              <div className="mt-2">
                <span
                  className={`text-2xl font-bold ${getScoreColor(analysis.data_quality?.response_reliability_score)}`}
                >
                  {analysis.data_quality?.response_reliability_score != null
                    ? `${Math.round(Number(analysis.data_quality.response_reliability_score))}%`
                    : 'N/A'}
                </span>
                <p className="text-muted-foreground/80 mt-0.5 text-[10px]">Signal consistency</p>
              </div>
            </Card>

            {/* Fraud Risk */}
            <Card className="border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-[11px] font-medium uppercase">
                  Fraud Risk
                </span>
                <ShieldAlert className="text-muted-foreground size-4" />
              </div>
              <div className="mt-2">
                <span
                  className={`text-2xl font-bold ${getScoreColor(analysis.data_quality?.fraud_risk_score, true)}`}
                >
                  {analysis.data_quality?.fraud_risk_score != null
                    ? `${Math.round(Number(analysis.data_quality.fraud_risk_score))}%`
                    : '0%'}
                </span>
                <p className="text-muted-foreground/80 mt-0.5 text-[10px]">
                  {Number(analysis.data_quality?.fraud_risk_score ?? 0) < 30
                    ? 'Low bot/duplicate risk'
                    : 'Review suspicious signals'}
                </p>
              </div>
            </Card>
          </div>

          {/* Validation & Hypothesis Testing */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Validated Problems & Hypotheses */}
            <Card className="border-border bg-card">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Target className="size-4 text-[#FF4500]" />
                  <CardTitle className="text-sm font-semibold">Problem & Need Validation</CardTitle>
                </div>
                <CardDescription className="text-xs">
                  Evaluation of core customer pain points against survey feedback.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {Array.isArray(analysis.validation?.problems) &&
                analysis.validation.problems.length > 0 ? (
                  analysis.validation.problems.map((prob, idx) => {
                    const isObj = typeof prob === 'object' && prob !== null;
                    const item = isObj ? prob : null;
                    const text = extractText(prob);
                    const status = item?.status ?? 'validated';
                    const conf = item?.confidence_score;
                    const evidenceList = item
                      ? extractList(item.evidence_for ?? item.supporting_evidence)
                      : [];
                    const opposingList = item
                      ? extractList(item.evidence_against ?? item.opposing_evidence)
                      : [];
                    const businessImplication = item?.business_implication;
                    const recommendedAction = item?.recommended_action;

                    return (
                      <div
                        key={idx}
                        className="border-border bg-muted/20 flex flex-col gap-2 rounded-xl border p-3.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-foreground text-xs leading-normal font-medium">
                            {text}
                          </p>
                          {getStatusBadge(status)}
                        </div>

                        {conf != null && !isNaN(Number(conf)) && (
                          <div className="flex items-center gap-2 pt-1">
                            <span className="text-muted-foreground text-[10px]">Confidence:</span>
                            <Progress value={Number(conf)} className="h-1.5 flex-1" />
                            <span className="text-foreground text-[10px] font-semibold">
                              {Math.round(Number(conf))}%
                            </span>
                          </div>
                        )}

                        {evidenceList.length > 0 && (
                          <div className="mt-1 space-y-1">
                            <span className="block text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                              Supporting Evidence:
                            </span>
                            <ul className="text-muted-foreground list-disc space-y-0.5 pl-3.5 text-[11px]">
                              {evidenceList.map((ev, i) => (
                                <li key={i}>{ev}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {opposingList.length > 0 && (
                          <div className="mt-1 space-y-1">
                            <span className="block text-[10px] font-medium text-rose-600 dark:text-rose-400">
                              Opposing Evidence:
                            </span>
                            <ul className="text-muted-foreground list-disc space-y-0.5 pl-3.5 text-[11px]">
                              {opposingList.map((ev, i) => (
                                <li key={i}>{ev}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {businessImplication && (
                          <p className="text-muted-foreground border-border/50 border-t pt-1.5 text-[11px] leading-relaxed">
                            <span className="font-semibold">Implication:</span>{' '}
                            {extractText(businessImplication)}
                          </p>
                        )}

                        {recommendedAction && (
                          <p className="text-muted-foreground text-[11px] leading-relaxed">
                            <span className="font-semibold text-[#FF4500]">
                              Recommended Action:
                            </span>{' '}
                            {extractText(recommendedAction)}
                          </p>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p className="text-muted-foreground text-xs italic">
                    No specific problem validation signals recorded.
                  </p>
                )}

                {/* Problem-Solution Fit Indicators */}
                {Array.isArray(analysis.validation?.problem_solution_fit_indicators) &&
                  analysis.validation.problem_solution_fit_indicators.length > 0 && (
                    <div className="border-border bg-muted/10 mt-3 space-y-2 rounded-xl border p-3">
                      <span className="text-foreground flex items-center gap-1.5 text-xs font-semibold">
                        <Zap className="size-3.5 text-amber-500" /> Problem-Solution Fit Indicators
                      </span>
                      <ul className="text-muted-foreground list-disc space-y-1 pl-4 text-xs">
                        {extractList(analysis.validation.problem_solution_fit_indicators).map(
                          (item, idx) => (
                            <li key={idx}>{item}</li>
                          ),
                        )}
                      </ul>
                    </div>
                  )}
              </CardContent>
            </Card>

            {/* Persona & Segment Validation */}
            <Card className="border-border bg-card">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Users className="size-4 text-[#FF4500]" />
                  <CardTitle className="text-sm font-semibold">
                    Target Customer & Persona Fit
                  </CardTitle>
                </div>
                <CardDescription className="text-xs">
                  Validation of target respondent segments and behavioral personas.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {Array.isArray(analysis.validation?.segments) &&
                analysis.validation.segments.length > 0 ? (
                  analysis.validation.segments.map((seg, idx) => {
                    const isObj = typeof seg === 'object' && seg !== null;
                    const item = isObj ? seg : null;
                    const name = extractText(seg);
                    const status = item?.status ?? 'validated';
                    const conf = item?.confidence_score;

                    return (
                      <div
                        key={idx}
                        className="border-border bg-muted/20 flex items-center justify-between rounded-xl border p-3"
                      >
                        <div className="space-y-1">
                          <p className="text-foreground text-xs font-medium">{name}</p>
                          {conf != null && !isNaN(Number(conf)) && (
                            <span className="text-muted-foreground text-[10px]">
                              Fit Confidence: {Math.round(Number(conf))}%
                            </span>
                          )}
                        </div>
                        {getStatusBadge(status)}
                      </div>
                    );
                  })
                ) : (
                  <p className="text-muted-foreground text-xs italic">
                    No discrete segment breakdown detected.
                  </p>
                )}

                {/* Adoption Readiness */}
                {Array.isArray(analysis.validation?.adoption_readiness) &&
                  analysis.validation.adoption_readiness.length > 0 && (
                    <div className="border-border bg-muted/20 mt-3 space-y-2 rounded-xl border p-3">
                      <span className="text-foreground flex items-center gap-1.5 text-xs font-semibold">
                        <Compass className="size-3.5 text-[#FF4500]" /> Adoption Readiness Signals
                      </span>
                      {analysis.validation.adoption_readiness.map((ar, idx) => {
                        const isObj = typeof ar === 'object' && ar !== null;
                        const item = isObj ? ar : null;
                        const level = extractText(ar);
                        const drivers = item ? extractList(item.drivers) : [];
                        const barriers = item ? extractList(item.barriers) : [];

                        return (
                          <div key={idx} className="space-y-1 text-xs">
                            <span className="text-foreground font-medium">{level}</span>
                            {drivers.length > 0 && (
                              <p className="text-muted-foreground text-[11px]">
                                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                  Drivers:
                                </span>{' '}
                                {drivers.join(', ')}
                              </p>
                            )}
                            {barriers.length > 0 && (
                              <p className="text-muted-foreground text-[11px]">
                                <span className="font-semibold text-rose-600 dark:text-rose-400">
                                  Barriers:
                                </span>{' '}
                                {barriers.join(', ')}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
              </CardContent>
            </Card>
          </div>

          {/* Customer Intelligence: Pain Points & Sentiment */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Top Pain Points */}
            <Card className="border-border bg-card">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Flame className="size-4 text-rose-500" />
                  <CardTitle className="text-sm font-semibold">Customer Pain Points</CardTitle>
                </div>
                <CardDescription className="text-xs">
                  Severity and recurring challenges reported by respondents.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {Array.isArray(analysis.customer_intelligence?.pain_points) &&
                analysis.customer_intelligence.pain_points.length > 0 ? (
                  analysis.customer_intelligence.pain_points.map((pp, idx) => {
                    const isObj = typeof pp === 'object' && pp !== null;
                    const item = isObj ? pp : null;
                    const title = extractText(pp);
                    const severity = item?.severity ?? item?.frequency_or_magnitude;
                    const description = item?.description;

                    return (
                      <div
                        key={idx}
                        className="border-border bg-muted/20 flex flex-col gap-1.5 rounded-xl border p-3"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-foreground text-xs font-medium">{title}</span>
                          {severity != null && (
                            <Badge variant="outline" className="border-rose-500/30 text-rose-500">
                              {extractText(severity)}
                            </Badge>
                          )}
                        </div>
                        {description && description !== title && (
                          <p className="text-muted-foreground text-[11px] leading-relaxed">
                            {extractText(description)}
                          </p>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p className="text-muted-foreground text-xs italic">
                    No pain points identified yet.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Customer Sentiment & Demand */}
            <Card className="border-border bg-card">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <MessageSquare className="size-4 text-blue-500" />
                  <CardTitle className="text-sm font-semibold">
                    Sentiment & Demand Signals
                  </CardTitle>
                </div>
                <CardDescription className="text-xs">
                  Customer vocabulary, emotional sentiment, and buying intent.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Sentiment */}
                {Array.isArray(analysis.customer_intelligence?.sentiment) &&
                analysis.customer_intelligence.sentiment.length > 0 ? (
                  <div className="border-border bg-muted/20 space-y-2 rounded-xl border p-3">
                    <span className="text-foreground block text-xs font-semibold">
                      Sentiment Analysis
                    </span>
                    <ul className="text-muted-foreground list-disc space-y-1 pl-4 text-xs">
                      {extractList(analysis.customer_intelligence.sentiment).map((st, idx) => (
                        <li key={idx}>{st}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {/* Customer Objections */}
                {Array.isArray(analysis.customer_intelligence?.objections) &&
                analysis.customer_intelligence.objections.length > 0 ? (
                  <div className="border-border bg-muted/20 space-y-2 rounded-xl border p-3">
                    <span className="text-foreground flex items-center gap-1.5 text-xs font-semibold">
                      <AlertCircle className="size-3.5 text-amber-500" /> Key Objections & Trust
                      Barriers
                    </span>
                    <ul className="text-muted-foreground list-disc space-y-1 pl-4 text-xs">
                      {extractList(analysis.customer_intelligence.objections).map((obj, idx) => (
                        <li key={idx}>{obj}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </div>

          {/* Strategic Recommendations & GTM Handoff */}
          {Boolean(analysis.recommendations ?? analysis.gtm_handoff) && (
            <Card className="border-border bg-card">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Lightbulb className="size-4 text-[#FF4500]" />
                  <CardTitle className="text-sm font-semibold">
                    Go-To-Market & Strategic Recommendations
                  </CardTitle>
                </div>
                <CardDescription className="text-xs">
                  Actionable positioning, feature priorities, and validation next steps.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Recommendations List */}
                {Array.isArray(analysis.recommendations) && analysis.recommendations.length > 0 && (
                  <div className="space-y-2.5">
                    {analysis.recommendations.map((rec, idx: number) => {
                      const isObj = typeof rec === 'object' && rec !== null;
                      const item = isObj ? rec : null;
                      const text = extractText(rec);
                      const rationale = item?.rationale ?? item?.business_implication;
                      const priority = item?.priority ?? item?.confidence_band;

                      return (
                        <div
                          key={idx}
                          className="border-border bg-muted/20 flex flex-col gap-1.5 rounded-xl border p-3.5"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-2">
                              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[#FF4500]/10 text-xs font-bold text-[#FF4500]">
                                {idx + 1}
                              </span>
                              <span className="text-foreground text-xs font-semibold">{text}</span>
                            </div>
                            {priority && (
                              <Badge
                                variant="outline"
                                className="border-[#FF4500]/30 text-[#FF4500]"
                              >
                                {extractText(priority)}
                              </Badge>
                            )}
                          </div>
                          {rationale && (
                            <p className="text-muted-foreground pl-7 text-[11px] leading-relaxed">
                              <span className="font-semibold">Rationale:</span>{' '}
                              {extractText(rationale)}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* GTM Handoff Highlights */}
                {analysis.gtm_handoff && (
                  <div className="mt-4 grid grid-cols-1 gap-4 rounded-xl border border-[#FF4500]/20 bg-[#FF4500]/5 p-4 sm:grid-cols-2">
                    {extractList(analysis.gtm_handoff.priority_segments).length > 0 && (
                      <div className="space-y-1">
                        <span className="text-foreground block text-xs font-semibold">
                          Priority Segments
                        </span>
                        <ul className="text-muted-foreground list-disc space-y-0.5 pl-4 text-xs">
                          {extractList(analysis.gtm_handoff.priority_segments).map((seg, i) => (
                            <li key={i}>{seg}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {extractList(analysis.gtm_handoff.value_proposition_implications).length >
                      0 && (
                      <div className="space-y-1">
                        <span className="text-foreground block text-xs font-semibold">
                          Value Proposition Implications
                        </span>
                        <ul className="text-muted-foreground list-disc space-y-0.5 pl-4 text-xs">
                          {extractList(analysis.gtm_handoff.value_proposition_implications).map(
                            (vp, i) => (
                              <li key={i}>{vp}</li>
                            ),
                          )}
                        </ul>
                      </div>
                    )}

                    {extractList(analysis.gtm_handoff.feature_priorities).length > 0 && (
                      <div className="space-y-1">
                        <span className="text-foreground block text-xs font-semibold">
                          Feature Priorities
                        </span>
                        <ul className="text-muted-foreground list-disc space-y-0.5 pl-4 text-xs">
                          {extractList(analysis.gtm_handoff.feature_priorities).map((fp, i) => (
                            <li key={i}>{fp}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {extractList(analysis.gtm_handoff.adoption_barriers).length > 0 && (
                      <div className="space-y-1">
                        <span className="text-foreground block text-xs font-semibold">
                          Adoption Barriers to Address
                        </span>
                        <ul className="text-muted-foreground list-disc space-y-0.5 pl-4 text-xs">
                          {extractList(analysis.gtm_handoff.adoption_barriers).map((ab, i) => (
                            <li key={i}>{ab}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
