import { Menu } from 'lucide-react';
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
import { useCurrentUser, useLogout } from '@features/auth/hooks';
import { useUserDetails } from '@features/settings/hooks/useUserDetails';
import { useAuthStore } from '@store/auth.store';
import { useUIStore } from '@store/ui.store';
import { getDisplayName, getUserInitial } from '@utils/user';

interface NavbarProps {
  onSearch?: (query: string) => void;
  actions?: ReactNode;
}

export function Navbar({ onSearch, actions }: NavbarProps) {
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);
  const { data: currentUser } = useCurrentUser();
  const { data: userDetails } = useUserDetails();
  const storeUser = useAuthStore((state) => state.user);
  const user = currentUser ?? storeUser;
  const rawAvatar =
    currentUser !== undefined
      ? currentUser?.avatarUrl
      : (storeUser?.avatarUrl ?? storeUser?.avatar_url);
  const avatarSrc =
    rawAvatar && typeof rawAvatar === 'string' && rawAvatar.trim() !== '' ? rawAvatar : undefined;
  const displayName = getDisplayName(user, userDetails);
  const userInitial = getUserInitial(displayName, user);
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

        {/* <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell className="size-4" />
        </Button> */}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="cursor-pointer gap-2 px-2">
              <Avatar className="size-7">
                <AvatarImage src={avatarSrc} alt="" />
                <AvatarFallback>{userInitial}</AvatarFallback>
              </Avatar>
              <span className="text-foreground hidden text-sm font-semibold sm:inline">
                {displayName}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
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
