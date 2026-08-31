import { useNavigate } from 'react-router-dom';

import { ROUTES } from '@constants/routes';
import { useAuthStore } from '@store/auth.store';

export function LandingHero() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const role = useAuthStore((state) => state.role);

  const handleTryFree = () => {
    if (isAuthenticated) {
      void navigate(role === 'admin' ? ROUTES.ADMIN_DASHBOARD : ROUTES.DASHBOARD);
    } else {
      void navigate(ROUTES.REGISTER);
    }
  };

  return (
    <main className="hero-section">
      <div className="hero-content">
        <h1 className="hero-title">Great Ideas Don&apos;t Need Luck. They Need Validation.</h1>
        <p className="hero-subtitle">
          Know the Market. Get the Guidance. Build with Confidence. Validate every decision with AI
          mentor insights before you invest your time, money, and effort.
        </p>

        <div className="hero-cta-wrapper">
          <button className="btn-hero-cta" id="btn-try-free" onClick={handleTryFree}>
            <span>Try it for free</span>
            <div className="arrow-circle">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        </div>
      </div>
    </main>
  );
}
