# Axiora Pulse Frontend

Axiora Pulse is an AI workspace for turning startup ideas into validated opportunities. Founders and teams can describe their ideas, analyze market demand through structured questions and customer surveys, collaborate with specialized AI mentor agents, and manage end-to-end venture validation workspaces.

This repository contains the frontend application built with React 19, Vite, TypeScript, and Tailwind CSS.

---

## Key Features

- **Modern Interactive Landing Page**:
  - High-performance marketing experience with pure CSS/Canvas animations and magic rings background.
  - Zero-friction bottom-right `0` to `100` `%` preloader.
  - Comprehensive feature sections: Hero, Founder Challenges, About Platform, AI Mentor Team, Startup Journey Roadmap, Interactive FAQ, Testimonials, "Get in Touch" Contact Form, and Quick-Action Footer.
  - Smooth in-page navigation with floating back-to-top controls.

- **Cartoon Bot AI Loading Mascot**:
  - Custom SVG cartoon robot mascot loader with floating physics, pulsing antenna signal waves, blinking glowing eyes, and heart core animations.
  - Interactive auth overlays on Login, Register, Admin Login, OTP Verification, and Password Reset forms.

- **Authentication & Security**:
  - Email and password login/registration with form validation (React Hook Form + Zod).
  - MFA / OTP code verification flows and password recovery.
  - Role-based route protection (`GuestRoute`, `ProtectedRoute`, `AdminRoute`).

- **Workspaces & Venture Validation**:
  - Workspace management, idea intake, details, surveys, attachments, and archive workflows.
  - Interactive questionnaires and automated market validation.
  - Public and authenticated customer surveys with real-time response capture.

- **AI Co-Founder & Chat**:
  - Multi-turn AI mentor chat with model selection, Markdown rendering, and optional streaming responses.

- **Administration**:
  - Dedicated admin dashboard, user administration, and interactive question management.

---

## Tech Stack

- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) (Strict Mode)
- **Bundler & Build Tool**: [Vite](https://vitejs.dev/)
- **Routing**: [React Router v7](https://reactrouter.com/) with route-level code splitting and layout composition
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) + [Lucide Icons](https://lucide.dev/)
- **State Management**: [TanStack Query v5](https://tanstack.com/query/latest) (server state) + [Zustand](https://zustand-demo.pmnd.rs/) (client state)
- **Form Handling**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **HTTP Client**: [Axios](https://axios-http.com/)
- **Testing**: [Jest](https://jestjs.io/) + [React Testing Library](https://testing-library.com/) + `@testing-library/user-event`

---

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm or pnpm

### Installation & Development

```bash
# 1. Install dependencies
npm install

# 2. Start local development server
npm run dev
```

The application will be available at `http://localhost:5173`.

### Environment Configuration

Create a `.env` file in the project root to configure local environment variables:

```env
VITE_API_URL=http://localhost:8000/api
VITE_APP_NAME=Axiora Pulse
VITE_ENABLE_LOGGER=true
VITE_AI_STREAMING=true
```

---

## Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Start the local Vite development server |
| `npm run build` | Run TypeScript type checks and build the production bundle |
| `npm run preview` | Preview the local production build |
| `npm run lint` | Run ESLint checks across all codebase files |
| `npm run typecheck` | Run TypeScript strict compiler checks (`tsc -b`) |
| `npm test` | Run the complete Jest test suite |
| `npm run test:watch` | Run Jest in interactive watch mode |
| `npm run test:coverage` | Generate code coverage report |
| `npm run format` | Format source files with Prettier |

---

## Project Structure

```text
src/
├── app/          # App providers, layouts (Public, Auth, Dashboard, Admin), and router setup
├── components/   # Reusable UI primitives, CartoonBotLoader, common widgets, and layout items
├── constants/    # Route paths, API endpoints, and configuration constants
├── features/     # Domain features (auth, landing, workspace, survey, ai-chat, onboarding, settings)
├── hooks/        # Global custom React hooks
├── lib/          # Utilities, axios client setup, and helper functions
├── pages/        # Route page components (LandingPage, LoginPage, DashboardPage, etc.)
├── schemas/      # Zod validation schemas for forms and API models
├── services/     # API service layer and domain endpoints
├── store/        # Zustand client state stores (auth, workspace, etc.)
├── tests/        # Jest & React Testing Library test suites
└── types/        # Global TypeScript interfaces and type definitions
```

---

## Documentation

- [`CLAUDE.md`](./CLAUDE.md): Architecture conventions, code style guidelines, and workflow rules.
- [`GRAPHFY.md`](./GRAPHFY.md): Codebase topology and component relationship graph.
