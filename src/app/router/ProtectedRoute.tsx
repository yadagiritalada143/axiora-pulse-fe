import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { ROUTES } from '@constants/routes';
import { useAuthStore } from '@store/auth.store';

/** Redirects to `/login` when there's no session, and strictly redirects based on payment and questionnaire status. */
export function ProtectedRoute() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasCompletedQuestionnaire = useAuthStore((state) => state.hasCompletedQuestionnaire);
  const hasActivePlan = useAuthStore((state) => state.hasActivePlan);
  const role = useAuthStore((state) => state.role);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  // Admins bypass questionnaire and plan restrictions
  if (role === 'admin') {
    return <Outlet />;
  }

  const path = location.pathname;

  const isPaymentRoute = path === ROUTES.PRICING || path === ROUTES.ONBOARDING;
  if (!hasActivePlan && !isPaymentRoute) {
    return <Navigate to={ROUTES.PRICING} replace />;
  }

  const isQuestionnaireRoute =
    path === ROUTES.QUESTIONNAIRE_INTRO || path === ROUTES.INTERACTIVE_QUESTIONS;
  if (hasActivePlan && !hasCompletedQuestionnaire && !isQuestionnaireRoute && !isPaymentRoute) {
    return <Navigate to={ROUTES.QUESTIONNAIRE_INTRO} replace />;
  }

  if (hasCompletedQuestionnaire && isQuestionnaireRoute) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return <Outlet />;
}
