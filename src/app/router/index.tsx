import { createBrowserRouter } from 'react-router-dom';

import { AdminDashboardLayout } from '@app/layouts/AdminDashboardLayout';
import { AuthLayout } from '@app/layouts/AuthLayout';
import { DashboardLayout } from '@app/layouts/DashboardLayout';
import { ErrorLayout } from '@app/layouts/ErrorLayout';
import { PricingLayout } from '@app/layouts/PricingLayout';
import { PublicLayout } from '@app/layouts/PublicLayout';
import { ROUTES } from '@constants/routes';

import { AdminRoute } from './AdminRoute';
import { GuestRoute } from './GuestRoute';
import { HomeRedirect } from './HomeRedirect';
import { lazyPage } from './lazyPage';
import { ProtectedRoute } from './ProtectedRoute';

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    errorElement: <ErrorLayout />,
    children: [
      {
        index: true,
        element: <HomeRedirect />,
      },
      {
        path: '/surveys/public/:surveyId',
        element: lazyPage(() => import('@pages/PublicSurveyPage')),
      },
    ],
  },
  {
    element: <GuestRoute />,
    errorElement: <ErrorLayout />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          {
            path: ROUTES.LOGIN,
            element: lazyPage(() => import('@pages/LoginPage')),
          },
          {
            path: ROUTES.ADMIN_LOGIN,
            element: lazyPage(() => import('@pages/AdminLoginPage')),
          },
          {
            path: ROUTES.REGISTER,
            element: lazyPage(() => import('@pages/RegisterPage')),
          },
          {
            path: ROUTES.VERIFY_OTP,
            element: lazyPage(() => import('@pages/VerifyOtpPage')),
          },
          {
            path: ROUTES.VERIFY_LOGIN,
            element: lazyPage(() => import('@pages/VerifyLoginPage')),
          },
          {
            path: ROUTES.FORGOT_PASSWORD,
            element: lazyPage(() => import('@pages/ForgotPasswordPage')),
          },
          {
            path: ROUTES.RESET_PASSWORD,
            element: lazyPage(() => import('@pages/ResetPasswordPage')),
          },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    errorElement: <ErrorLayout />,
    children: [
      {
        element: <PricingLayout />,
        children: [
          {
            path: ROUTES.PRICING,
            element: lazyPage(() => import('@pages/PricingPage')),
          },
          {
            path: ROUTES.ONBOARDING,
            element: lazyPage(() => import('@pages/OnboardingPage')),
          },
        ],
      },
      {
        path: ROUTES.DASHBOARD,
        element: lazyPage(() => import('@pages/DashboardPage')),
      },
      {
        path: ROUTES.WORKSPACE_DETAIL,
        element: lazyPage(() => import('@pages/WorkspaceDetailPage')),
      },
      {
        path: ROUTES.WORKSPACE_SURVEY,
        element: lazyPage(() => import('@pages/WorkspaceSurveyPage')),
      },
      {
        path: ROUTES.QUESTIONNAIRE_INTRO,
        element: lazyPage(() => import('@pages/QuestionnaireIntroPage')),
      },
      {
        path: ROUTES.INTERACTIVE_QUESTIONS,
        element: lazyPage(() => import('@pages/InteractiveQuestionsPage')),
      },
      {
        element: <DashboardLayout />,
        children: [
          {
            path: ROUTES.WORKSPACE,
            element: lazyPage(() => import('@pages/WorkspacePage')),
          },
          {
            path: ROUTES.WORKSPACE_ARCHIVE,
            element: lazyPage(() => import('@pages/WorkspaceArchivePage')),
          },
          {
            path: ROUTES.AI_CHAT,
            element: lazyPage(() => import('@pages/AIChatPage')),
          },
          {
            path: ROUTES.SETTINGS,
            element: lazyPage(() => import('@pages/SettingsPage')),
          },
          {
            path: ROUTES.PROFILE,
            element: lazyPage(() => import('@pages/ProfilePage')),
          },
        ],
      },
      {
        element: <AdminRoute />,
        children: [
          {
            element: <AdminDashboardLayout />,
            children: [
              {
                path: ROUTES.ADMIN_DASHBOARD,
                element: lazyPage(() => import('@pages/AdminDashboardPage')),
              },
              {
                path: ROUTES.ADMIN_INTERACTIVE_QUESTIONS,
                element: lazyPage(() => import('@pages/AdminInteractiveQuestionsPage')),
              },
              {
                path: ROUTES.ADMIN_USERS,
                element: lazyPage(() => import('@pages/AdminUsersPage')),
              },
            ],
          },
        ],
      },
    ],
  },

  {
    path: '*',
    element: lazyPage(() => import('@pages/NotFoundPage')),
  },
]);
