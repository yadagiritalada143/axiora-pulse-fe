import { format } from 'date-fns';
import {
  CheckCircle2,
  ChevronRightIcon,
  MoreVertical,
  Search,
  Shield,
  ShieldAlert,
  User,
  Users,
  XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ApiErrorMessage } from '@components/common/ApiErrorMessage';
import { Loader } from '@components/common/Loader';
import { TablePagination } from '@components/common/TablePagination';
import { Badge } from '@components/ui/badge';
import { Button } from '@components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@components/ui/dropdown-menu';
import { Input } from '@components/ui/input';
import { buildAdminUserDetailRoute } from '@constants/routes';
import { useAdminDeleteUser, useAdminSetUserStatus, useAdminUsers } from '@features/admin/hooks';
import { useDebouncedValue } from '@hooks/useDebouncedValue';

import { DeleteUserDialog } from './DeleteUserDialog';

const PAGE_SIZE = 10;

export function AdminUsersTable() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [offset, setOffset] = useState(0);
  const [userToDelete, setUserToDelete] = useState<{
    id: number;
    name?: string;
    email?: string;
  } | null>(null);

  const deleteUserMutation = useAdminDeleteUser();
  const setStatusMutation = useAdminSetUserStatus();
  const debouncedSearch = useDebouncedValue(search, 300);

  // Query for paginated & filtered table rows
  const { data, isLoading, isError, error } = useAdminUsers({
    limit: PAGE_SIZE,
    offset,
    search: debouncedSearch.trim() || undefined,
  });

  const users = data?.users ?? [];
  const total = data?.pagination?.total ?? 0;
  const currentOffset = data?.pagination?.offset ?? offset;
  const limit = data?.pagination?.limit ?? PAGE_SIZE;

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setOffset(0);
  };

  const handleRowClick = (userId: number) => {
    void navigate(buildAdminUserDetailRoute(userId));
  };

  const handleDeleteConfirm = () => {
    if (!userToDelete) return;
    deleteUserMutation.mutate(userToDelete.id, {
      onSuccess: () => setUserToDelete(null),
    });
  };

  const handleSetStatus = (userId: number, profile_status: 'Active' | 'Inactive' | 'Suspended') => {
    setStatusMutation.mutate({ userId, payload: { profile_status } });
  };

  return (
    <div className="space-y-6">
      <Card className="border-border bg-card shadow-xs">
        <CardHeader className="flex flex-col gap-4 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-xl">
              <Users className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-xl font-bold">Users Management</CardTitle>
              </div>
              <p className="text-muted-foreground mt-0.5 text-xs">
                Manage system users, view created surveys, and inspect survey responses.
              </p>
            </div>
          </div>

          <div className="relative w-full sm:w-80 md:w-96">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              type="search"
              placeholder="Search by name or username..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="h-10 rounded-xl pl-9 text-sm"
            />
          </div>
        </CardHeader>

        <CardContent className="p-0 sm:p-6 sm:pt-0">
          {isLoading && <Loader label="Loading users..." className="py-12" />}

          {isError && (
            <div className="px-6 py-4">
              <ApiErrorMessage error={error} />
            </div>
          )}

          {!isLoading && !isError && (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[620px] border-collapse text-left text-sm sm:min-w-0">
                  <thead className="bg-muted/95 sticky top-0 z-10 border-b backdrop-blur-xs">
                    <tr className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                      <th className="px-4 py-3.5 text-left">User</th>
                      <th className="px-4 py-3.5 text-center">Role</th>
                      <th className="px-4 py-3.5 text-center">Workspaces</th>
                      <th className="px-4 py-3.5 text-center">Joined Date</th>
                      <th className="px-4 py-3.5 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-border divide-y">
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-muted-foreground py-12 text-center text-xs">
                          No users found matching your query.
                        </td>
                      </tr>
                    ) : (
                      users.map((user) => (
                        <tr
                          key={user.id}
                          onClick={() => handleRowClick(user.id)}
                          className="hover:bg-muted/40 cursor-pointer transition-colors"
                        >
                          <td className="px-4 py-3 text-left">
                            <div className="flex items-center gap-3">
                              <div className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
                                {user.display_name
                                  ? user.display_name.charAt(0).toUpperCase()
                                  : user.username.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className="text-foreground truncate font-medium">
                                  {user.display_name || user.username}
                                </p>
                                <p className="text-muted-foreground truncate text-xs">
                                  @{user.username}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex justify-center">
                              {user.role === 'admin' ? (
                                <Badge
                                  variant="default"
                                  className="gap-1 bg-purple-600 font-medium hover:bg-purple-700"
                                >
                                  <Shield className="size-3" />
                                  Admin
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="gap-1 font-medium">
                                  <User className="size-3" />
                                  {user.role}
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Badge variant="outline" className="font-mono text-xs font-medium">
                              {user.workspace_count}{' '}
                              {user.workspace_count === 1 ? 'workspace' : 'workspaces'}
                            </Badge>
                          </td>
                          <td className="text-muted-foreground px-4 py-3 text-center text-xs whitespace-nowrap">
                            {user.created_at
                              ? format(new Date(user.created_at), 'MMM d, yyyy')
                              : 'N/A'}
                          </td>
                          <td
                            className="px-4 py-3 text-center"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex items-center justify-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRowClick(user.id)}
                                className="text-primary hover:bg-primary/10 hover:text-primary h-8 cursor-pointer gap-1 text-xs font-semibold"
                              >
                                View Details
                                <ChevronRightIcon className="size-3.5" />
                              </Button>

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-muted-foreground hover:text-foreground size-8 cursor-pointer rounded-lg"
                                    aria-label="User Options"
                                  >
                                    <MoreVertical className="size-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                  <DropdownMenuLabel className="text-muted-foreground text-xs">
                                    Status
                                  </DropdownMenuLabel>
                                  <DropdownMenuItem
                                    disabled={setStatusMutation.isPending}
                                    onClick={() => handleSetStatus(user.id, 'Active')}
                                    className="cursor-pointer gap-2"
                                  >
                                    <CheckCircle2 className="size-4 text-emerald-500" />
                                    Set as Active
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    disabled={setStatusMutation.isPending}
                                    onClick={() => handleSetStatus(user.id, 'Inactive')}
                                    className="cursor-pointer gap-2"
                                  >
                                    <XCircle className="size-4 text-amber-500" />
                                    Set as Inactive
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    disabled={user.role === 'admin' || deleteUserMutation.isPending}
                                    onClick={() =>
                                      setUserToDelete({
                                        id: user.id,
                                        name: user.display_name || user.username,
                                        email: user.username,
                                      })
                                    }
                                    className="text-destructive focus:text-destructive cursor-pointer gap-2"
                                  >
                                    <ShieldAlert className="text-destructive size-4" />
                                    Suspend Account
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
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
                itemLabel="users"
              />
            </>
          )}
        </CardContent>
      </Card>

      <DeleteUserDialog
        open={Boolean(userToDelete)}
        onOpenChange={(open) => {
          if (!open) setUserToDelete(null);
        }}
        userName={userToDelete?.name}
        userEmail={userToDelete?.email}
        loading={deleteUserMutation.isPending}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
