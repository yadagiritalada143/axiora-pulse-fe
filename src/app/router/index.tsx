import { createBrowserRouter } from 'react-router-dom';

import { AuthLayout } from '@app/layouts/AuthLayout';
import { DashboardLayout } from '@app/layouts/DashboardLayout';
import { ErrorLayout } from '@app/layouts/ErrorLayout';
import { PricingLayout } from '@app/layouts/PricingLayout';
import { PublicLayout } from '@app/layouts/PublicLayout';
import { ROUTES } from '@constants/routes';

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
        ],
      },
      {
        path: ROUTES.DASHBOARD,
        element: lazyPage(() => import('@pages/DashboardPage')),
      },
      {
        element: <DashboardLayout />,
        children: [
          {
            path: ROUTES.WORKSPACE,
            element: lazyPage(() => import('@pages/WorkspacePage')),
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
    ],
  },
  {
    path: '*',
    element: lazyPage(() => import('@pages/NotFoundPage')),
  },
]);
