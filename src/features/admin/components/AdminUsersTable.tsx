import { format } from 'date-fns';
import { Briefcase, ChevronLeft, ChevronRight, Search, Shield, User, Users } from 'lucide-react';
import { useState } from 'react';

import { ApiErrorMessage } from '@components/common/ApiErrorMessage';
import { Loader } from '@components/common/Loader';
import { Badge } from '@components/ui/badge';
import { Button } from '@components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import { Input } from '@components/ui/input';
import { useAdminUsers } from '@features/admin/hooks';
import { useDebouncedValue } from '@hooks/useDebouncedValue';

const PAGE_SIZE = 10;

export function AdminUsersTable() {
  const [search, setSearch] = useState('');
  const [offset, setOffset] = useState(0);
  const debouncedSearch = useDebouncedValue(search, 300);

  // Dedicated query for global stats (unaffected by table pagination)
  const { data: globalStatsData, isLoading: isStatsLoading } = useAdminUsers({
    limit: 100,
    offset: 0,
  });

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

  // Use globalStatsData to ensure total Admins & Workspaces don't drop when paginating to page 2+
  const globalUsers = globalStatsData?.users ?? users;
  const adminCount = globalUsers.filter((u) => u.role === 'admin').length;
  const totalWorkspaces = globalUsers.reduce((acc, u) => acc + (u.workspace_count || 0), 0);

  const startRecord = total === 0 ? 0 : currentOffset + 1;
  const endRecord = Math.min(currentOffset + limit, total);
  const hasPrevious = currentOffset > 0;
  const hasNext = currentOffset + limit < total;

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setOffset(0);
  };

  const handlePrevPage = () => {
    if (hasPrevious) {
      setOffset(Math.max(0, currentOffset - PAGE_SIZE));
    }
  };

  const handleNextPage = () => {
    if (hasNext) {
      setOffset(currentOffset + PAGE_SIZE);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Total Users */}
        <Card className="border-border bg-card shadow-xs">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="bg-primary/10 text-primary flex size-12 shrink-0 items-center justify-center rounded-xl">
              <Users className="size-6" />
            </div>
            <div>
              <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                Total Users
              </p>
              <h3 className="text-foreground text-2xl font-bold tracking-tight">
                {isLoading || isStatsLoading ? '...' : total.toLocaleString()}
              </h3>
            </div>
          </CardContent>
        </Card>

        {/* Admins */}
        <Card className="border-border bg-card shadow-xs">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Shield className="size-6" />
            </div>
            <div>
              <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                Admins
              </p>
              <h3 className="text-foreground text-2xl font-bold tracking-tight">
                {isStatsLoading ? '...' : adminCount.toLocaleString()}
              </h3>
            </div>
          </CardContent>
        </Card>

        {/* Workspaces */}
        <Card className="border-border bg-card shadow-xs">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Briefcase className="size-6" />
            </div>
            <div>
              <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                Workspaces
              </p>
              <h3 className="text-foreground text-2xl font-bold tracking-tight">
                {isStatsLoading ? '...' : totalWorkspaces.toLocaleString()}
              </h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
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
                Manage system users, role assignments, and workspace counts.
              </p>
            </div>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              type="search"
              placeholder="Search by name or username..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9 text-sm"
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
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="bg-muted/50 text-muted-foreground border-b text-xs font-semibold tracking-wider uppercase">
                      <th className="px-4 py-3">User</th>
                      <th className="px-4 py-3">Role</th>
                      <th className="px-4 py-3">Workspaces</th>
                      <th className="px-4 py-3">Joined Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-border divide-y">
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-muted-foreground py-12 text-center">
                          No users found matching your query.
                        </td>
                      </tr>
                    ) : (
                      users.map((user) => (
                        <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3">
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
                          <td className="px-4 py-3">
                            {user.role === 'admin' ? (
                              <Badge
                                variant="default"
                                className="gap-1 bg-purple-600 hover:bg-purple-700"
                              >
                                <Shield className="size-3" />
                                Admin
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="gap-1">
                                <User className="size-3" />
                                {user.role}
                              </Badge>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant="outline" className="font-mono text-xs">
                              {user.workspace_count}{' '}
                              {user.workspace_count === 1 ? 'workspace' : 'workspaces'}
                            </Badge>
                          </td>
                          <td className="text-muted-foreground px-4 py-3 text-xs whitespace-nowrap">
                            {user.created_at
                              ? format(new Date(user.created_at), 'MMM d, yyyy')
                              : 'N/A'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination controls */}
              <div className="flex flex-col items-center justify-between gap-4 border-t px-4 py-4 sm:flex-row sm:px-6">
                <p className="text-muted-foreground text-xs">
                  Showing <span className="text-foreground font-medium">{startRecord}</span> to{' '}
                  <span className="text-foreground font-medium">{endRecord}</span> of{' '}
                  <span className="text-foreground font-medium">{total}</span> users
                </p>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrevPage}
                    disabled={!hasPrevious || isLoading}
                    className="gap-1 text-xs"
                  >
                    <ChevronLeft className="size-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={!hasNext || isLoading}
                    className="gap-1 text-xs"
                  >
                    Next
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
