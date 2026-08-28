export type Nullable<T> = T | null;
export type Maybe<T> = T | null | undefined;
export type ID = string;

export interface Timestamps {
  createdAt: string;
  updatedAt: string;
}

export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error';

/** Account-level roles aligned with backend (admin, member, viewer, owner, user). */
export type AccountRole = 'admin' | 'member' | 'viewer' | 'owner' | 'user';
