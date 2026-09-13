export interface UserLike {
  name?: string | null;
  email?: string | null;
  firstName?: string | null;
  first_name?: string | null;
  lastName?: string | null;
  last_name?: string | null;
}

export interface UserDetailsLike {
  first_name?: string | null;
  last_name?: string | null;
}

export function getDisplayName(
  user?: UserLike | null,
  userDetails?: UserDetailsLike | null,
): string {
  const firstName =
    userDetails?.first_name?.trim() ?? user?.firstName?.trim() ?? user?.first_name?.trim();
  const lastName =
    userDetails?.last_name?.trim() ?? user?.lastName?.trim() ?? user?.last_name?.trim();

  const fullName = [firstName, lastName].filter(Boolean).join(' ').trim();
  if (fullName) return fullName;

  const name = user?.name?.trim();
  if (name) return name;

  const emailPrefix = user?.email?.split('@')[0]?.trim();
  if (emailPrefix) return emailPrefix;

  return 'Account';
}

export function getUserInitial(
  displayName: string,
  user?: { email?: string | null } | null,
): string {
  if (displayName && displayName !== 'Account') {
    return displayName.charAt(0).toUpperCase();
  }
  if (user?.email?.trim()) {
    return user.email.trim().charAt(0).toUpperCase();
  }
  return 'U';
}
