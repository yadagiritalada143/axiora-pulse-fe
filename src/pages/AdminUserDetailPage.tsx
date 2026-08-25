import { ChevronRight, Loader2, Users } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

import { ApiErrorMessage } from '@components/common/ApiErrorMessage';
import { Button } from '@components/ui/button';
import { ROUTES } from '@constants/routes';
import { AdminUserSummaryCard, AdminUserSurveysTable } from '@features/admin/components';
import { useAdminUserSurveySummary } from '@features/admin/hooks';

export default function AdminUserDetailPage() {
  const { userId } = useParams<{ userId: string }>();
  const numericUserId = Number(userId);

  const { data, isLoading, isError, error } = useAdminUserSurveySummary(numericUserId);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <Loader2 className="text-primary size-8 animate-spin" />
        <p className="text-muted-foreground text-sm font-medium">Loading user survey summary...</p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="space-y-6">
        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <Link to={ROUTES.ADMIN_USERS} className="hover:text-foreground transition-colors">
            Users
          </Link>
          <ChevronRight className="size-4" />
          <span className="text-foreground font-medium">User #{userId}</span>
        </div>

        <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-16 text-center">
          <ApiErrorMessage error={error} />
          <Button asChild variant="outline" size="sm">
            <Link to={ROUTES.ADMIN_USERS}>Back to Users</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <nav
          aria-label="Breadcrumb"
          className="text-muted-foreground flex min-w-0 items-center gap-2 text-sm"
        >
          <Link
            to={ROUTES.ADMIN_USERS}
            className="hover:text-foreground flex shrink-0 cursor-pointer items-center gap-1.5 font-medium transition-colors"
          >
            <Users className="size-4" />
            Users
          </Link>
          <ChevronRight className="text-muted-foreground/60 size-4 shrink-0" />
          <span className="text-foreground max-w-xs truncate font-semibold sm:max-w-md">
            {data.name ? data.name : `User #${data.user_id}`}
          </span>
        </nav>

        <Button
          asChild
          variant="outline"
          size="sm"
          className="shrink-0 cursor-pointer gap-2 text-xs font-semibold"
        >
          <Link to={ROUTES.ADMIN_USERS}>
            <Users className="size-3.5" />
            Back to Users
          </Link>
        </Button>
      </div>

      <AdminUserSummaryCard summary={data} />

      <div className="border-border border-b">
        <div className="flex items-center gap-6 text-sm font-semibold">
          <button
            type="button"
            className="-mb-px flex cursor-pointer items-center gap-2 border-b-2 border-[#FF4500] pt-1 pb-3 text-[#FF4500] transition-colors"
          >
            Surveys & Responses
          </button>
        </div>
      </div>

      <AdminUserSurveysTable userId={data.user_id} userName={data.name} />
    </div>
  );
}
