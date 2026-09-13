import { Link } from 'react-router-dom';

import { ROUTES } from '@constants/routes';
import { useAuthStore } from '@store/auth.store';

export function CtaBanner() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const role = useAuthStore((state) => state.role);
  const targetRoute = isAuthenticated
    ? role === 'admin'
      ? ROUTES.ADMIN_DASHBOARD
      : ROUTES.DASHBOARD
    : ROUTES.REGISTER;

  return (
    <section className="cta-banner-section" id="cta-banner">
      <div className="cta-banner-bg">
        <img
          src="/assets/landing/why_you_late_bg.jpg"
          alt="Why You Late - Start Now"
          className="cta-banner-img"
        />
        <div className="cta-banner-overlay" />
      </div>
      <div className="cta-banner-content">
        <h2 className="cta-banner-heading">Why You Late?</h2>
        <div className="cta-banner-right">
          <p className="cta-banner-desc">
            Deadlines matter, opportunities don&apos;t wait. Delayed ideas lose momentum, while
            early action turns thoughts into impact. Start today, stay ahead, and turn your ideas
            into reality—on time.
          </p>
          <Link to={targetRoute} className="cta-banner-link" id="cta-start-now">
            START NOW <span className="cta-arrow">↗</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
