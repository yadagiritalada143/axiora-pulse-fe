import { ROLE_HIERARCHY, ROLES, roleAtLeast } from '@constants/roles';

describe('roles', () => {
  it('exposes the role values', () => {
    expect(ROLES).toEqual({
      OWNER: 'owner',
      ADMIN: 'admin',
      MEMBER: 'member',
      VIEWER: 'viewer',
    });
  });

  it('orders the hierarchy from least to most privileged', () => {
    expect(ROLE_HIERARCHY).toEqual(['viewer', 'member', 'admin', 'owner']);
  });

  it('returns true when the role meets or exceeds the minimum', () => {
    expect(roleAtLeast('admin', 'member')).toBe(true);
    expect(roleAtLeast('owner', 'owner')).toBe(true);
  });

  it('returns false when the role is below the minimum', () => {
    expect(roleAtLeast('viewer', 'owner')).toBe(false);
  });
});
