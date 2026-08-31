import { useEffect, useRef } from 'react';

const MENTOR_CARDS = [
  {
    id: 'mentor-card-1',
    side: 'left',
    img: '/assets/landing/Rectangle 3.png',
    title: 'Idea Validation Agent',
    subtitle: 'Know if your idea is worth pursuing.',
    desc: 'Turn your idea into a clear, evidence-based opportunity with AI-powered validation. Analyze the problem, target customers, market potential, competition, feasibility, and key risks to understand your idea’s strengths and weaknesses before investing significant time or resources.',
  },
  {
    id: 'mentor-card-2',
    side: 'right',
    img: '/assets/landing/Rectangle 4.png',
    title: 'Market Research & Business Model Agent',
    subtitle: 'Understand your market and monetize effectively.',
    desc: 'Get a deep view of your industry with AI-powered market intelligence. Analyze market trends, competitor benchmarks, customer personas, pricing strategies, and revenue models to differentiate your business and capture market share.',
  },
  {
    id: 'mentor-card-3',
    side: 'left',
    img: '/assets/landing/Rectangle 4-1.png',
    title: 'Survey Intelligence Agent',
    subtitle: 'Discover what your customers really think.',
    desc: 'Create personalized surveys with AI based on your business idea and target audience, then turn responses into meaningful insights. Identify customer pain points, willingness to pay, and demand patterns based on real consumer data.',
  },
  {
    id: 'mentor-card-4',
    side: 'right',
    img: '/assets/landing/Rectangle 6.png',
    title: 'Financial & Capital Planning Agent',
    subtitle: 'Know the numbers before you make the move.',
    desc: 'Analyze costs, pricing models, revenue projections, runway, burn rate, and break-even milestones. AI helps you evaluate the financial sustainability of your venture and construct investor-ready capital plans.',
  },
  {
    id: 'mentor-card-5',
    side: 'left',
    img: '/assets/landing/Rectangle 5.png',
    title: 'MVP & Execution Planning Agent',
    subtitle: 'Build what matters, omit what doesn’t.',
    desc: 'Define your minimum viable product scope, prioritize must-have features, map development timelines, and structure engineering sprints to build faster while keeping development costs optimized.',
  },
  {
    id: 'mentor-card-6',
    side: 'right',
    img: '/assets/landing/Rectangle 3.png',
    title: 'Business Setup & Build Execution Agent',
    subtitle: 'Assemble the team, tools, and operations.',
    desc: 'Identify technical and non-technical talent needs, structure job descriptions, select tech stacks and vendors, and establish legal and compliance frameworks for smooth startup operations.',
  },
  {
    id: 'mentor-card-7',
    side: 'left',
    img: '/assets/landing/Rectangle 4.png',
    title: 'Pre-Traction & GTM Agent',
    subtitle: 'Build momentum before you launch.',
    desc: 'Formulate a go-to-market strategy that connects with early adopters. Build waitlists, community engagement, brand positioning, educational content, and pre-sales channels to ensure day-one traction.',
  },
  {
    id: 'mentor-card-8',
    side: 'right',
    img: '/assets/landing/Rectangle 4-1.png',
    title: 'Testing, Pilot & Improvement Agent',
    subtitle: 'Refine quality with early beta users.',
    desc: 'Run user acceptance testing, gather structured beta feedback, identify bugs, optimize usability, and calculate your Launch Readiness Score to ensure a rock-solid release.',
  },
  {
    id: 'mentor-card-9',
    side: 'left',
    img: '/assets/landing/Rectangle 5.png',
    title: 'Launch, Traction & Customer Validation Agent',
    subtitle: 'Turn early users into revenue and retention.',
    desc: 'Execute commercial launch campaigns, track customer acquisition costs (CAC), lifetime value (LTV), conversion rates, and retention to generate evidence of true product-market fit.',
  },
  {
    id: 'mentor-card-10',
    side: 'right',
    img: '/assets/landing/Rectangle 6.png',
    title: 'Break-Even & Growth Agent',
    subtitle: 'Scale profitably and optimize unit economics.',
    desc: 'Monitor break-even targets, implement upselling and referral loops, increase team productivity with AI automation, and run high-velocity growth experiments.',
  },
  {
    id: 'mentor-card-11',
    side: 'left',
    img: '/assets/landing/Rectangle 3.png',
    title: 'Scale, Expansion & Strategic Future Agent',
    subtitle: 'Expand into new markets and strategic horizons.',
    desc: 'Scale teams, expand to new geographic markets, diversify product offerings, prepare for institutional fundraising, M&A opportunities, or founder exit strategies.',
  },
];

const TARGET_RATIOS = [0.08, 0.16, 0.24, 0.32, 0.4, 0.48, 0.56, 0.64, 0.72, 0.8, 0.88];

export function AIMentorSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const title = titleRef.current;
    const subtitle = subtitleRef.current;
    const cardsContainer = cardsContainerRef.current;
    if (!section || !cardsContainer) return;

    const cards = cardsContainer.querySelectorAll<HTMLDivElement>('.mentor-card-item');

    let ticking = false;

    function handleScroll() {
      if (!section) return;

      const rect = section.getBoundingClientRect();
      const windowH = window.innerHeight;

      if (title && subtitle) {
        const start = windowH;
        const end = windowH * 0.3;
        let textProgress = (start - rect.top) / (start - end);
        textProgress = Math.min(1, Math.max(0, textProgress));

        const titleProgress = Math.min(1, Math.max(0, textProgress / 0.3));
        const subtitleProgress = Math.min(1, Math.max(0, (textProgress - 0.3) / 0.7));

        title.style.setProperty('--reveal-progress', String(titleProgress));
        subtitle.style.setProperty('--reveal-progress', String(subtitleProgress));
      }

      const totalScrollableDistance = section.offsetHeight - windowH;
      if (totalScrollableDistance > 0 && cards.length > 0) {
        let progress = -rect.top / totalScrollableDistance;
        progress = Math.max(0, Math.min(1, progress));

        const isMobile = window.innerWidth <= 768;

        cards.forEach((card, idx) => {
          const targetRatio = TARGET_RATIOS[idx] ?? idx / (cards.length - 1);
          let delta = progress - targetRatio;

          if (idx === cards.length - 1 && delta > 0.05) {
            delta = 0.05;
          }

          const absDelta = Math.abs(delta);

          const verticalMultiplier = isMobile ? windowH * 4.0 : windowH * 6.5;
          const offsetY = -delta * verticalMultiplier;

          let opacity = 1;
          if (absDelta > 0.06) {
            opacity = Math.max(0, Math.min(1, 1 - (absDelta - 0.06) / 0.06));
          }

          if (absDelta <= 0.04) {
            card.classList.add('active-step-card');
          } else {
            card.classList.remove('active-step-card');
          }

          if (isMobile) {
            card.style.transform = `translate3d(-50%, calc(-50% + ${offsetY}px), 0)`;
          } else {
            card.style.transform = `translate3d(0, calc(-50% + ${offsetY}px), 0)`;
          }
          card.style.opacity = String(opacity);
        });
      }

      ticking = false;
    }

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(handleScroll);
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    handleScroll();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <section ref={sectionRef} className="ai-mentor-section" id="ai-mentor">
      <div className="ai-mentor-sticky-frame" id="mentor-sticky-frame">
        <div className="ai-mentor-container">
          <h2 ref={titleRef} className="ai-mentor-title progressive-reveal-text">
            Meet Your AI Mentor
          </h2>
          <p ref={subtitleRef} className="ai-mentor-subtitle progressive-reveal-text delay-reveal">
            Your intelligent startup companion with 11 specialized AI validation and growth agents,
            designed to help you analyze opportunities, validate ideas, build smarter, launch
            confidently, and scale your startup with AI-powered guidance.
          </p>
        </div>

        <div
          ref={cardsContainerRef}
          className="ai-mentor-cards-container"
          id="mentor-cards-container"
        >
          {MENTOR_CARDS.map((card, idx) => (
            <div
              key={card.id}
              className={`mentor-card-item card-${card.side}`}
              id={card.id}
              data-index={idx}
              data-side={card.side}
            >
              <img src={card.img} alt={card.title} className="mentor-card-img" />
              <div className="mentor-card-overlay" />
              <div className="mentor-card-content">
                <h3 className="mentor-card-title">{card.title}</h3>
                <p className="mentor-card-subtitle">{card.subtitle}</p>
                <p className="mentor-card-desc">{card.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
