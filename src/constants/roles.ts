export const ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MEMBER: 'member',
  VIEWER: 'viewer',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

/** Higher index = more privileged. Used for role hierarchy checks. */
export const ROLE_HIERARCHY: Role[] = [ROLES.VIEWER, ROLES.MEMBER, ROLES.ADMIN, ROLES.OWNER];

export function roleAtLeast(role: Role, minimumRole: Role): boolean {
  return ROLE_HIERARCHY.indexOf(role) >= ROLE_HIERARCHY.indexOf(minimumRole);
}
