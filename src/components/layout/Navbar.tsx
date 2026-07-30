import { Bell, Menu } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { Search } from '@components/common/Search';
import { Avatar, AvatarFallback, AvatarImage } from '@components/ui/avatar';
import { Button } from '@components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@components/ui/dropdown-menu';
import { ROUTES } from '@constants/routes';
import { useLogout } from '@features/auth/hooks';
import { useAuthStore } from '@store/auth.store';
import { useUIStore } from '@store/ui.store';

interface NavbarProps {
  onSearch?: (query: string) => void;
  actions?: ReactNode;
}

export function Navbar({ onSearch, actions }: NavbarProps) {
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);
  const user = useAuthStore((state) => state.user);
  const logout = useLogout();

  return (
    <header className="border-border bg-background flex h-16 items-center gap-4 border-b px-4">
      <Button variant="ghost" size="icon" onClick={toggleSidebar} aria-label="Toggle sidebar">
        <Menu className="size-4" />
      </Button>

      {onSearch ? (
        <Search onSearch={onSearch} className="max-w-sm flex-1" />
      ) : (
        <div className="flex-1" />
      )}

      <div className="flex items-center gap-2">
        {actions}

        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell className="size-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 px-2">
              <Avatar className="size-7">
                <AvatarImage src={user?.avatarUrl ?? undefined} alt="" />
                <AvatarFallback>{(user?.name ?? 'U').charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="hidden text-sm font-medium sm:inline">
                {user?.name ?? 'Account'}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link to={ROUTES.PROFILE}>Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to={ROUTES.SETTINGS}>Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onSelect={() => void logout()}>
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
