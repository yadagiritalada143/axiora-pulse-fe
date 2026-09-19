import { format } from 'date-fns';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Inbox,
  LayoutGrid,
  List,
  RotateCcw,
  Search,
} from 'lucide-react';
import { Fragment, useMemo, useState } from 'react';

import { STAR_DESCRIPTIONS, countStars, type AdminUserFeedbackItem } from '@/types/feedback.types';
import { Loader } from '@components/common/Loader';
import { Badge } from '@components/ui/badge';
import { Button } from '@components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import { DatePicker } from '@components/ui/date-picker';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@components/ui/dialog';
import { Input } from '@components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ui/select';

import { useAdminUserFeedbackSubmissions } from '../../hooks/useFeedback';

export interface GroupedFeedbackSubmission {
  sessionKey: string;
  userId: number;
  userEmail: string;
  userDisplayName: string | null;
  workspaceId: number | null;
  submissionDate: string;
  items: AdminUserFeedbackItem[];
}

export function AdminFeedbackSubmissionsTable() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [limit, setLimit] = useState(50);
  const [offset, setOffset] = useState(0);
  const [viewMode, setViewMode] = useState<'grouped' | 'raw'>('grouped');
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());
  const [selectedGroup, setSelectedGroup] = useState<GroupedFeedbackSubmission | null>(null);
  const [selectedRawItem, setSelectedRawItem] = useState<AdminUserFeedbackItem | null>(null);

  const { data, isLoading, isError, refetch } = useAdminUserFeedbackSubmissions({
    limit,
    offset,
    search: debouncedSearch.trim() || undefined,
    date_from: dateFrom ? new Date(dateFrom).toISOString() : undefined,
    date_to: dateTo ? new Date(dateTo).toISOString() : undefined,
  });

  const feedbackItems = useMemo(() => data?.feedback ?? [], [data?.feedback]);
  const total = data?.pagination.total ?? 0;
  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const groupedSubmissions = useMemo<GroupedFeedbackSubmission[]>(() => {
    const groupsMap = new Map<string, GroupedFeedbackSubmission>();

    for (const item of feedbackItems) {
      const dateMinute = item.submission_date ? item.submission_date.substring(0, 16) : 'unknown';
      const key = `${item.user_id}_${item.workspace_id}_${dateMinute}`;

      if (!groupsMap.has(key)) {
        groupsMap.set(key, {
          sessionKey: key,
          userId: item.user_id,
          userEmail: item.user_email,
          userDisplayName: item.user_display_name,
          workspaceId: item.workspace_id,
          submissionDate: item.submission_date,
          items: [],
        });
      }
      const existingGroup = groupsMap.get(key);
      if (existingGroup) {
        existingGroup.items.push(item);
      }
    }

    return Array.from(groupsMap.values());
  }, [feedbackItems]);

  const toggleExpand = (sessionKey: string) => {
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(sessionKey)) {
        next.delete(sessionKey);
      } else {
        next.add(sessionKey);
      }
      return next;
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOffset(0);
    setDebouncedSearch(search);
  };

  const handleResetFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    setDateFrom('');
    setDateTo('');
    setOffset(0);
  };

  const handlePrevPage = () => {
    setOffset((prev) => Math.max(0, prev - limit));
  };

  const handleNextPage = () => {
    if (offset + limit < total) {
      setOffset((prev) => prev + limit);
    }
  };

  const handleLimitChange = (newLimit: string) => {
    const val = Number(newLimit);
    setLimit(val);
    setOffset(0);
  };

  return (
    <Card className="border-border shadow-xs">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-lg font-bold">User Feedback Submissions</CardTitle>
            <p className="text-muted-foreground mt-1 text-xs">
              Browse feedback submitted by users upon downloading venture validation certificates.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="border-border bg-muted/30 flex items-center rounded-lg border p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setViewMode('grouped')}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 font-medium transition-colors ${
                  viewMode === 'grouped'
                    ? 'bg-background text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Group multiple questions into 1 session row per submission"
              >
                <LayoutGrid className="size-3.5" />
                Grouped ({groupedSubmissions.length})
              </button>
              <button
                type="button"
                onClick={() => setViewMode('raw')}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 font-medium transition-colors ${
                  viewMode === 'raw'
                    ? 'bg-background text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="View all raw answers individually"
              >
                <List className="size-3.5" />
                All Answers ({feedbackItems.length})
              </button>
            </div>

            <div className="text-muted-foreground hidden text-xs lg:block">
              <span className="text-foreground font-semibold">{total}</span> total
            </div>
          </div>
        </div>

        <form onSubmit={handleSearchSubmit} className="space-y-3 pt-3">
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-12">
            <div className="relative sm:col-span-4">
              <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
              <Input
                placeholder="Search by question or answer..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-background text-foreground border-border h-9 pl-9 text-xs"
              />
            </div>

            <div className="sm:col-span-3">
              <DatePicker
                placeholder="From date"
                value={dateFrom}
                onChange={(dateStr) => {
                  setDateFrom(dateStr);
                  setOffset(0);
                }}
                valueFormat="DD MMM YYYY"
                clearable
                maxDate={dateTo || undefined}
                className="w-full"
                aria-label="Filter from date"
              />
            </div>

            <div className="sm:col-span-3">
              <DatePicker
                placeholder="To date"
                value={dateTo}
                onChange={(dateStr) => {
                  setDateTo(dateStr);
                  setOffset(0);
                }}
                valueFormat="DD MMM YYYY"
                clearable
                minDate={dateFrom || undefined}
                className="w-full"
                aria-label="Filter to date"
              />
            </div>

            <div className="flex items-center gap-1 sm:col-span-2">
              <Button
                type="submit"
                size="sm"
                className="h-9 w-full bg-[#FF4500] px-3 text-xs font-medium text-white hover:bg-[#FF4500]/90 sm:w-auto"
              >
                Filter
              </Button>
              {(search || debouncedSearch || dateFrom || dateTo) && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleResetFilters}
                  className="text-muted-foreground hover:text-foreground size-9 shrink-0"
                  title="Reset filters"
                >
                  <RotateCcw className="size-3.5" />
                </Button>
              )}
            </div>
          </div>
        </form>
      </CardHeader>

      <CardContent>
        {isLoading && <Loader label="Loading user feedback submissions..." className="py-12" />}

        {isError && (
          <div className="text-destructive space-y-2 p-8 text-center text-sm">
            <p>Failed to load feedback submissions.</p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Try Again
            </Button>
          </div>
        )}

        {!isLoading && !isError && feedbackItems.length === 0 && (
          <div className="p-12 text-center">
            <div className="bg-muted text-muted-foreground mx-auto mb-3 flex size-12 items-center justify-center rounded-full">
              <Inbox className="size-6" />
            </div>
            <p className="text-foreground text-sm font-semibold">No submissions found</p>
            <p className="text-muted-foreground mx-auto mt-1 max-w-sm text-xs">
              {total === 0
                ? 'No user feedback submissions have been recorded yet.'
                : 'No submissions matched your search and date filters.'}
            </p>
          </div>
        )}

        {!isLoading && !isError && feedbackItems.length > 0 && (
          <div className="space-y-3">
            <div className="border-border overflow-x-auto rounded-lg border">
              {viewMode === 'grouped' ? (
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/60 text-foreground/80 dark:text-muted-foreground border-border border-b text-[11px] font-bold tracking-wider uppercase">
                    <tr>
                      <th className="w-10 px-3 py-3 text-center" />
                      <th className="min-w-[180px] px-4 py-3">User</th>
                      <th className="min-w-[240px] px-4 py-3">Responses</th>
                      <th className="min-w-[130px] px-4 py-3">Workspace</th>
                      <th className="min-w-[160px] px-4 py-3">Date</th>
                      <th className="min-w-[90px] px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-border divide-y">
                    {groupedSubmissions.map((group) => {
                      const isExpanded = expandedKeys.has(group.sessionKey);
                      let formattedDate = '—';
                      try {
                        formattedDate = format(
                          new Date(group.submissionDate),
                          'MMM d, yyyy h:mm a',
                        );
                      } catch {
                        formattedDate = group.submissionDate;
                      }

                      const initials = (group.userDisplayName ?? group.userEmail ?? 'U')
                        .substring(0, 2)
                        .toUpperCase();

                      return (
                        <Fragment key={group.sessionKey}>
                          <tr className="hover:bg-muted/20 group transition-colors">
                            <td className="px-3 py-3.5 text-center align-middle">
                              <button
                                type="button"
                                onClick={() => toggleExpand(group.sessionKey)}
                                className="text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer rounded-md p-1 transition-colors"
                                aria-label={isExpanded ? 'Collapse row' : 'Expand row'}
                              >
                                {isExpanded ? (
                                  <ChevronDown className="size-4 text-[#FF4500]" />
                                ) : (
                                  <ChevronRight className="size-4" />
                                )}
                              </button>
                            </td>

                            <td className="px-4 py-3.5 align-middle">
                              <div className="flex items-center gap-2.5">
                                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-orange-500/15 text-xs font-semibold text-[#FF4500]">
                                  {initials}
                                </div>
                                <div className="max-w-[200px] min-w-0">
                                  <div className="text-foreground truncate font-semibold">
                                    {group.userDisplayName ?? group.userEmail.split('@')[0]}
                                  </div>
                                  <div className="text-muted-foreground truncate font-mono text-[11px]">
                                    {group.userEmail}
                                  </div>
                                </div>
                              </div>
                            </td>

                            <td className="px-4 py-3.5 align-middle">
                              <div className="flex flex-wrap items-center gap-2">
                                <Badge
                                  variant="secondary"
                                  className="shrink-0 border-0 bg-orange-500/10 text-[11px] font-semibold text-[#FF4500] hover:bg-orange-500/15"
                                >
                                  {group.items.length} Question{group.items.length !== 1 ? 's' : ''}{' '}
                                  Answered
                                </Badge>

                                {group.items.slice(0, 2).map((item) => {
                                  const ans = item.user_answers?.[0];
                                  if (!ans) return null;
                                  const isStar = ans.includes('⭐');
                                  if (isStar) {
                                    const starCount = countStars(ans);
                                    return (
                                      <span
                                        key={item.id}
                                        className="inline-flex max-w-[170px] items-center gap-1.5 truncate rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-800 dark:text-amber-300"
                                        title={`${item.question}: ${ans} (${starCount}/5 Stars)`}
                                      >
                                        <span className="text-sm leading-none tracking-wider text-[#FFB800]">
                                          {ans}
                                        </span>
                                        <span className="text-[10px]">({starCount}/5)</span>
                                      </span>
                                    );
                                  }
                                  const isEmoji =
                                    /\p{Extended_Pictographic}/u.test(ans) && ans.length <= 4;
                                  return (
                                    <span
                                      key={item.id}
                                      className={`border-border/80 bg-background text-foreground inline-flex max-w-[150px] items-center gap-1 truncate rounded-md border px-2 py-0.5 text-[11px] ${
                                        isEmoji ? 'py-0 text-base leading-none' : ''
                                      }`}
                                      title={`${item.question}: ${item.user_answers.join(', ')}`}
                                    >
                                      {ans}
                                    </span>
                                  );
                                })}

                                {group.items.length > 2 && (
                                  <span className="text-muted-foreground shrink-0 text-[10px] font-medium">
                                    +{group.items.length - 2} more
                                  </span>
                                )}
                              </div>
                            </td>

                            <td className="px-4 py-3.5 align-middle whitespace-nowrap">
                              {group.workspaceId != null ? (
                                <Badge
                                  variant="outline"
                                  className="text-foreground/80 dark:text-muted-foreground border-border bg-muted/25 font-mono text-[11px] font-medium"
                                >
                                  Workspace {group.workspaceId}
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </td>

                            <td className="text-foreground/75 dark:text-muted-foreground px-4 py-3.5 align-middle text-[11px] font-medium whitespace-nowrap">
                              {formattedDate}
                            </td>

                            <td className="px-4 py-3.5 text-right align-middle whitespace-nowrap">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedGroup(group)}
                                className="border-border text-foreground h-7 gap-1.5 text-xs transition-colors hover:border-[#FF4500] hover:bg-orange-500/5 hover:text-[#FF4500]"
                              >
                                <Eye className="size-3" />
                                Details
                              </Button>
                            </td>
                          </tr>

                          {isExpanded && (
                            <tr className="bg-muted/15 border-border border-b">
                              <td colSpan={6} className="px-6 py-4">
                                <div className="space-y-3 pl-2 sm:pl-7">
                                  <div className="text-muted-foreground border-border/60 flex items-center justify-between border-b pb-1.5 text-xs font-medium">
                                    <span className="text-foreground font-semibold">
                                      Question-by-Question Breakdown
                                    </span>
                                    <span>{group.items.length} responses</span>
                                  </div>

                                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                    {group.items.map((item, idx) => {
                                      const firstAnswer = item.user_answers?.[0] ?? '';
                                      const isStar = firstAnswer.includes('⭐');
                                      const isEmojiOnly =
                                        !isStar &&
                                        item.user_answers.length === 1 &&
                                        /\p{Extended_Pictographic}/u.test(firstAnswer) &&
                                        firstAnswer.length <= 4;

                                      return (
                                        <div
                                          key={item.id}
                                          className="border-border bg-card space-y-1.5 rounded-xl border p-3 shadow-2xs"
                                        >
                                          <div className="flex items-start gap-2">
                                            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-orange-500/10 text-[10px] font-bold text-[#FF4500]">
                                              {idx + 1}
                                            </span>
                                            <p className="text-foreground text-xs leading-snug font-semibold">
                                              {item.question ?? `Question ${item.questionnaire_id}`}
                                            </p>
                                          </div>

                                          <div className="flex flex-wrap gap-1.5 pt-0.5 pl-7">
                                            {isStar ? (
                                              <div className="flex items-center gap-2 rounded-xl border border-amber-500/25 bg-amber-500/10 px-3 py-1.5">
                                                <span className="text-base leading-none tracking-widest text-[#FFB800]">
                                                  {firstAnswer}
                                                </span>
                                                <span className="text-xs font-bold text-amber-900 dark:text-amber-200">
                                                  {countStars(firstAnswer)}{' '}
                                                  {countStars(firstAnswer) === 1 ? 'Star' : 'Stars'}
                                                  {STAR_DESCRIPTIONS[countStars(firstAnswer)]
                                                    ? ` — ${STAR_DESCRIPTIONS[countStars(firstAnswer)]}`
                                                    : ''}
                                                </span>
                                              </div>
                                            ) : isEmojiOnly ? (
                                              <div className="flex items-center gap-2 rounded-lg border border-orange-500/20 bg-orange-500/10 px-2.5 py-1">
                                                <span className="text-2xl leading-none">
                                                  {firstAnswer}
                                                </span>
                                                <span className="text-foreground text-xs font-medium">
                                                  Selected Rating
                                                </span>
                                              </div>
                                            ) : (
                                              item.user_answers.map((ans, aIdx) => (
                                                <Badge
                                                  key={aIdx}
                                                  variant="secondary"
                                                  className="bg-muted text-foreground px-2 py-0.5 text-xs font-medium"
                                                >
                                                  {ans}
                                                </Badge>
                                              ))
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/60 text-foreground/80 dark:text-muted-foreground border-border border-b text-[11px] font-bold tracking-wider uppercase">
                    <tr>
                      <th className="min-w-[180px] px-4 py-3">User</th>
                      <th className="min-w-[220px] px-4 py-3">Question</th>
                      <th className="min-w-[200px] px-4 py-3">Submitted Answers</th>
                      <th className="min-w-[130px] px-4 py-3">Workspace</th>
                      <th className="min-w-[160px] px-4 py-3">Date</th>
                      <th className="min-w-[90px] px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-border divide-y">
                    {feedbackItems.map((item) => {
                      let formattedDate = '—';
                      try {
                        formattedDate = format(
                          new Date(item.submission_date),
                          'MMM d, yyyy h:mm a',
                        );
                      } catch {
                        formattedDate = item.submission_date;
                      }

                      return (
                        <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                          <td className="px-4 py-3 align-middle">
                            <div className="text-foreground font-medium">
                              {item.user_display_name ?? 'User'}
                            </div>
                            <div className="text-muted-foreground font-mono text-[11px]">
                              {item.user_email}
                            </div>
                          </td>

                          <td className="max-w-xs px-4 py-3 align-middle">
                            <p
                              className="text-foreground truncate font-medium"
                              title={item.question ?? ''}
                            >
                              {item.question ?? `Question ${item.questionnaire_id}`}
                            </p>
                          </td>

                          <td className="max-w-sm px-4 py-3 align-middle">
                            <div className="flex flex-wrap gap-1">
                              {item.user_answers && item.user_answers.length > 0 ? (
                                item.user_answers.map((ans, idx) => {
                                  if (ans.includes('⭐')) {
                                    const starCount = countStars(ans);
                                    return (
                                      <Badge
                                        key={idx}
                                        variant="outline"
                                        className="gap-1 border-amber-500/30 bg-amber-500/10 text-[11px] font-semibold text-amber-800 dark:text-amber-300"
                                        title={`${ans} (${starCount}/5 Stars)`}
                                      >
                                        <span className="tracking-wider text-[#FFB800]">{ans}</span>
                                        <span>({starCount}/5)</span>
                                      </Badge>
                                    );
                                  }
                                  return (
                                    <Badge
                                      key={idx}
                                      variant="secondary"
                                      className="max-w-xs truncate text-[11px] font-normal"
                                      title={ans}
                                    >
                                      {ans}
                                    </Badge>
                                  );
                                })
                              ) : (
                                <span className="text-muted-foreground italic">No answer</span>
                              )}
                            </div>
                          </td>

                          <td className="px-4 py-3 align-middle whitespace-nowrap">
                            <span className="text-foreground/80 dark:text-muted-foreground font-mono text-xs font-medium">
                              Workspace {item.workspace_id}
                            </span>
                          </td>

                          <td className="text-foreground/75 dark:text-muted-foreground px-4 py-3 align-middle text-[11px] font-medium whitespace-nowrap">
                            {formattedDate}
                          </td>

                          <td className="px-4 py-3 text-right align-middle whitespace-nowrap">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => setSelectedRawItem(item)}
                              className="text-foreground/70 hover:text-foreground hover:bg-muted size-7"
                              title="View details"
                            >
                              <Eye className="size-3.5" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            <div className="text-muted-foreground flex flex-col gap-3 pt-2 text-xs sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <span>Rows per page:</span>
                <Select value={String(limit)} onValueChange={handleLimitChange}>
                  <SelectTrigger className="h-7 w-16 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
                <span>
                  Showing {Math.min(total, offset + 1)}–{Math.min(total, offset + limit)} of {total}
                </span>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <span>
                  Page {currentPage} of {totalPages}
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handlePrevPage}
                    disabled={offset === 0}
                    className="size-7"
                    aria-label="Previous Page"
                  >
                    <ChevronLeft className="size-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleNextPage}
                    disabled={offset + limit >= total}
                    className="size-7"
                    aria-label="Next Page"
                  >
                    <ChevronRight className="size-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>

      <Dialog
        open={selectedGroup !== null}
        onOpenChange={(open) => !open && setSelectedGroup(null)}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Feedback Submission Details</DialogTitle>
            <DialogDescription>
              Complete responses submitted during venture certificate download.
            </DialogDescription>
          </DialogHeader>

          {selectedGroup && (
            <div className="space-y-4 pt-2 text-sm">
              <div className="border-border bg-muted/20 space-y-1.5 rounded-xl border p-3.5">
                <div className="flex items-center justify-between">
                  <p className="text-foreground text-sm font-semibold">
                    {selectedGroup.userDisplayName ?? 'Anonymous User'}
                  </p>
                  {selectedGroup.workspaceId != null && (
                    <Badge variant="outline" className="font-mono text-xs">
                      Workspace {selectedGroup.workspaceId}
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground font-mono text-xs">{selectedGroup.userEmail}</p>
                <p className="text-muted-foreground pt-1 text-xs">
                  Submitted: {format(new Date(selectedGroup.submissionDate), 'MMMM d, yyyy h:mm a')}
                </p>
              </div>

              <div className="space-y-3">
                <p className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
                  Submitted Questions & Answers ({selectedGroup.items.length})
                </p>

                <div className="space-y-2.5">
                  {selectedGroup.items.map((item, idx) => {
                    const firstAnswer = item.user_answers?.[0] ?? '';
                    const isStar = firstAnswer.includes('⭐');
                    const isEmojiOnly =
                      !isStar &&
                      item.user_answers.length === 1 &&
                      /\p{Extended_Pictographic}/u.test(firstAnswer) &&
                      firstAnswer.length <= 4;

                    return (
                      <div
                        key={item.id}
                        className="border-border bg-card space-y-2 rounded-xl border p-3.5"
                      >
                        <div className="flex items-start gap-2">
                          <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-orange-500/10 text-[10px] font-bold text-[#FF4500]">
                            {idx + 1}
                          </span>
                          <p className="text-foreground text-xs leading-snug font-semibold">
                            {item.question ?? `Question ${item.questionnaire_id}`}
                          </p>
                        </div>

                        <div className="pl-7">
                          {isStar ? (
                            <div className="flex w-fit items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-1.5">
                              <span className="text-base leading-none tracking-widest text-[#FFB800]">
                                {firstAnswer}
                              </span>
                              <span className="text-xs font-bold text-amber-900 dark:text-amber-200">
                                {countStars(firstAnswer)}{' '}
                                {countStars(firstAnswer) === 1 ? 'Star' : 'Stars'}
                                {STAR_DESCRIPTIONS[countStars(firstAnswer)]
                                  ? ` — ${STAR_DESCRIPTIONS[countStars(firstAnswer)]}`
                                  : ''}
                              </span>
                            </div>
                          ) : isEmojiOnly ? (
                            <div className="flex w-fit items-center gap-2 rounded-xl border border-orange-500/20 bg-orange-500/10 px-3 py-1.5">
                              <span className="text-2xl leading-none">{firstAnswer}</span>
                              <span className="text-foreground text-xs font-semibold">Rating</span>
                            </div>
                          ) : (
                            <div className="flex flex-wrap gap-1.5">
                              {item.user_answers.map((ans, aIdx) => (
                                <div
                                  key={aIdx}
                                  className="border-border bg-background text-foreground rounded-lg border px-3 py-1 text-xs font-medium"
                                >
                                  {ans}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={selectedRawItem !== null}
        onOpenChange={(open) => !open && setSelectedRawItem(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Submission Details</DialogTitle>
            <DialogDescription>Individual question response.</DialogDescription>
          </DialogHeader>

          {selectedRawItem && (
            <div className="space-y-4 pt-2 text-sm">
              <div className="border-border bg-muted/20 space-y-1 rounded-lg border p-3">
                <p className="text-foreground font-semibold">
                  {selectedRawItem.user_display_name ?? 'Anonymous User'}
                </p>
                <p className="text-muted-foreground font-mono text-xs">
                  {selectedRawItem.user_email}
                </p>
                <p className="text-muted-foreground text-xs">
                  Workspace: {selectedRawItem.workspace_id}
                </p>
              </div>

              <div className="space-y-1.5">
                <p className="text-muted-foreground text-xs font-semibold uppercase">Question</p>
                <p className="text-foreground text-sm font-medium">
                  {selectedRawItem.question ?? `Question ${selectedRawItem.questionnaire_id}`}
                </p>
              </div>

              <div className="space-y-1.5">
                <p className="text-muted-foreground text-xs font-semibold uppercase">Answer</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedRawItem.user_answers.map((ans, idx) => {
                    if (ans.includes('⭐')) {
                      const starCount = countStars(ans);
                      return (
                        <Badge
                          key={idx}
                          variant="outline"
                          className="gap-1.5 border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-800 dark:text-amber-300"
                        >
                          <span className="text-sm leading-none tracking-wider text-[#FFB800]">
                            {ans}
                          </span>
                          <span>
                            {starCount} Star{starCount === 1 ? '' : 's'}
                            {STAR_DESCRIPTIONS[starCount]
                              ? ` — ${STAR_DESCRIPTIONS[starCount]}`
                              : ''}
                          </span>
                        </Badge>
                      );
                    }
                    return (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {ans}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
