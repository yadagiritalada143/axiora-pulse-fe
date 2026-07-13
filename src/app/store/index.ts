/**
 * App-level barrel for store access. Actual Zustand slices live in `@store/*`;
 * this re-export exists so app-shell code (`@app/*`) never reaches past its
 * own layer boundary into `@store` directly.
 */
export * from '@store/index';
