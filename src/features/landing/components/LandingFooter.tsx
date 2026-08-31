import { Logo } from '@components/common/Logo';

export function LandingFooter() {
  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <footer className="site-footer" id="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <div className="mb-4">
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
          <h4 className="footer-col-title">Connect</h4>
          <ul className="footer-links">
            <li>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="footer-link"
              >
                Twitter / X
              </a>
            </li>
            <li>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="footer-link"
              >
                LinkedIn
              </a>
            </li>
            <li>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="footer-link"
              >
                Instagram
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
    </footer>
  );
}
