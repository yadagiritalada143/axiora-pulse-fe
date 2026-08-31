import { useState } from 'react';

interface FAQItem {
  id: number;
  num: string;
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    id: 1,
    num: '01',
    question: 'Is there a free plan available?',
    answer:
      'Yes! We offer a free plan that lets you explore core features with no credit card required. Upgrade anytime as your needs grow.',
  },
  {
    id: 2,
    num: '02',
    question: 'Can I invite my team members?',
    answer:
      'Absolutely. Invite teammates, assign roles, and collaborate in real time from a shared workspace.',
  },
  {
    id: 3,
    num: '03',
    question: 'Does it integrate with other tools?',
    answer:
      'Yes, Axiora Pulse integrates with popular tools like Slack, Notion, Google Workspace, and more to keep your workflow seamless.',
  },
  {
    id: 4,
    num: '04',
    question: 'Can I upgrade or downgrade my plan anytime?',
    answer:
      'Absolutely. You can upgrade your plan at any time from your account settings with no penalties or hidden fees but you cannot downgrade your plan.',
  },
  {
    id: 5,
    num: '05',
    question: 'Is my project data secure?',
    answer:
      'Absolutely. We use enterprise-grade encryption, secure cloud infrastructure, and regular audits to ensure your data stays safe and private.',
  },
];

export function FAQSection() {
  const [activeId, setActiveId] = useState<number | null>(2);

  const toggleItem = (id: number) => {
    setActiveId((prev) => (prev === id ? null : id));
  };

  return (
    <section className="faq-section" id="faq">
      <div className="faq-container">
        <div className="faq-left">
          <h2 className="faq-title">
            Frequently Asked
            <br />
            Questions
          </h2>
          <div className="faq-contact">
            <h3>Still have a question?</h3>
            <p>
              Don&apos;t worry we&apos;re here for you.
              <br />
              Don&apos;t worry we&apos;re free for consultation.
            </p>
            <a
              href="#contact"
              className="faq-btn"
              onClick={(e) => {
                e.preventDefault();
                document
                  .getElementById('contact')
                  ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
            >
              Contact Us &rarr;
            </a>
          </div>
        </div>

        <div className="faq-right">
          {FAQS.map((faq) => {
            const isActive = activeId === faq.id;
            return (
              <div
                key={faq.id}
                className={`faq-item ${isActive ? 'active' : ''}`}
                id={`faq-item-${faq.id}`}
              >
                <div
                  className="faq-header"
                  id={`faq-header-${faq.id}`}
                  onClick={() => toggleItem(faq.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      toggleItem(faq.id);
                    }
                  }}
                >
                  <span className="faq-num">{faq.num}</span>
                  <h4>{faq.question}</h4>
                  <span className="faq-toggle">{isActive ? '−' : '+'}</span>
                </div>
                <div
                  className="faq-body"
                  id={`faq-body-${faq.id}`}
                  style={{
                    maxHeight: isActive ? '200px' : '0px',
                    overflow: 'hidden',
                    transition: 'max-height 0.3s ease',
                  }}
                >
                  <p>{faq.answer}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
