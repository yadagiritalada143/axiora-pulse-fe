import { format } from 'date-fns';
import { Eye, Loader2, Mail, MessageSquare, Search } from 'lucide-react';
import { useState } from 'react';

import { TablePagination } from '@components/common/TablePagination';
import { Badge } from '@components/ui/badge';
import { Button } from '@components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@components/ui/dialog';
import { Input } from '@components/ui/input';
import { useAdminSurveyResponses } from '@features/admin/hooks';
import { useDebouncedValue } from '@hooks/useDebouncedValue';

import { AdminResponseDetailModal } from './AdminResponseDetailModal';

const PAGE_SIZE = 10;

interface AdminSurveyResponsesModalProps {
  surveyId: number | null;
  surveyTitle?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function AdminSurveyResponsesModal({
  surveyId,
  surveyTitle,
  isOpen,
  onClose,
}: AdminSurveyResponsesModalProps) {
  const [search, setSearch] = useState('');
  const [offset, setOffset] = useState(0);
  const [selectedResponseId, setSelectedResponseId] = useState<number | null>(null);
  const debouncedSearch = useDebouncedValue(search, 300);

  const { data, isLoading, isError } = useAdminSurveyResponses(surveyId ?? 0, {
    limit: PAGE_SIZE,
    offset,
    search: debouncedSearch.trim() || undefined,
  });

  const responses = data?.responses ?? [];
  const total = data?.pagination?.total ?? 0;
  const currentOffset = data?.pagination?.offset ?? offset;
  const limit = data?.pagination?.limit ?? PAGE_SIZE;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="flex max-h-[88vh] w-[55vw] max-w-5xl flex-col overflow-hidden rounded-2xl p-0 lg:max-w-6xl">
          <DialogHeader className="border-border bg-muted/20 shrink-0 border-b p-4 pb-3 sm:p-6 sm:pb-4">
            <div className="flex flex-col gap-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400">
                  <MessageSquare className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <DialogTitle className="truncate text-base font-bold sm:text-lg">
                    Survey Responses
                  </DialogTitle>
                  <DialogDescription className="text-muted-foreground mt-0.5 truncate text-xs">
                    {surveyTitle ?? `Survey #${surveyId}`} • {total} total responses collected
                  </DialogDescription>
                </div>
              </div>

              <div className="relative w-full sm:w-72 md:w-80">
                <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                <Input
                  type="search"
                  placeholder="Search by code or email..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setOffset(0);
                  }}
                  className="h-9 rounded-xl pl-9 text-xs"
                />
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto">
            {isLoading && (
              <div className="flex flex-col items-center justify-center gap-3 py-20">
                <Loader2 className="text-primary size-8 animate-spin" />
                <p className="text-muted-foreground text-xs font-medium">Loading responses...</p>
              </div>
            )}

            {isError && (
              <div className="text-destructive py-16 text-center text-sm font-medium">
                Failed to load responses for this survey. Please try again.
              </div>
            )}

            {!isLoading && !isError && (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[580px] border-collapse text-left text-xs">
                    <thead>
                      <tr className="bg-muted/50 text-muted-foreground border-b font-semibold tracking-wider uppercase">
                        <th className="px-5 py-3 text-center">Response Code</th>
                        <th className="px-5 py-3 text-left">Respondent</th>
                        <th className="px-5 py-3 text-center">Submitted At</th>
                        <th className="px-5 py-3 text-center">Status</th>
                        <th className="px-5 py-3 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-border divide-y">
                      {responses.length === 0 ? (
                        <tr>
                          <td
                            colSpan={5}
                            className="text-muted-foreground py-16 text-center text-xs"
                          >
                            No responses collected yet for this survey.
                          </td>
                        </tr>
                      ) : (
                        responses.map((resp) => (
                          <tr
                            key={resp.id}
                            onClick={() => setSelectedResponseId(resp.id)}
                            className="hover:bg-muted/40 cursor-pointer transition-colors"
                          >
                            <td className="px-5 py-3.5 text-center">
                              <span className="text-foreground bg-muted rounded-md px-2 py-1 font-mono font-semibold">
                                {resp.response_code ? resp.response_code : `#${resp.id}`}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-left">
                              <div className="text-foreground flex items-center gap-1.5 font-medium">
                                <Mail className="text-muted-foreground size-3.5" />
                                {resp.respondent_email ?? (
                                  <span className="text-muted-foreground italic">Anonymous</span>
                                )}
                              </div>
                            </td>
                            <td className="text-muted-foreground px-5 py-3.5 text-center whitespace-nowrap">
                              {resp.submitted_at
                                ? format(new Date(resp.submitted_at), 'MMM d, yyyy HH:mm')
                                : 'N/A'}
                            </td>
                            <td className="px-5 py-3.5 text-center">
                              <div className="flex justify-center">
                                <Badge
                                  variant="default"
                                  className="h-5 border-emerald-500/20 bg-emerald-500/10 text-[10px] font-semibold text-emerald-600 hover:bg-emerald-500/20 dark:text-emerald-400"
                                >
                                  {resp.status ? resp.status : 'Completed'}
                                </Badge>
                              </div>
                            </td>
                            <td
                              className="px-5 py-3.5 text-center"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="flex justify-center">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setSelectedResponseId(resp.id)}
                                  className="text-primary hover:bg-primary/10 hover:text-primary h-8 cursor-pointer gap-1 text-xs font-semibold"
                                >
                                  <Eye className="size-3.5" />
                                  View Answers
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Numbered Pagination */}
                <TablePagination
                  total={total}
                  limit={limit}
                  offset={currentOffset}
                  onPageChange={setOffset}
                  isLoading={isLoading}
                  itemLabel="responses"
                />
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Detail Inspector Modal */}
      {selectedResponseId && (
        <AdminResponseDetailModal
          surveyId={surveyId}
          responseId={selectedResponseId}
          surveyTitle={surveyTitle}
          isOpen={Boolean(selectedResponseId)}
          onClose={() => setSelectedResponseId(null)}
        />
      )}
    </>
  );
}
