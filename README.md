# Axiora Pulse Frontend

Axiora Pulse is an AI workspace for turning startup ideas into validated opportunities. Users can describe an idea, work through structured questions and surveys, collaborate with an AI co-founder, and manage the resulting workspaces.

This repository contains the frontend only. It communicates with an existing REST API and does not include backend services.

## Current Status

The frontend currently includes:

- Guest and authenticated routing with protected and admin-only route guards
- Login, registration, OTP verification, login verification, logout, and password reset flows
- Pricing and onboarding screens
- Dashboard and workspace management, including workspace details, archive, surveys, and attachments views
- Questionnaire introduction and interactive question flows
- Public survey links and authenticated workspace surveys
- AI chat with conversations, model selection, Markdown messages, and optional streaming responses
- Profile and application settings screens
- Admin login, dashboard, user management, and interactive-question management screens
- Shared layouts, shadcn/ui components, responsive app navigation, error handling, notifications, and lazy-loaded routes
- API services and TanStack Query hooks for auth, billing, chat, onboarding, mentor, survey, and workspace data
- Unit and component tests using Jest and React Testing Library

## In Progress

The following areas are present in the architecture or UI but still need further implementation or backend support:

- Complete the guided onboarding and idea-intake experience across all workflow steps
- Finish mentor and orchestration workflows as their API contracts become available
- Connect attachment selection to a real upload endpoint
- Continue expanding admin capabilities and validation/question management
- Add and refine backend integrations for the remaining survey, workspace, and AI workflows
- Increase coverage for pages, feature hooks, protected routes, and end-to-end user journeys

## Tech Stack

- React 19 and TypeScript in strict mode
- Vite for development and production builds
- React Router v7 for lazy-loaded route composition and guards
- Tailwind CSS v4 and shadcn/ui for styling and accessible primitives
- TanStack Query v5 for server state and Zustand for client-only state
- Axios for REST API communication
- React Hook Form and Zod for forms and validation
- Framer Motion, lucide-react, Sonner, and React Markdown for UI behavior and presentation
- Jest, React Testing Library, and user-event for tests

## Getting Started

Requirements: Node.js and npm.

```bash
npm install
npm run dev
```

The development server is available at `http://localhost:5173` by default.

### Environment Variables

Create a `.env` file in the project root when you need to override defaults:

```env
VITE_API_URL=http://localhost:8000/api
VITE_APP_NAME=Axiora Pulse
VITE_ENABLE_LOGGER=true
VITE_AI_STREAMING=true
```

All variables are optional. The application defaults to the values shown above; logging defaults to enabled in development, and AI streaming defaults to enabled.

## Commands

```bash
npm run dev          # start the Vite development server
npm run build        # typecheck and create a production build
npm run preview      # preview the production build
npm run lint         # run ESLint
npm run typecheck    # run TypeScript checks
npm test             # run the Jest test suite
npm run test:watch   # run Jest in watch mode
npm run test:coverage # generate test coverage
npm run format       # format the repository with Prettier
```

## Project Structure

```text
src/
	app/          application providers, layouts, router, and composition
	components/   shared UI, chat, common, and layout components
	features/     auth, AI, onboarding, pricing, settings, survey, and workspace logic
	pages/        route-level page components
	services/     API clients and domain services
	store/        Zustand client state
	types/        shared TypeScript types
	tests/        Jest and React Testing Library tests
```

Server-derived data belongs in TanStack Query. Zustand is reserved for client and session UI state, and API calls are kept in `src/services/`.

## Further Documentation

- [`CLAUDE.md`](./CLAUDE.md) contains the detailed architecture, conventions, testing strategy, and contribution workflow.
- [`GRAPHFY.md`](./GRAPHFY.md) provides a relationship-first map of the codebase.
