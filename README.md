# Axiora Pulse — Frontend

AI Workspace frontend where users validate and build startup ideas with an AI co-founder through chat, forms, and workflow screens. This repo is frontend-only; it talks to a REST backend over HTTP.

See [`CLAUDE.md`](./CLAUDE.md) for full architecture, conventions, and workflow documentation, and [`GRAPHFY.md`](./GRAPHFY.md) for a relationship-first map of the codebase.

## Stack

React 19 · Vite · TypeScript (strict) · React Router v7 · Tailwind CSS v4 · shadcn/ui · Zustand · TanStack Query v5 · Axios · React Hook Form + Zod · Jest + React Testing Library

## Getting started

```bash
cp .env.example .env
npm install
npm run dev
```

## Common commands

```bash
npm run dev             # start the dev server
npm run build             # typecheck + production build
npm run lint               # eslint .
npm run typecheck            # tsc -b
npm test                      # jest
npm run test:coverage          # jest --coverage
npm run format                  # prettier --write .
```
