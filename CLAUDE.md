# CLAUDE.md — Axiora Pulse Frontend

Permanent project memory for Claude Code (or any engineer) working in this repo. Read this before making structural changes. It should let you understand the codebase without having to scan every file.

## 1. Project overview

Axiora Pulse is an **AI Workspace** frontend: users describe a startup idea and interact with an AI co-founder through chat, structured forms, and workflow screens (onboarding, pricing, dashboard, workspace). This repo is **frontend only** — it talks to a REST backend that already exists over HTTP; there is no server code here.

The codebase is built to scale from a handful of screens to a large SaaS product with hundreds of screens, without needing an architecture rewrite along the way.

## 2. Tech stack & why

| Concern | Choice | Why |
|---|---|---|
| Build tool | Vite | Fast dev server, native ESM, first-class React plugin |
| Language | TypeScript (strict) | Type safety across a growing codebase |
| Routing | React Router v7 (`createBrowserRouter`, data APIs) | Nested layouts, loaders/actions-ready, code-splitting via lazy routes |
| Styling | Tailwind CSS v4 (CSS-first config) + CSS variables | No `tailwind.config.js` needed — theme lives in `src/styles/globals.css` via `@theme inline`; variables give free dark mode |
| Components | shadcn/ui (New York style, Radix primitives) | Copy-in components you own and can modify, not a black-box dependency |
| Icons | lucide-react | Matches shadcn/ui conventions |
| Animation | framer-motion | Installed and ready; use for page/element transitions |
| Forms | React Hook Form + Zod (`@hookform/resolvers/zod`) | Uncontrolled-first perf, schema-driven validation shared with types |
| Client state | Zustand | Minimal boilerplate, no context/provider needed, great for cross-cutting UI/session state |
| Server state | TanStack Query v5 | Caching, retries, invalidation, devtools — **never** duplicate server data in Zustand |
| HTTP | Axios | Interceptors for auth/refresh, request cancellation via `AbortSignal` |
| Dates | date-fns | Tree-shakeable, immutable |
| Class utilities | clsx + tailwind-merge (via `cn()` in `@lib/utils`) + class-variance-authority | Standard shadcn/ui pattern |
| Notifications | Sonner | Toasts for mutation success/error |
| Testing | Jest + React Testing Library + jest-dom + user-event | Unit/component tests, run via Babel (not ts-jest) for speed |

**Versions**: this project was scaffolded against React 19, Vite 8, TypeScript 6, Tailwind 4, React Router 7, TanStack Query 5, Zod 4, Zustand 5. Check `package.json` for the exact installed versions before assuming API shape (especially Zod 4's `z.email()` top-level validators instead of `z.string().email()`).

## 3. Folder structure & responsibilities

```
src/
  app/                  # Composition root — nothing here is a "feature"
    router/             # createBrowserRouter tree, route guards, lazy-loading helper
    providers/           # ThemeProvider, QueryProvider, AuthProvider, AppProviders (composes all)
    store/               # Barrel re-export of @store (keeps app/ from importing across layers awkwardly)
    query/               # queryClient.ts — QueryClient instance, cache-level error logging
    layouts/             # PublicLayout, AuthLayout, DashboardLayout, ErrorLayout
    App.tsx              # ErrorBoundary + AppProviders + RouterProvider

  assets/                # Static images/icons/fonts (fonts/icons/images currently placeholders)

  components/
    common/              # Cross-feature, generic: PageHeader, Loader, ErrorBoundary, NotFound,
                          # ApiErrorMessage, FormError, Search, Pagination, AppBreadcrumb
    ui/                  # shadcn/ui primitives — vendored, not hand-maintained (see §8)
    forms/               # Reserved for shared form primitives beyond shadcn's <Form> (currently empty)
    chat/                # ChatBubble, AIMessage, UserMessage, MarkdownRenderer, TypingIndicator,
                          # ChatInput, ChatLoader, ConversationList, ModelSelector
    layout/              # Sidebar, Navbar (app-shell chrome, not page content)

  features/              # Business logic, grouped by domain. Each feature owns its hooks/ and components/
    auth/                 # LoginForm, RegisterForm, ForgotPasswordForm, ResetPasswordForm + mutation hooks
    onboarding/           # Reserved for the guided "describe your idea" flow (not yet built)
    pricing/              # PricingPlans, PricingPlanCard + usePricingPlans query hook
    workspace/            # WorkspaceList + useWorkspaces query hook
    ai/                   # ChatWindow + useConversations/useMessages/useSendMessage/useModels hooks
    settings/             # ProfileForm + useUpdateProfile mutation hook

  hooks/                 # Cross-feature hooks: useTheme, useDebouncedValue, useMediaQuery,
                          # useLocalStorage, useClickOutside

  services/               # All I/O. Nothing outside services/ should call axios directly.
    api/                  # apiClient (axios instance), interceptors, error normalization,
                          # token manager, refresh queue, cancellation helper, authEvents pub/sub
    auth/                 # authService — login/register/logout/forgot/reset/me
    chat/                 # chatService — conversations/messages/models + SSE streaming client
    billing/              # billingService — plans/subscribe

  lib/                   # Framework-adjacent utilities tightly coupled to a library (currently: cn() for Tailwind)

  types/                 # Shared TypeScript types: api.types, chat.types, common.types,
                          # error.types (+ ApiRequestError class), pagination.types, response.types, global.d.ts

  utils/                 # Pure, framework-agnostic helpers: date, storage, logger, clipboard, timing, file

  constants/              # routes.ts, roles.ts, api.ts (endpoints + HTTP status), queryKeys.ts,
                          # storage.ts, theme.ts — the "no magic strings" layer

  config/                 # env.ts (reads import.meta.env, coerces booleans), app.config.ts (derived config)

  styles/                 # globals.css — Tailwind v4 import + CSS variables (light/dark) + @theme mapping

  pages/                  # Route-level components. Thin: compose feature components + layout content.
                          # Default-exported (required for React.lazy in the router)

  routes/                 # Reserved for React Router v7 route modules (loaders/actions) if/when routes
                          # need data-loading before render instead of TanStack Query in the component

  schemas/                # Zod schemas + inferred form types: auth.schema.ts, profile.schema.ts

  store/                  # Zustand slices: auth, theme, chat, app, ui (client state ONLY, see §6)

  tests/                  # Organized to mirror source: components/, hooks/, utils/, pages/
```

## 4. Architecture principles

1. **Server state vs. client state is a hard line.** TanStack Query owns anything that comes from the backend (conversations, messages, plans, workspaces, user profile). Zustand owns UI/session state that has no server source of truth (active conversation id, sidebar open/closed, theme preference, draft message text). Never cache API responses in a Zustand store "for convenience."
2. **Services are the only place that imports axios.** Feature hooks call `services/*`, never `apiClient` directly (small exception: simple one-off queries in a feature's `hooks/` file may call `apiClient` inline for endpoints too small to warrant a dedicated service module — see `features/workspace/hooks/useWorkspaces.ts` — but anything with more than one operation belongs in `services/`).
3. **The axios layer doesn't know about React.** `services/api/client.ts` and friends never import Zustand stores or React Router. Session-expiry is broadcast through `authEvents` (a tiny pub/sub in `services/api/authEvents.ts`); `AuthProvider` is the one place that subscribes and reacts. This keeps the HTTP layer testable and reusable outside React.
4. **Pages are thin.** A page in `src/pages/` composes layout + one or two feature components. Business logic (data fetching, mutations, validation) lives in `features/<domain>/hooks` and `features/<domain>/components`, not in the page file.
5. **Routes are lazy by default.** Every route in `app/router/index.tsx` goes through `lazyPage()` (wraps `React.lazy` + a shared `<Suspense fallback={<PageLoader />}>`), so route-level code-splitting is automatic — you don't opt into it per page.
6. **shadcn/ui files are vendored, not authored.** Files under `components/ui/` come from the shadcn CLI (`npx shadcn@latest add <component>`). Don't hand-edit them beyond what's necessary to fix an alias/import (e.g. the `sonner.tsx` wrapper was patched to use our own `useTheme` instead of `next-themes`, since this is a Vite app, not Next.js). If you need to change shadcn's output, prefer re-running the CLI with `--overwrite` and re-applying the same patch.
7. **No `@types` path alias.** TypeScript hard-blocks explicit imports from any specifier starting with `@types/` (it's reserved for the DefinitelyTyped npm scope). Shared types live in `src/types/*` and are imported via the root `@/*` alias, e.g. `import type { ChatMessage } from '@/types/chat.types'`.

## 5. Path aliases

Configured in **three** places that must stay in sync: `tsconfig.app.json` (+ mirrored in root `tsconfig.json` for tools that don't resolve project references), `vite.config.ts` (`resolve.alias`), and `jest.config.cjs` (`moduleNameMapper`).

| Alias | Path |
|---|---|
| `@/*` | `src/*` |
| `@app/*` | `src/app/*` |
| `@components/*` | `src/components/*` |
| `@features/*` | `src/features/*` |
| `@services/*` | `src/services/*` |
| `@hooks/*` | `src/hooks/*` |
| `@utils/*` | `src/utils/*` |
| `@lib/*` | `src/lib/*` |
| `@config/*` | `src/config/*` |
| `@assets/*` | `src/assets/*` |
| `@styles/*` | `src/styles/*` |
| `@constants/*` | `src/constants/*` |
| `@schemas/*` | `src/schemas/*` |
| `@store/*` | `src/store/*` |
| `@pages/*` | `src/pages/*` |
| `@routes/*` | `src/routes/*` |

Types are imported via `@/types/*` (see §4.7 for why there's no `@types` alias).

## 6. State management rules

- **Zustand stores** (`src/store/*.store.ts`): `auth`, `theme`, `app`, `ui`, `chat`. Each is a single `create()` call, actions colocated with state, no cross-store imports except where explicitly justified (e.g. `auth.store.ts` calls `tokenManager` from the services layer to keep tokens and the reactive `user` mirror in sync).
- `auth.store` persists only `{ user, isAuthenticated }`. Raw tokens are **not** in Zustand state — they live in `localStorage` via `services/api/tokenManager.ts`, because the axios interceptors need to read them outside of React, and because mixing a persisted token string into the same persisted blob as reactive UI state is a footgun (don't reintroduce `accessToken`/`refreshToken` fields to `AuthState`).
- **TanStack Query** owns everything server-derived. Query keys are centralized in `src/constants/queryKeys.ts` — add new keys there, don't inline array literals in hooks, so invalidation call sites can't drift from fetch call sites.
- Mutations that change server data go through `useMutation`; on success, either `setQueryData` (optimistic/streaming updates, see `useSendMessage.ts`) or `invalidateQueries` (simpler mutations, see `useCreateConversation`).

## 7. API / services conventions

- `services/api/client.ts` exports the single `apiClient` axios instance. Request interceptor attaches `Authorization: Bearer <token>` from `tokenManager`. Response interceptor normalizes every failure into an `ApiRequestError` (see `types/error.types.ts` — a real `Error` subclass carrying `status`/`code`/`fieldErrors`, so `Promise.reject` always rejects with a proper Error and stack trace).
- **401 handling**: a single in-flight refresh is coalesced via `services/api/refreshQueue.ts` (`runExclusiveRefresh`) so concurrent 401s don't trigger parallel `/auth/refresh` calls. On refresh failure, `authEvents.emit('session-expired')` fires and `AuthProvider` clears the session — the interceptor itself never touches Zustand.
- **Cancellation**: use `createCancellable()` from `services/api` to get an `AbortController` + `signal`, pass `signal` into the request config, call `.cancel()` on unmount/user action.
- **Streaming**: `services/chat/streamClient.ts` bypasses axios and uses `fetch` + `ReadableStream` directly, because axios can't stream a response body incrementally in the browser. It parses SSE-style `data: {...}\n\n` frames into `StreamChunk` objects. `chatService.streamMessage()` wraps it; `useSendMessage` consumes it with `for await...of` and writes each chunk into the TanStack Query cache. Toggle streaming vs. single-shot via `VITE_AI_STREAMING` / `appConfig.aiStreaming`.
- Endpoints are centralized in `src/constants/api.ts` (`API_ENDPOINTS`). Don't hardcode a URL path in a service file.
- Every service function returns the *unwrapped* domain type (e.g. `Promise<Conversation[]>`), not the raw `ApiResponse<T>` envelope — unwrap in the service, not in the calling hook.

## 8. Component conventions

- **Naming**: PascalCase component files matching the exported component (`ChatBubble.tsx` exports `ChatBubble`). Hooks are `camelCase` prefixed with `use` (`useSendMessage.ts`).
- **One primary export per file**, plus closely related small helper exports if genuinely coupled (e.g. `ErrorBoundary.tsx` also exports `GlobalErrorFallback`, used by both the boundary's default fallback and `ErrorLayout`).
- **Barrels (`index.ts`)** exist for `components/chat`, `features/auth/components`, `features/auth/hooks`, `features/ai/hooks`, `store`, `hooks`, `services/*`. Add new files to the barrel when they're meant to be part of the feature's public surface; internal-only helpers don't need to be re-exported.
- **shadcn/ui components** (`components/ui/`) are consumed via `@components/ui/<name>`, never re-exported through a barrel — import exactly what you use.
- Props interfaces are named `<Component>Props` and declared directly above the component, not in a separate types file, unless shared across multiple components.
- Prefer composition over prop-explosion: `Sidebar` takes a `navItems: SidebarNavItem[]` array rather than growing boolean flags per nav item.

## 9. Styling rules

- Tailwind v4, **CSS-first config** — there is no `tailwind.config.js`. Theme tokens (colors, radius, font) are defined as CSS custom properties in `src/styles/globals.css` under `:root` / `.dark`, then mapped into Tailwind's utility namespace via `@theme inline`. To add a new design token, add the CSS variable in both `:root` and `.dark`, then map it under `@theme inline`.
- Dark mode is class-based (`.dark` on `<html>`), driven by `ThemeProvider` (`src/app/providers/ThemeProvider.tsx`), which resolves `"system"` via `matchMedia` and listens for OS-level changes.
- Always use the `cn()` helper (`@lib/utils`) to merge conditional class names — never string-concatenate Tailwind classes.
- Colors are referenced by semantic name (`bg-primary`, `text-muted-foreground`, `border-destructive`), never by raw Tailwind palette classes (`bg-orange-500`) — this is what makes dark mode and future re-theming free.

## 10. Naming conventions (quick reference)

| Thing | Convention | Example |
|---|---|---|
| Component file | PascalCase | `ChatWindow.tsx` |
| Hook file | camelCase, `use` prefix | `useSendMessage.ts` |
| Service file | `<domain>.service.ts` | `chat.service.ts` |
| Zustand store | `<domain>.store.ts` | `theme.store.ts` |
| Zod schema | `<domain>.schema.ts` | `auth.schema.ts` |
| Type file | `<domain>.types.ts` | `chat.types.ts` |
| Route path constant | SCREAMING_SNAKE key, kebab-case value | `ROUTES.AI_CHAT = '/workspace/ai-chat'` |
| CSS variable | kebab-case | `--sidebar-accent-foreground` |

## 11. Git workflow

- `main` is the trunk. Commit messages: imperative mood, explain *why* over *what* (the diff already shows what).
- Husky's `pre-commit` hook runs, in order: `lint-staged` (ESLint `--fix` + Prettier on staged files) → `npm run typecheck` (`tsc -b`, no emit) → `npm test -- --passWithNoTests`. A commit that fails any step is blocked — fix the issue and re-commit; don't bypass with `--no-verify`.
- Don't commit `.env` (only `.env.example` is tracked).

## 12. Testing strategy

- Jest + React Testing Library + `@testing-library/user-event`, transformed via Babel (`babel.config.cjs`) — not `ts-jest` — for fast, type-check-free test runs (type checking is `tsc -b`'s job, not Jest's).
- Tests live in `src/tests/{components,hooks,utils,pages}`, mirroring what they test, not colocated with source files.
- `src/tests/setup.ts` (loaded via `setupFilesAfterEnv`) adds `@testing-library/jest-dom` matchers and polyfills `TextEncoder`/`TextDecoder` (jsdom doesn't provide them, but `react-router-dom` needs them).
- Coverage: `npm run test:coverage`. `components/ui/**` is excluded from coverage collection (vendored code, §4.6).
- When adding a feature hook that calls a service, prefer testing the hook's *behavior* (via `renderHook` + mocked service module) over re-testing the service/axios plumbing, which already has its own seams (`errorHandler`, `refreshQueue`) that are cheap to unit test in isolation if you touch them.

## 13. Do's and Don'ts

**Do:**
- Add new query keys to `constants/queryKeys.ts` before writing the hook that uses them.
- Unwrap `ApiResponse<T>` inside the service, return plain `T` to callers.
- Use `ROUTES.*` constants for every `<Link to>` / `navigate()` call — never a raw string literal path.
- Run `npm run typecheck && npm run lint && npm test` before considering a change done (the same three checks the pre-commit hook runs).

**Don't:**
- Don't put server data in a Zustand store.
- Don't import `axios` outside `services/`.
- Don't hand-edit `components/ui/*` beyond alias fixes — re-run the shadcn CLI instead.
- Don't add a `@types` path alias (see §4.7) — use `@/types/*`.
- Don't use `any` — this project lints it as an error (`@typescript-eslint/no-explicit-any`).
- Don't reach into another feature's `hooks/` or `components/` directly from a different feature — go through `components/common` or lift the shared piece up if two features need the same thing.

## 14. Future roadmap (known gaps, intentionally deferred)

- `features/onboarding/` and `components/forms/` are currently empty — reserved for the guided idea-intake flow shown in the design reference (multi-step "Understanding your idea" wizard) and for shared multi-step-form primitives, respectively.
- `src/routes/` is reserved for React Router v7 **route modules** (loaders/actions) if/when a route needs data before first paint instead of a TanStack Query fetch-on-mount. Not used yet — every current route fetches inside the page/feature component.
- Role-based route gating exists (`app/router/RoleRoute.tsx`, `constants/roles.ts`) but isn't wired into the router yet — no route currently requires more than "authenticated". Wire it in when an admin/billing-only screen is added.
- Multi-model AI support: `AIModel`/`ModelSelector`/`chatService.listModels()` already model "which provider handles this conversation" as data, not a hardcoded enum — extending to a second provider should not require touching the chat UI.
- Attachments: `MessageAttachment` type and `ChatInput`'s file picker exist; wiring an actual upload endpoint is pending backend support.

## 15. Common commands

```bash
npm run dev             # start Vite dev server
npm run build            # tsc -b (typecheck, no emit) + vite build
npm run preview           # preview a production build
npm run lint              # eslint .
npm run lint:fix          # eslint . --fix
npm run typecheck          # tsc -b
npm run format             # prettier --write .
npm run format:check        # prettier --check .
npm test                    # jest
npm run test:watch           # jest --watch
npm run test:coverage         # jest --coverage
```

## 16. Development workflow

1. Pull latest `main`, `npm install` if `package.json` changed.
2. `npm run dev`, work against `http://localhost:5173`.
3. Before committing: the pre-commit hook re-runs lint/typecheck/test on staged files automatically — but run `npm run lint && npm run typecheck && npm test` yourself first so you're not surprised at commit time.

### How to add a new feature

1. Create `src/features/<domain>/{hooks,components}`.
2. Add any new server types to `src/types/<domain>.types.ts`.
3. Add a service in `src/services/<domain>/<domain>.service.ts` if it has more than one operation (see §7).
4. Add query keys to `constants/queryKeys.ts`.
5. Write hooks in `features/<domain>/hooks` using TanStack Query, calling the service — never axios directly.
6. Write presentational components in `features/<domain>/components`, composing `components/common` and `components/ui` primitives.
7. Wire a thin page in `src/pages/<Name>Page.tsx` (default export) and register it in `app/router/index.tsx` via `lazyPage()`.

### How to integrate a new API endpoint

1. Add the path to `constants/api.ts` under the right domain key.
2. Add/extend the response type in `src/types/<domain>.types.ts`.
3. Add a method to the relevant `services/<domain>/<domain>.service.ts` that calls `apiClient` and unwraps `ApiResponse<T>`.
4. Expose it to components via a TanStack Query hook in `features/<domain>/hooks`.

### How to add a new page

1. Add the route path to `constants/routes.ts` (`ROUTES`), and to `GUEST_ROUTES`/`PROTECTED_ROUTES` if it needs guarding.
2. Create `src/pages/<Name>Page.tsx`, default-exported.
3. Register it in `app/router/index.tsx` inside the correct guard group (`GuestRoute` for auth pages, `ProtectedRoute` for authenticated app pages, or the top-level `PublicLayout` group for public marketing pages) using `lazyPage(() => import('@pages/<Name>Page'))`.
4. If it belongs in the app shell, add a `SidebarNavItem` entry in `app/layouts/DashboardLayout.tsx`.
