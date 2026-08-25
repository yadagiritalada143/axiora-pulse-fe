import { format } from 'date-fns';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Copy,
  FileText,
  Hash,
  Loader2,
  Mail,
  User,
} from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@components/ui/badge';
import { Button } from '@components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@components/ui/dialog';
import { useAdminSurveyResponseDetail } from '@features/admin/hooks';

interface AdminResponseDetailModalProps {
  surveyId: number | null;
  responseId: number | null;
  surveyTitle?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function AdminResponseDetailModal({
  surveyId,
  responseId,
  surveyTitle,
  isOpen,
  onClose,
}: AdminResponseDetailModalProps) {
  const {
    data: response,
    isLoading,
    isError,
  } = useAdminSurveyResponseDetail(surveyId ?? 0, responseId ?? 0);

  const handleCopyCode = (code: string) => {
    void navigator.clipboard.writeText(code);
    toast.success('Response code copied to clipboard.');
  };

  const formatAnswerValue = (val: unknown) => {
    if (val === null || val === undefined || val === '') {
      return <span className="text-muted-foreground text-xs italic">No response provided</span>;
    }
    if (typeof val === 'boolean') {
      return (
        <Badge
          variant={val ? 'default' : 'secondary'}
          className={
            val
              ? 'border-emerald-500/20 bg-emerald-500/10 text-xs font-semibold text-emerald-600 dark:text-emerald-400'
              : 'bg-muted text-muted-foreground text-xs font-semibold'
          }
        >
          {val ? 'Yes' : 'No'}
        </Badge>
      );
    }
    if (Array.isArray(val)) {
      return (
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {val.map((item, idx) => (
            <span
              key={idx}
              className="bg-primary/10 text-primary border-primary/20 inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-medium"
            >
              {typeof item === 'object' && item !== null ? JSON.stringify(item) : String(item)}
            </span>
          ))}
        </div>
      );
    }
    if (typeof val === 'object') {
      return (
        <pre className="bg-muted/60 text-foreground border-border overflow-x-auto rounded-xl border p-3 font-mono text-xs">
          {JSON.stringify(val, null, 2)}
        </pre>
      );
    }
    if (typeof val === 'string' || typeof val === 'number') {
      return (
        <div className="bg-muted/40 border-border/60 text-foreground rounded-lg border p-3 text-sm leading-relaxed font-medium whitespace-pre-wrap">
          {String(val)}
        </div>
      );
    }
    return (
      <div className="bg-muted/40 border-border/60 text-foreground rounded-lg border p-3 text-sm leading-relaxed font-medium whitespace-pre-wrap">
        {JSON.stringify(val)}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex max-h-[88vh] max-w-2xl flex-col overflow-hidden rounded-2xl p-0 shadow-xl">
        <DialogHeader className="border-border bg-muted/30 shrink-0 border-b p-5 pb-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground size-8 cursor-pointer rounded-lg p-0"
                aria-label="Back to responses"
              >
                <ArrowLeft className="size-4" />
              </Button>
              <div className="flex size-9 items-center justify-center rounded-xl bg-orange-500/10 font-semibold text-orange-600 dark:text-orange-400">
                <FileText className="size-4" />
              </div>
              <div>
                <DialogTitle className="text-foreground text-base font-bold">
                  Response Details
                </DialogTitle>
                <DialogDescription className="text-muted-foreground mt-0.5 text-xs">
                  {surveyTitle ?? response?.workspace_name ?? 'Survey Response'}
                </DialogDescription>
              </div>
            </div>

            {response?.response_code && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopyCode(response.response_code)}
                className="h-8 cursor-pointer gap-1.5 font-mono text-xs"
              >
                <Copy className="size-3" />
                {response.response_code}
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 space-y-6 overflow-y-auto p-6">
          {isLoading && (
            <div className="flex flex-col items-center justify-center gap-3 py-20">
              <Loader2 className="text-primary size-8 animate-spin" />
              <p className="text-muted-foreground text-xs font-medium">
                Loading response details...
              </p>
            </div>
          )}

          {isError && (
            <div className="text-destructive py-16 text-center text-sm font-medium">
              Failed to load survey response detail. Please try again.
            </div>
          )}

          {!isLoading && !isError && response && (
            <>
              <div className="bg-muted/40 border-border grid grid-cols-2 gap-3 rounded-xl border p-4 text-xs sm:grid-cols-4">
                <div className="space-y-1">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Hash className="size-3" />
                    Code
                  </span>
                  <p className="text-foreground truncate font-mono font-bold">
                    {response.response_code ? response.response_code : `#${response.id}`}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Mail className="size-3" />
                    Respondent
                  </span>
                  <p className="text-foreground truncate font-medium">
                    {response.respondent_email ?? (
                      <span className="text-muted-foreground flex items-center gap-1 italic">
                        <User className="size-3" /> Anonymous
                      </span>
                    )}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Calendar className="size-3" />
                    Submitted
                  </span>
                  <p className="text-foreground font-medium">
                    {response.submitted_at
                      ? format(new Date(response.submitted_at), 'MMM d, yyyy HH:mm')
                      : 'N/A'}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <CheckCircle2 className="size-3" />
                    Status
                  </span>
                  <Badge
                    variant="default"
                    className="h-5 border-emerald-500/20 bg-emerald-500/10 text-[10px] font-semibold text-emerald-600 hover:bg-emerald-500/20 dark:text-emerald-400"
                  >
                    {response.status ? response.status : 'Completed'}
                  </Badge>
                </div>
              </div>

              {/* Answers preview list */}
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
                    Questions & Responses ({response.answers_preview?.length ?? 0})
                  </h3>
                </div>

                {response.answers_preview && response.answers_preview.length > 0 ? (
                  <div className="space-y-3">
                    {response.answers_preview.map((item, index) => (
                      <div
                        key={index}
                        className="border-border bg-card hover:border-primary/30 space-y-2.5 rounded-xl border p-4 shadow-2xs transition-colors"
                      >
                        <div className="flex items-start gap-2.5">
                          <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-orange-500/10 text-[10px] font-bold text-orange-600 dark:text-orange-400">
                            {index + 1}
                          </span>
                          <p className="text-foreground text-xs leading-relaxed font-semibold">
                            {item.question}
                          </p>
                        </div>
                        <div className="pl-7">{formatAnswerValue(item.answer)}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-muted-foreground bg-muted/20 border-border rounded-xl border py-12 text-center text-xs">
                    No answered questions recorded in this response.
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
