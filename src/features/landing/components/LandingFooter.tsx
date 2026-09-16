import { Link, useLocation, useNavigate } from 'react-router-dom';

import { Logo } from '@components/common/Logo';
import { ROUTES } from '@constants/routes';
import { SOCIAL_LINKS } from '@constants/socialLinks';

export function LandingFooter() {
  const location = useLocation();
  const navigate = useNavigate();

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    if (location.pathname === '/' || location.pathname === ROUTES.HOME) {
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      void navigate(`/#${targetId}`);
    }
  };

  return (
    <footer className="site-footer" id="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <div className="footer-brand-logo-wrap">
            <Logo size="lg" tone="dark" animated={true} />
          </div>
          <p className="footer-desc">
            AI-powered tools and agents that help you validate ideas, understand your market, and
            build with confidence.
          </p>
        </div>

        <div className="footer-col">
          <h4 className="footer-col-title">Quick Links</h4>
          <ul className="footer-links">
            <li>
              <a
                href="#storytelling"
                className="footer-link"
                onClick={(e) => scrollToSection(e, 'storytelling')}
              >
                Product
              </a>
            </li>
            <li>
              <a
                href="#ai-mentor"
                className="footer-link"
                onClick={(e) => scrollToSection(e, 'ai-mentor')}
              >
                Solutions
              </a>
            </li>
            <li>
              <a
                href="#about-aimentor"
                className="footer-link"
                onClick={(e) => scrollToSection(e, 'about-aimentor')}
              >
                About Us
              </a>
            </li>
            <li>
              <a href="#faq" className="footer-link" onClick={(e) => scrollToSection(e, 'faq')}>
                FAQ
              </a>
            </li>
            <li>
              <a
                href="#contact"
                className="footer-link"
                onClick={(e) => scrollToSection(e, 'contact')}
              >
                Contact
              </a>
            </li>
          </ul>
        </div>

        <div className="footer-col">
          <h4 className="footer-col-title">Legal</h4>
          <ul className="footer-links">
            <li>
              <Link to={ROUTES.PRIVACY_POLICY} className="footer-link" id="footer-privacy-policy">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link to={ROUTES.TERMS_OF_USE} className="footer-link" id="footer-terms-of-use">
                Terms & Conditions
              </Link>
            </li>
          </ul>
        </div>

        <div className="footer-col">
          <h4 className="footer-col-title">Connect</h4>
          <ul className="footer-links">
            <li>
              <a
                href={SOCIAL_LINKS.LINKEDIN}
                target="_blank"
                rel="noreferrer"
                className="footer-link"
              >
                LinkedIn
              </a>
            </li>
            <li>
              <a
                href={SOCIAL_LINKS.INSTAGRAM}
                target="_blank"
                rel="noreferrer"
                className="footer-link"
              >
                Instagram
              </a>
            </li>
            <li>
              <a
                href={SOCIAL_LINKS.FACEBOOK}
                target="_blank"
                rel="noreferrer"
                className="footer-link"
              >
                Facebook
              </a>
            </li>
            <li>
              <a href={SOCIAL_LINKS.X} target="_blank" rel="noreferrer" className="footer-link">
                Twitter / X
              </a>
            </li>
            <li>
              <a
                href={SOCIAL_LINKS.YOUTUBE}
                target="_blank"
                rel="noreferrer"
                className="footer-link"
              >
                YouTube
              </a>
            </li>
            <li>
              <a
                href="#contact"
                className="footer-link"
                onClick={(e) => scrollToSection(e, 'contact')}
              >
                Contact Us
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom-bar">
        <p className="footer-bottom-copy">
          &copy; {new Date().getFullYear()} Axiora Global Solutions Pvt. Ltd. All rights reserved.
        </p>
        <div className="footer-bottom-legal-links">
          <Link to={ROUTES.PRIVACY_POLICY} className="footer-legal-link">
            Privacy Policy
          </Link>
          <span className="footer-legal-divider">&bull;</span>
          <Link to={ROUTES.TERMS_OF_USE} className="footer-legal-link">
            Terms & Conditions
          </Link>
        </div>
      </div>
    </footer>
  );
}
