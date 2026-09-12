import { format } from 'date-fns';
import {
  Calendar,
  CheckCircle2,
  ClipboardList,
  Loader2,
  MessageSquare,
  MoreVertical,
  ShieldAlert,
  XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Badge } from '@components/ui/badge';
import { Button } from '@components/ui/button';
import { Card, CardContent } from '@components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@components/ui/dropdown-menu';
import { ROUTES } from '@constants/routes';
import { useAdminDeleteUser, useAdminSetUserStatus } from '@features/admin/hooks';
import type { AdminUserSurveySummaryResponse } from '@features/admin/types';

import { DeleteUserDialog } from './DeleteUserDialog';

interface AdminUserSummaryCardProps {
  summary: AdminUserSurveySummaryResponse;
}

export function AdminUserSummaryCard({ summary }: AdminUserSummaryCardProps) {
  const navigate = useNavigate();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const setStatusMutation = useAdminSetUserStatus();
  const deleteUserMutation = useAdminDeleteUser();

  const handleStatusChange = (newStatus: 'Active' | 'Inactive') => {
    setStatusMutation.mutate({
      userId: summary.user_id,
      payload: { profile_status: newStatus },
    });
  };

  const handleDeleteConfirm = () => {
    deleteUserMutation.mutate(summary.user_id, {
      onSuccess: () => {
        setIsDeleteDialogOpen(false);
        void navigate(ROUTES.ADMIN_USERS, { replace: true });
      },
    });
  };

  const initials = summary.name
    ? summary.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : summary.email
      ? summary.email[0]?.toUpperCase()
      : 'U';

  const currentStatus = summary.status ?? 'Active';
  const isActive = currentStatus.toLowerCase() === 'active';
  const isSuspended = currentStatus.toLowerCase() === 'suspended';

  const joinedDateFormatted = summary.joined_on
    ? format(new Date(summary.joined_on), 'MMMM d, yyyy')
    : 'N/A';

  return (
    <>
      <Card className="border-border bg-card overflow-hidden shadow-xs">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 flex-1 items-center gap-3 sm:items-start sm:gap-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-orange-500/10 text-base font-bold text-orange-600 ring-1 ring-orange-500/20 sm:size-14 sm:text-lg dark:text-orange-400">
                {initials}
              </div>

              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-foreground truncate text-lg font-bold tracking-tight sm:text-xl">
                    {summary.name || 'User'}
                  </h1>
                  <Badge
                    variant={isActive ? 'default' : 'secondary'}
                    className={
                      isActive
                        ? 'shrink-0 gap-1.5 border-emerald-500/20 bg-emerald-500/10 text-xs font-medium text-emerald-600 hover:bg-emerald-500/20 dark:text-emerald-400'
                        : isSuspended
                          ? 'shrink-0 gap-1.5 border-red-500/20 bg-red-500/10 text-xs font-medium text-red-600 hover:bg-red-500/20 dark:text-red-400'
                          : 'bg-muted text-muted-foreground shrink-0 gap-1.5 text-xs font-medium'
                    }
                  >
                    {setStatusMutation.isPending ? (
                      <Loader2 className="size-3 animate-spin" />
                    ) : (
                      <span
                        className={`size-1.5 rounded-full ${
                          isActive
                            ? 'bg-emerald-500'
                            : isSuspended
                              ? 'bg-red-500'
                              : 'bg-muted-foreground'
                        }`}
                      />
                    )}
                    {currentStatus}
                  </Badge>
                </div>

                <p className="text-muted-foreground truncate text-xs font-medium sm:text-sm">
                  {summary.email}
                </p>
              </div>
            </div>

            <div className="shrink-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-8 cursor-pointer rounded-lg sm:size-9"
                    aria-label="User Options"
                  >
                    <MoreVertical className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuLabel className="text-muted-foreground text-xs">
                    Update Account Status
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    disabled={setStatusMutation.isPending}
                    onClick={() => handleStatusChange('Active')}
                    className="cursor-pointer gap-2"
                  >
                    <CheckCircle2 className="size-4 text-emerald-500" />
                    Set as Active
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    disabled={setStatusMutation.isPending}
                    onClick={() => handleStatusChange('Inactive')}
                    className="cursor-pointer gap-2"
                  >
                    <XCircle className="size-4 text-amber-500" />
                    Set as Inactive
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    disabled={deleteUserMutation.isPending}
                    onClick={() => setIsDeleteDialogOpen(true)}
                    className="text-destructive focus:text-destructive cursor-pointer gap-2"
                  >
                    <ShieldAlert className="text-destructive size-4" />
                    Suspend Account
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="border-border mt-6 grid grid-cols-1 gap-4 border-t pt-6 sm:grid-cols-3">
            <div className="flex items-center gap-3">
              <div className="bg-muted text-muted-foreground flex size-10 shrink-0 items-center justify-center rounded-xl">
                <Calendar className="size-5" />
              </div>
              <div>
                <p className="text-muted-foreground text-xs font-medium">Joined on</p>
                <p className="text-foreground text-sm font-bold">{joinedDateFormatted}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400">
                <ClipboardList className="size-5" />
              </div>
              <div>
                <p className="text-muted-foreground text-xs font-medium">Surveys Created</p>
                <p className="text-foreground text-sm font-bold">
                  {summary.surveys_created.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <MessageSquare className="size-5" />
              </div>
              <div>
                <p className="text-muted-foreground text-xs font-medium">Total Responses</p>
                <p className="text-foreground text-sm font-bold">
                  {summary.total_responses.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <DeleteUserDialog
        open={isDeleteDialogOpen}
        loading={deleteUserMutation.isPending}
        userName={summary.name}
        userEmail={summary.email}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}
