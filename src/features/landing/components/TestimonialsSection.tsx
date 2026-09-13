const TESTIMONIALS = [
  {
    avatar: '/assets/testimonials/testimonial-1.jpg',
    name: 'Vamsi Krishna',
    role: 'Startup Founder',
    quote:
      'I wish I had validated before investing so much time. Looking back, I would have spent weeks validating instead of months rebuilding.',
  },
  {
    avatar: '/assets/testimonials/testimonial-2.jpg',
    name: 'Sravani P',
    role: 'Beta Founder',
    quote:
      'I came in looking for validation. I left realizing I was solving the wrong problem. That insight alone probably saved me months of development.',
  },
  {
    avatar: '/assets/testimonials/testimonial-3.jpg',
    name: 'Sai Teja',
    role: 'Beta Tester',
    quote:
      "I've spent weeks doing market research before. Getting everything organized in one place made it much easier to make confident decisions.",
  },
  {
    avatar: '/assets/testimonials/testimonial-4.jpg',
    name: 'Ramya T',
    role: 'Entrepreneur',
    quote:
      "Instead of asking 'Is my idea good?', I finally started asking 'Is this a real problem worth solving?' That changed everything.",
  },
  {
    avatar: '/assets/testimonials/testimonial-5.jpg',
    name: 'Tarun Varma',
    role: 'Beta Founder',
    quote: "This didn't just validate my idea—it exposed the risks I hadn't even considered.",
  },
  {
    avatar: '/assets/testimonials/testimonial-6.jpg',
    name: 'Karthik G',
    role: 'SaaS Founder',
    quote:
      "I wish I'd had this before building my last startup. It would've saved me a lot of time, money, and unnecessary features.",
  },
  {
    avatar: '/assets/testimonials/testimonial-7.jpg',
    name: 'Anusha K',
    role: 'Beta Founder',
    quote: "I realized I wasn't validating my idea—I was validating my own assumptions.",
  },
  {
    avatar: '/assets/testimonials/testimonial-8.jpg',
    name: 'Chaitanya Kumar',
    role: 'Early Beta User',
    quote:
      "Within an hour, I had more clarity than I'd gained from weeks of Googling and watching startup videos.",
  },
  {
    avatar: '/assets/testimonials/testimonial-9.jpg',
    name: 'Prasanna T',
    role: 'Beta Tester',
    quote:
      "The biggest value wasn't the AI. It was the confidence that I was finally making decisions backed by evidence.",
  },
  {
    avatar: '/assets/testimonials/testimonial-10.jpg',
    name: 'Ramarao',
    role: 'Entrepreneur',
    quote:
      "I stopped wondering if my idea would work. I started understanding why it would—or wouldn't.",
  },
];

export function TestimonialsSection() {
  const allTestimonials = [...TESTIMONIALS, ...TESTIMONIALS];

  return (
    <section className="testimonials-section" id="testimonials">
      <div className="testimonials-inner">
        {/* Header */}
        <div className="testimonials-header">
          <span className="testimonials-badge">TESTIMONIALS</span>
          <h2 className="testimonials-title">
            Don&apos;t take our word for it!
            <br />
            Hear it from our partners.
          </h2>
        </div>

        {/* Cards Row with Infinite Loop */}
        <div className="testimonials-scroll-wrapper">
          <div className="testimonials-track">
            {allTestimonials.map((t, idx) => (
              <div key={`${t.name}-${idx}`} className="tcard tcard-text">
                <img className="tcard-avatar" src={t.avatar} alt={t.name} />
                <p className="tcard-quote">&ldquo;{t.quote}&rdquo;</p>
                <div className="tcard-author">
                  <span className="tcard-name">{t.name}</span>
                  <span className="tcard-role">{t.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
