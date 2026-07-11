# GRAPHFY.md — Architectural Knowledge Graph

This document maps **relationships**, not implementation. Read `CLAUDE.md` for the "why"; read this for "what depends on what" and "what talks to what." Every graph below should let you answer "if I change X, what else might break?" in seconds.

## 1. Top-level structure graph

```
App (src/app/App.tsx)
├── ErrorBoundary                              (components/common/ErrorBoundary.tsx)
│   └── AppProviders                            (app/providers/AppProviders.tsx)
│       ├── ThemeProvider                        → reads/writes store/theme.store.ts
│       │   └── QueryProvider                     → owns app/query/queryClient.ts
│       │       └── AuthProvider                   → subscribes to services/api/authEvents.ts
│       │           └── TooltipProvider (shadcn)
│       │               ├── {children}             → RouterProvider
│       │               └── Toaster (sonner)         → reads useTheme() for light/dark
└── RouterProvider(router)                       (app/router/index.tsx)
```

Provider **nesting order is load-bearing**: Theme must be outermost (Toaster below it needs resolved theme), Query must wrap Auth (auth actions are mutations), Auth must wrap Tooltip/children (session-expiry must be listening before any route renders).

## 2. Routing graph

```
createBrowserRouter([
  PublicLayout                     (no path — pathless layout route)
  ├── "/"          → HomeRedirect   → Navigate to DASHBOARD (if authed) or PRICING (if not)
  └── "/pricing"   → PricingPage    (lazy)

  GuestRoute                        (blocks if isAuthenticated)
  └── AuthLayout
      ├── "/login"            → LoginPage            (lazy)
      ├── "/register"         → RegisterPage          (lazy)
      ├── "/forgot-password"  → ForgotPasswordPage      (lazy)
      └── "/reset-password"   → ResetPasswordPage        (lazy)

  ProtectedRoute                    (blocks if !isAuthenticated, redirects to /login)
  └── DashboardLayout               (Sidebar + Navbar chrome)
      ├── "/dashboard"        → DashboardPage         (lazy)
      ├── "/workspace"        → WorkspacePage           (lazy)
      ├── "/workspace/ai-chat" → AIChatPage              (lazy)
      ├── "/settings"         → SettingsPage             (lazy)
      └── "/profile"          → ProfilePage               (lazy)

  "*" → NotFoundPage                (lazy, top-level, catches everything unmatched)
]
```

Every leaf route is wrapped in `lazyPage()` (`app/router/lazyPage.tsx`), which is `React.lazy` + a shared `<Suspense fallback={<PageLoader />}>`. `errorElement: <ErrorLayout />` is attached to each top-level group, so a render/loader error in any nested route surfaces `ErrorLayout` → `GlobalErrorFallback`.

`ProtectedRoute` / `GuestRoute` / `HomeRedirect` all read `useAuthStore((s) => s.isAuthenticated)` — they are the **only** three files that gate on that flag directly; everything else assumes the router already enforced access.

## 3. Provider graph

| Provider | File | Reads | Provides |
|---|---|---|---|
| `ThemeProvider` | `app/providers/ThemeProvider.tsx` | `store/theme.store.ts`, `matchMedia` | `ThemeContext` (`theme`, `resolvedTheme`, `setTheme`) → consumed via `hooks/useTheme.ts` |
| `QueryProvider` | `app/providers/QueryProvider.tsx` | `app/query/queryClient.ts`, `config/env.ts` | `QueryClientProvider` + conditional `ReactQueryDevtools` (dev only) |
| `AuthProvider` | `app/providers/AuthProvider.tsx` | `services/api/authEvents.ts` | Side effect only: clears `useAuthStore` session on `'session-expired'` |
| `AppProviders` | `app/providers/AppProviders.tsx` | the three above | Composition root; also mounts `TooltipProvider` + `Toaster` |

## 4. State graph (Zustand)

```
store/
├── auth.store.ts   { user, isAuthenticated }         --owns tokens via--> services/api/tokenManager.ts
├── theme.store.ts  { theme }                          --read by--> app/providers/ThemeProvider.tsx
├── ui.store.ts     { isSidebarOpen, isCommandPaletteOpen, activeModal }   --read by--> components/layout/Sidebar.tsx, Navbar.tsx
├── app.store.ts    { activeWorkspaceId, isOnboarded }  --read by--> features/workspace/components/WorkspaceList.tsx
└── chat.store.ts   { activeConversationId, selectedModelId, draftMessage, draftAttachments, isStreaming }
                     --read/written by--> features/ai/components/ChatWindow.tsx, features/ai/hooks/useSendMessage.ts
```

`app/store/index.ts` is a pass-through barrel (`export * from '@store/index'`) — it exists so `app/*` code has a layer-local import path, but the actual slices live in `src/store/`. There is exactly one source of truth per slice; no store imports another store.

**Critical dependency**: `auth.store.ts` imports `tokenManager` from `services/api/` — this is the one approved case of a store reaching into the services layer, because token read/write must be synchronous and available to the axios interceptor before React has necessarily mounted.

## 5. API / service graph

```
services/
├── api/
│   ├── client.ts          → axios instance; request interceptor (attach token);
│   │                          response interceptor (401 → refresh → retry, else → toApiError)
│   ├── tokenManager.ts     → localStorage read/write for access+refresh tokens (STORAGE_KEYS)
│   ├── refreshQueue.ts     → runExclusiveRefresh() coalesces concurrent 401s into one /auth/refresh call
│   ├── authEvents.ts       → pub/sub; client.ts emits 'session-expired', AuthProvider listens
│   ├── errorHandler.ts     → toApiError(AxiosError) => ApiRequestError (real Error subclass)
│   ├── cancellation.ts     → createCancellable() => { signal, cancel() } for AbortController-based requests
│   └── index.ts            → barrel: apiClient, toApiError, tokenManager, authEvents, createCancellable
│
├── auth/auth.service.ts    → login, register, logout, forgotPassword, resetPassword, getCurrentUser
│                              consumed by → features/auth/hooks/*
│
├── chat/
│   ├── chat.service.ts     → listConversations, getConversation, createConversation, deleteConversation,
│   │                          listMessages, sendMessage, streamMessage, listModels
│   │                          consumed by → features/ai/hooks/*
│   └── streamClient.ts     → streamChatCompletion(): fetch()-based SSE reader, bypasses apiClient entirely
│                              (axios can't stream response bodies incrementally in-browser)
│
└── billing/billing.service.ts → listPlans, subscribe
                                  consumed by → features/pricing/hooks/usePricingPlans.ts
```

Every service function's return type is a bare domain type (`Promise<Conversation[]>`), never the raw `ApiResponse<T>` envelope — the unwrap happens once, inside the service.

## 6. Query (server-state) graph

```
constants/queryKeys.ts              (single source of truth for all query keys)
├── queryKeys.auth.session()         — not currently used by a query (reserved for future /auth/me hook)
├── queryKeys.chat.conversations()   ← features/ai/hooks/useConversations.ts
├── queryKeys.chat.conversation(id)  — reserved (no hook yet reads a single conversation directly)
├── queryKeys.chat.messages(id)      ← features/ai/hooks/useMessages.ts, written by useSendMessage.ts
├── queryKeys.chat.models()          ← features/ai/hooks/useModels.ts
├── queryKeys.workspace.list()       ← features/workspace/hooks/useWorkspaces.ts
├── queryKeys.workspace.detail(id)   — reserved
├── queryKeys.billing.plans()        ← features/pricing/hooks/usePricingPlans.ts
└── queryKeys.user.profile()         ← invalidated by features/settings/hooks/useUpdateProfile.ts
                                        (no query currently reads it — profile comes from auth session)
```

`useSendMessage` is the one hook that *writes* to the query cache outside of a normal query/mutation return (`queryClient.setQueryData(messagesKey, ...)` inside the `mutationFn`, once per streamed chunk) — this is intentional for incremental streaming UI and is the only place that pattern is used.

## 7. Component graph (chat feature, deepest one)

```
pages/AIChatPage.tsx
└── features/ai/components/ChatWindow.tsx
    ├── useConversations() / useCreateConversation()   → services/chat
    ├── useModels()                                     → services/chat
    ├── useMessages(activeConversationId)                → services/chat
    ├── useSendMessage(activeConversationId)               → services/chat (+ writes chat.store isStreaming)
    ├── components/chat/ConversationList.tsx
    ├── components/chat/ModelSelector.tsx                  → components/ui/select
    ├── components/chat/UserMessage.tsx  ─┐
    ├── components/chat/AIMessage.tsx     ┼─→ components/chat/ChatBubble.tsx (shared shell)
    │                                     │      └── components/ui/avatar
    │   AIMessage also renders:           │
    │   ├── components/chat/TypingIndicator.tsx  (while streaming, empty content)
    │   └── components/chat/MarkdownRenderer.tsx  (react-markdown + remark-gfm)
    ├── components/chat/ChatLoader.tsx                    (skeleton, shown while messages load)
    └── components/chat/ChatInput.tsx                      → components/ui/textarea, components/ui/button
```

## 8. Form graph (auth feature, representative pattern for all forms)

```
schemas/auth.schema.ts        (zod schemas: loginSchema, registerSchema, forgotPasswordSchema, resetPasswordSchema)
        │
        ▼ zodResolver()
features/auth/hooks/useLogin.ts  ──┐
features/auth/hooks/useRegister.ts │  each: useMutation → services/auth/auth.service.ts
features/auth/hooks/useForgotPassword.ts │      on success: useAuthStore.setSession() + navigate() (login/register only)
features/auth/hooks/useResetPassword.ts ──┘      on error: sonner toast.error()
        │
        ▼
features/auth/components/{Login,Register,ForgotPassword,ResetPassword}Form.tsx
        │  useForm({ resolver: zodResolver(schema) }) + shadcn <Form> (components/ui/form.tsx)
        ▼
pages/{Login,Register,ForgotPassword,ResetPassword}Page.tsx   (thin: heading + copy + the form)
```

Every other form in the app (`ProfileForm`) follows this exact same four-layer shape: schema → mutation hook (service call + store/query side effect + toast) → form component (RHF + shadcn Form) → thin page.

## 9. Dependency direction rules (what may import what)

```
pages/          → features/*, components/*, app/layouts (via router, not directly)
features/*      → components/*, services/*, store/*, schemas/*, constants/*, hooks/*, types (@/types/*)
components/*    → components/ui/*, lib/*, hooks/*, store/* (read-only, sparingly), constants/*
services/*      → constants/*, config/*, types (@/types/*), utils/* — NEVER store/*, NEVER react-router
                   (exception: auth.store.ts → services/api/tokenManager.ts, see §4)
store/*         → constants/*, types (@/types/*), services/api/tokenManager.ts (auth.store only)
app/*           → everything (it's the composition root)
```

If you find yourself importing `features/x` from `features/y`, stop — lift the shared piece into `components/common`, `hooks/`, or a new `services/` module instead.

## 10. Folder graph (one-line purpose each)

```
app/            composition root: providers, router, layouts, query client
assets/         static files (images/icons/fonts — currently empty placeholders)
components/     reusable UI, no business logic (except thin common/ helpers like ApiErrorMessage)
features/       business logic per domain: hooks (data) + components (presentation)
hooks/          cross-feature generic hooks
services/       all I/O — the only layer allowed to import axios
lib/            library-glue utilities (currently: cn())
types/          shared TypeScript types (imported via @/types/*, not @types/*)
utils/          pure framework-agnostic helpers
constants/      centralized literals: routes, roles, API endpoints, query keys, storage keys, theme
config/         environment/config resolution (env.ts, app.config.ts)
styles/         Tailwind v4 entry + CSS variable theme
pages/          route-level components, one per route, default-exported
routes/         reserved for future React Router v7 route modules (loaders/actions) — currently empty
schemas/        Zod schemas + inferred form types
store/          Zustand slices — client state only
tests/          mirrors source structure: components/, hooks/, utils/, pages/
```
