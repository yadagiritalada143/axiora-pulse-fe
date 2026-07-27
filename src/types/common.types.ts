export type Nullable<T> = T | null;
export type Maybe<T> = T | null | undefined;
export type ID = string;

export interface Timestamps {
  createdAt: string;
  updatedAt: string;
}

export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error';

/** Account-level role returned by auth endpoints. Only 'user' and 'admin' exist for now. */
export type AccountRole = 'user' | 'admin';
