import {
  BarChart3,
  CheckCircle2,
  HeartHandshake,
  MessageSquare,
  Smile,
  Sparkles,
  Users,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

import { Loader } from '@components/common/Loader';
import { Badge } from '@components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';

import {
  useAdminFeedbackQuestions,
  useAdminUserFeedbackSubmissions,
} from '../../hooks/useFeedback';

const SENTIMENT_COLORS: Record<string, string> = {
  positive: '#10B981',
  very_positive: '#FF4500',
  neutral: '#64748B',
  negative: '#F59E0B',
  very_negative: '#EF4444',
};

const CHART_PALETTE = ['#FF4500', '#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899', '#64748B'];

export function AdminFeedbackAnalytics() {
  const [selectedQuestionFilter, setSelectedQuestionFilter] = useState<string>('all');

  const { isLoading: isLoadingQuestions } = useAdminFeedbackQuestions();
  const { data: submissionsData, isLoading: isLoadingSubmissions } =
    useAdminUserFeedbackSubmissions({
      limit: 100,
      offset: 0,
    });

  const feedbackItems = useMemo(() => submissionsData?.feedback ?? [], [submissionsData?.feedback]);

  const analytics = useMemo(() => {
    if (feedbackItems.length === 0) {
      return {
        totalAnswers: 0,
        totalSessions: 0,
        uniqueUsers: 0,
        satisfactionRate: 0,
        sentimentData: [],
        questionBreakdowns: [],
        textQuotes: [],
      };
    }

    const uniqueUsersSet = new Set<number>();
    const sessionKeysSet = new Set<string>();
    let positiveCount = 0;
    let totalScoredAnswers = 0;

    const sentimentCounts = {
      veryPositive: 0,
      positive: 0,
      neutral: 0,
      needsImprovement: 0,
    };

    const questionDistribution: Record<
      string,
      { title: string; total: number; options: Record<string, number> }
    > = {};
    const textQuotesList: { user: string; text: string; date: string; question: string }[] = [];

    for (const item of feedbackItems) {
      uniqueUsersSet.add(item.user_id);
      const sessionKey = `${item.user_id}_${item.workspace_id}_${item.submission_date.substring(0, 16)}`;
      sessionKeysSet.add(sessionKey);

      const qTitle = item.question ?? `Question #${item.questionnaire_id}`;

      questionDistribution[qTitle] ??= {
        title: qTitle,
        total: 0,
        options: {},
      };

      for (const ans of item.user_answers) {
        const qDist = questionDistribution[qTitle];
        if (qDist) {
          qDist.total += 1;
          qDist.options[ans] = (qDist.options[ans] ?? 0) + 1;
        }

        const lower = ans.toLowerCase();
        const isEmojiVeryPos =
          ans === '😍' ||
          ans === '🤩' ||
          lower.includes('definitely') ||
          lower.includes('amazing') ||
          ans === '5';
        const isEmojiPos =
          ans === '🙂' ||
          ans === '😀' ||
          ans === '😊' ||
          lower.includes('good') ||
          lower.includes('useful') ||
          ans === '4';
        const isEmojiNeutral = ans === '😐' || lower.includes('okay') || ans === '3';
        const isEmojiNeg =
          ans === '🙁' ||
          ans === '🤕' ||
          lower.includes('poor') ||
          lower.includes('not like') ||
          ans === '1' ||
          ans === '2';

        if (isEmojiVeryPos) {
          sentimentCounts.veryPositive += 1;
          positiveCount += 1;
          totalScoredAnswers += 1;
        } else if (isEmojiPos) {
          sentimentCounts.positive += 1;
          positiveCount += 1;
          totalScoredAnswers += 1;
        } else if (isEmojiNeutral) {
          sentimentCounts.neutral += 1;
          totalScoredAnswers += 1;
        } else if (isEmojiNeg) {
          sentimentCounts.needsImprovement += 1;
          totalScoredAnswers += 1;
        }

        if (
          ans.length > 25 ||
          (!isEmojiVeryPos && !isEmojiPos && !isEmojiNeutral && !isEmojiNeg && ans.includes(' '))
        ) {
          textQuotesList.push({
            user: item.user_display_name ?? item.user_email.split('@')[0] ?? 'User',
            text: ans,
            date: item.submission_date,
            question: qTitle,
          });
        }
      }
    }

    const sentimentData = [
      {
        name: 'Very Positive',
        value: sentimentCounts.veryPositive,
        color: SENTIMENT_COLORS.very_positive ?? '#FF4500',
      },
      {
        name: 'Positive',
        value: sentimentCounts.positive,
        color: SENTIMENT_COLORS.positive ?? '#10B981',
      },
      {
        name: 'Neutral',
        value: sentimentCounts.neutral,
        color: SENTIMENT_COLORS.neutral ?? '#64748B',
      },
      {
        name: 'Needs Improvement',
        value: sentimentCounts.needsImprovement,
        color: SENTIMENT_COLORS.very_negative ?? '#EF4444',
      },
    ].filter((s) => s.value > 0);

    const satisfactionRate =
      totalScoredAnswers > 0 ? Math.round((positiveCount / totalScoredAnswers) * 100) : 100;

    const questionBreakdowns = Object.values(questionDistribution).map((q) => {
      const sortedOptions = Object.entries(q.options)
        .map(([opt, count]) => ({
          name: opt,
          count,
          percentage: q.total > 0 ? Math.round((count / q.total) * 100) : 0,
        }))
        .sort((a, b) => b.count - a.count);

      return {
        title: q.title,
        total: q.total,
        options: sortedOptions,
      };
    });

    return {
      totalAnswers: feedbackItems.length,
      totalSessions: sessionKeysSet.size,
      uniqueUsers: uniqueUsersSet.size,
      satisfactionRate,
      sentimentData,
      questionBreakdowns,
      textQuotes: textQuotesList.slice(0, 8),
    };
  }, [feedbackItems]);

  const isLoading = isLoadingQuestions || isLoadingSubmissions;

  if (isLoading) {
    return <Loader label="Analyzing feedback responses..." className="py-16" />;
  }

  if (feedbackItems.length === 0) {
    return (
      <Card className="border-border">
        <CardContent className="flex flex-col items-center justify-center p-12 text-center">
          <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-orange-500/10 text-[#FF4500]">
            <BarChart3 className="size-6" />
          </div>
          <p className="text-foreground text-base font-semibold">No Feedback Data Yet</p>
          <p className="text-muted-foreground mt-1 max-w-sm text-xs">
            Once founders submit feedback during certificate downloads, response analytics and
            sentiment trends will appear here.
          </p>
        </CardContent>
      </Card>
    );
  }

  const filteredQuestions =
    selectedQuestionFilter === 'all'
      ? analytics.questionBreakdowns
      : analytics.questionBreakdowns.filter((q) => q.title === selectedQuestionFilter);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-[#FF4500]">
              <HeartHandshake className="size-5" />
            </div>
            <div>
              <p className="text-muted-foreground text-xs font-medium">Feedback Sessions</p>
              <p className="text-foreground text-2xl font-bold">{analytics.totalSessions}</p>
              <p className="text-muted-foreground mt-0.5 text-[10px]">Distinct user submissions</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
              <CheckCircle2 className="size-5" />
            </div>
            <div>
              <p className="text-muted-foreground text-xs font-medium">Satisfaction Score</p>
              <p className="text-foreground text-2xl font-bold">{analytics.satisfactionRate}%</p>
              <p className="mt-0.5 text-[10px] font-medium text-emerald-600">
                Positive sentiment ratio
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
              <Users className="size-5" />
            </div>
            <div>
              <p className="text-muted-foreground text-xs font-medium">Unique Founders</p>
              <p className="text-foreground text-2xl font-bold">{analytics.uniqueUsers}</p>
              <p className="text-muted-foreground mt-0.5 text-[10px]">
                Provided certificates feedback
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600">
              <MessageSquare className="size-5" />
            </div>
            <div>
              <p className="text-muted-foreground text-xs font-medium">Total Answers</p>
              <p className="text-foreground text-2xl font-bold">{analytics.totalAnswers}</p>
              <p className="text-muted-foreground mt-0.5 text-[10px]">Across all questions</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="border-border lg:col-span-1">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base font-bold">
                <Smile className="size-4 text-[#FF4500]" />
                User Sentiment
              </CardTitle>
              <Badge variant="outline" className="text-[10px]">
                {analytics.sentimentData.length > 0 ? 'Analyzed' : 'No ratings'}
              </Badge>
            </div>
            <p className="text-muted-foreground text-xs">
              Overall sentiment derived from emoji & rating answers
            </p>
          </CardHeader>
          <CardContent className="pt-2">
            {analytics.sentimentData.length === 0 ? (
              <div className="text-muted-foreground flex h-52 flex-col items-center justify-center p-4 text-center text-xs">
                <Smile className="text-muted-foreground mb-2 size-8 stroke-1" />
                No sentiment ratings found in recent submissions.
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics.sentimentData}
                        cx="50%"
                        cy="50%"
                        innerRadius={52}
                        outerRadius={78}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {analytics.sentimentData.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'var(--popover)',
                          borderColor: 'var(--border)',
                          borderRadius: '8px',
                          fontSize: '12px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="border-border grid w-full grid-cols-2 gap-2 border-t pt-3">
                  {analytics.sentimentData.map((s) => (
                    <div key={s.name} className="flex items-center gap-2 text-xs">
                      <span
                        className="size-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: s.color }}
                      />
                      <span className="text-muted-foreground truncate">{s.name}</span>
                      <span className="text-foreground ml-auto font-semibold">{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-base font-bold">
                  <BarChart3 className="size-4 text-[#FF4500]" />
                  Response Breakdown by Question
                </CardTitle>
                <p className="text-muted-foreground mt-0.5 text-xs">
                  Breakdown of choices and answers selected by founders
                </p>
              </div>

              {analytics.questionBreakdowns.length > 1 && (
                <select
                  value={selectedQuestionFilter}
                  onChange={(e) => setSelectedQuestionFilter(e.target.value)}
                  className="border-border bg-background text-foreground h-8 max-w-[220px] truncate rounded-md border px-2 py-1 text-xs focus:ring-1 focus:ring-[#FF4500] focus:outline-hidden"
                >
                  <option value="all">All Questions ({analytics.questionBreakdowns.length})</option>
                  {analytics.questionBreakdowns.map((q) => (
                    <option key={q.title} value={q.title}>
                      {q.title.length > 35 ? `${q.title.substring(0, 35)}...` : q.title}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            {filteredQuestions.map((q) => (
              <div
                key={q.title}
                className="border-border/70 bg-card space-y-2 rounded-xl border p-3.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-foreground text-xs leading-snug font-semibold sm:text-sm">
                    {q.title}
                  </p>
                  <Badge variant="secondary" className="shrink-0 text-[10px] font-medium">
                    {q.total} response{q.total !== 1 ? 's' : ''}
                  </Badge>
                </div>

                <div className="space-y-2 pt-1.5">
                  {q.options.slice(0, 5).map((opt, idx) => (
                    <div key={opt.name} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-foreground max-w-[70%] truncate font-medium">
                          {opt.name}
                        </span>
                        <span className="text-muted-foreground text-[11px]">
                          {opt.percentage}% ({opt.count})
                        </span>
                      </div>
                      <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${opt.percentage}%`,
                            backgroundColor: CHART_PALETTE[idx % CHART_PALETTE.length],
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {analytics.textQuotes.length > 0 && (
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-bold">
              <Sparkles className="size-4 text-orange-500" />
              Founder Voices & Written Feedback
            </CardTitle>
            <p className="text-muted-foreground text-xs">
              Qualitative thoughts and custom remarks shared by founders
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
              {analytics.textQuotes.map((q, idx) => (
                <div
                  key={idx}
                  className="border-border bg-muted/20 hover:bg-muted/30 flex flex-col justify-between space-y-2 rounded-xl border p-3.5 transition-colors"
                >
                  <p className="text-foreground text-xs leading-relaxed italic">
                    &ldquo;{q.text}&rdquo;
                  </p>
                  <div className="text-muted-foreground border-border/50 flex items-center justify-between border-t pt-1 text-[11px]">
                    <span className="text-foreground font-medium">{q.user}</span>
                    <span className="text-[10px]">{q.question.substring(0, 30)}...</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
