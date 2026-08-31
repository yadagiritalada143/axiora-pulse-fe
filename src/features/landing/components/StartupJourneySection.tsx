import { Link } from 'react-router-dom';

import { ROUTES } from '@constants/routes';

const JOURNEY_STEPS = [
  {
    num: '01',
    bottom: '20%',
    title: 'Register Your Account',
    desc: 'Create your Axiora Pulse account and get started in just a few simple steps.',
    linkText: 'Get Started →',
    to: ROUTES.REGISTER,
    active: false,
  },
  {
    num: '02',
    bottom: '40%',
    title: 'Create a Workspace',
    desc: 'Set up your workspace to organize your ideas and collaborate seamlessly.',
    linkText: 'Create Workspace →',
    to: ROUTES.REGISTER,
    active: false,
  },
  {
    num: '03',
    bottom: '60%',
    title: 'Describe your Idea & Interact with AI Mentor',
    desc: 'Share your idea in detail and interact with your AI Mentor to refine and validate it.',
    linkText: 'Start with AI Mentor →',
    to: ROUTES.REGISTER,
    active: false,
  },
  {
    num: '04',
    bottom: '80%',
    title: 'Run Validation.',
    desc: 'Run comprehensive validations to assess feasibility, market potential and key risks.',
    linkText: 'Run Validation →',
    to: ROUTES.REGISTER,
    active: true,
  },
  {
    num: '05',
    bottom: '100%',
    title: 'Export Indetail Report.',
    desc: 'Download your indetail report with insights, recommendations and next steps.',
    linkText: 'Export Report →',
    to: ROUTES.REGISTER,
    active: false,
  },
];

export function StartupJourneySection() {
  return (
    <section className="startup-journey-section" id="startup-journey">
      <div className="journey-container">
        <div className="journey-header">
          <h2>Where are you now?</h2>
          <h3>Your startup journey with Axiora Pulse</h3>
        </div>

        <div className="journey-grid">
          {JOURNEY_STEPS.map((step) => (
            <div key={step.num} className={`journey-column ${step.active ? 'active' : ''}`}>
              <div className="journey-chart">
                <div className="chart-line" style={{ bottom: step.bottom }} />
              </div>
              <div className="journey-content">
                <div className="journey-num">{step.num}</div>
                <h4 className="journey-title">{step.title}</h4>
                <p className="journey-desc">{step.desc}</p>
                <Link to={step.to} className="journey-link">
                  {step.linkText}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
