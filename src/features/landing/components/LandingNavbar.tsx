import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { Logo } from '@components/common/Logo';
import { ROUTES } from '@constants/routes';
import { useAuthStore } from '@store/auth.store';

export function LandingNavbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const role = useAuthStore((state) => state.role);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      void navigate(role === 'admin' ? ROUTES.ADMIN_DASHBOARD : ROUTES.DASHBOARD);
    } else {
      void navigate(ROUTES.REGISTER);
    }
  };

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <header className="navbar">
      <div className="nav-container">
        <Link
          to={ROUTES.HOME}
          className="brand-logo"
          id="nav-brand"
          style={{ display: 'flex', alignItems: 'center' }}
        >
          <Logo size="lg" tone="dark" animated={true} />
        </Link>

        <nav className="nav-menu">
          <a
            href="#storytelling"
            className="nav-link"
            onClick={(e) => scrollToSection(e, 'storytelling')}
          >
            Product
          </a>
          <a
            href="#ai-mentor"
            className="nav-link"
            onClick={(e) => scrollToSection(e, 'ai-mentor')}
          >
            Solutions
          </a>
          <a
            href="#about-aimentor"
            className="nav-link"
            onClick={(e) => scrollToSection(e, 'about-aimentor')}
          >
            About Us
          </a>
          <a href="#faq" className="nav-link" onClick={(e) => scrollToSection(e, 'faq')}>
            FAQ
          </a>
          <a href="#contact" className="nav-link" onClick={(e) => scrollToSection(e, 'contact')}>
            Contact
          </a>
        </nav>

        <div className="nav-actions">
          <button className="btn btn-primary" id="btn-get-started" onClick={handleGetStarted}>
            {isAuthenticated ? 'Dashboard' : 'Get Started'}
          </button>

          {!isAuthenticated ? (
            <div ref={dropdownRef} className={`dropdown-wrapper ${dropdownOpen ? 'active' : ''}`}>
              <button
                type="button"
                className="btn btn-secondary dropdown-toggle"
                id="login-dropdown-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setDropdownOpen((prev) => !prev);
                }}
              >
                Login
                <svg
                  className="chevron-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
              <div className="dropdown-menu dropdown-menu-right" id="login-dropdown-menu">
                <Link
                  to={ROUTES.LOGIN}
                  className="dropdown-item"
                  onClick={() => setDropdownOpen(false)}
                >
                  As user
                </Link>
                <Link
                  to={ROUTES.ADMIN_LOGIN}
                  className="dropdown-item"
                  onClick={() => setDropdownOpen(false)}
                >
                  As Admin
                </Link>
              </div>
            </div>
          ) : (
            <button
              className="btn btn-secondary"
              onClick={() =>
                void navigate(role === 'admin' ? ROUTES.ADMIN_DASHBOARD : ROUTES.DASHBOARD)
              }
            >
              My Workspace
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
