import { useNavigate } from 'react-router-dom';

import { ROUTES } from '@constants/routes';
import { useAuthStore } from '@store/auth.store';

export function FounderChallengesSection() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const role = useAuthStore((state) => state.role);

  const handleStartProject = () => {
    if (isAuthenticated) {
      void navigate(role === 'admin' ? ROUTES.ADMIN_DASHBOARD : ROUTES.DASHBOARD);
    } else {
      void navigate(ROUTES.REGISTER);
    }
  };

  return (
    <section className="services-section" id="storytelling">
      <div className="services-container">
        <div className="services-left-col">
          <h2 className="services-header-title">
            The Critical Challenges
            <br />
            Every Founder Faces
            <br />
            Before Building a<br />
            <span className="highlight-purple">Successful Startup</span>
          </h2>

          <div className="purple-accent-bar" />

          <p className="services-header-subtitle">
            Turning an idea into a thriving business is hard. Founders face real roadblocks that can
            stall progress.
          </p>

          <div className="services-cta-group">
            <button
              className="btn-start-project"
              id="btn-start-project"
              onClick={handleStartProject}
            >
              <span>Build Your Idea</span>
              <svg
                className="cta-arrow"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
            <a
              href="#ai-mentor"
              className="link-learn-more"
              id="link-learn-more"
              onClick={(e) => {
                e.preventDefault();
                document
                  .getElementById('ai-mentor')
                  ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
            >
              <span>Learn more</span>
              <svg
                className="cta-arrow"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </a>
          </div>
        </div>

        <div className="services-right-col">
          <div className="service-item">
            <div className="service-title-col">
              <h3 className="service-title">
                False
                <br />
                Confidence
              </h3>
            </div>
            <div className="service-divider" />
            <div className="service-desc-col">
              <p className="service-description">
                &ldquo;Everyone told me it was a great idea.&rdquo;
              </p>
            </div>
          </div>

          <div className="service-item">
            <div className="service-title-col">
              <h3 className="service-title">
                Validation
                <br />
                Paralysis
              </h3>
            </div>
            <div className="service-divider" />
            <div className="service-desc-col">
              <p className="service-description">
                &ldquo;I know I should validate my idea...&rdquo;
              </p>
            </div>
          </div>

          <div className="service-item">
            <div className="service-title-col">
              <h3 className="service-title">
                Market
                <br />
                Doubt
              </h3>
            </div>
            <div className="service-divider" />
            <div className="service-desc-col">
              <p className="service-description">
                &ldquo;What if I&apos;m building something nobody needs?&rdquo;
              </p>
            </div>
          </div>

          <div className="service-item">
            <div className="service-title-col">
              <h3 className="service-title">
                Investor
                <br />
                Reality
              </h3>
            </div>
            <div className="service-divider" />
            <div className="service-desc-col">
              <p className="service-description">
                &ldquo;I don&apos;t have answers when investors ask about validation.&rdquo;
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
