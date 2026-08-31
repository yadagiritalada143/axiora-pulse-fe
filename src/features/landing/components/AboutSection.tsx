import { useNavigate } from 'react-router-dom';

import { ROUTES } from '@constants/routes';
import { useAuthStore } from '@store/auth.store';

export function AboutSection() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const role = useAuthStore((state) => state.role);

  const handleStart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isAuthenticated) {
      void navigate(role === 'admin' ? ROUTES.ADMIN_DASHBOARD : ROUTES.DASHBOARD);
    } else {
      void navigate(ROUTES.REGISTER);
    }
  };

  return (
    <section className="about-section" id="about-aimentor">
      <div className="about-container">
        <div className="about-header-grid">
          <div className="about-header-left">
            <span className="about-label">About Axiora Pulse</span>
            <h2 className="about-title">
              Turn Your Business Idea
              <br />
              Into a Smarter Decision
            </h2>
            <a href="#register" className="btn-about-start" onClick={handleStart}>
              Get Started
            </a>
          </div>
          <div className="about-header-right">
            <p className="about-description">
              Axiora Pulse helps founders validate ideas, understand their market, gather customer
              insights, and make confident business decisions with AI-powered guidance.
            </p>
          </div>
        </div>

        <div className="about-cards-grid">
          <div className="about-story-card">
            <img src="/assets/landing/our_story_bg.jpg" alt="Our Story" className="story-bg-img" />
            <div className="story-gradient-overlay" />
            <div className="story-content">
              <h3 className="story-title">Our Story</h3>
              <p className="story-text">
                Axiora Pulse was built to make business validation simpler, faster, and more
                accessible. Instead of spending weeks researching and analyzing an idea manually,
                founders can use AI-powered agents to turn an idea into meaningful insights and
                actionable reports.
              </p>
            </div>
          </div>

          <div className="about-mission-vision">
            <div className="mission-card">
              <h3 className="mission-title">Our Mission</h3>
              <p className="mission-text">
                To stand with every entrepreneur from idea to scale with a 24/7 AI Mentor —
                providing clarity, warning against costly wrong moves, and guiding every next step
                with confidence.
              </p>
            </div>
            <div className="vision-card">
              <h3 className="vision-title">Our Vision</h3>
              <p className="vision-text">
                To make entrepreneurship a confident and natural choice for everyone — empowering
                people to build businesses, create wealth, generate employment, and contribute to
                economic growth.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
