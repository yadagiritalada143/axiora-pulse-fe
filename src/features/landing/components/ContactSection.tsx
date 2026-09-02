import { useState } from 'react';
import { toast } from 'sonner';

import { useSubmitContact } from '../hooks/useSubmitContact';

export function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Inquiry',
    message: '',
  });

  const submitContactMutation = useSubmitContact();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = formData.name.trim();
    const email = formData.email.trim();
    const message = formData.message.trim();
    const topic = formData.subject.trim();

    if (!name || !email || !message) {
      toast.error('Please fill in all required fields.');
      return;
    }

    submitContactMutation.mutate(
      {
        name,
        email,
        topic,
        message,
      },
      {
        onSuccess: () => {
          setFormData({
            name: '',
            email: '',
            subject: 'General Inquiry',
            message: '',
          });
        },
      },
    );
  };

  const isSubmitting = submitContactMutation.isPending;

  return (
    <section className="contact-section" id="contact">
      <div className="contact-container">
        <div className="contact-info-col">
          <span className="contact-badge">GET IN TOUCH</span>
          <h2 className="contact-heading">
            Let&apos;s talk about
            <br />
            your <span className="highlight-orange">next idea</span>.
          </h2>
          <p className="contact-subtext">
            Have questions about Axiora Pulse, our AI validation agents, or customized startup
            enterprise solutions? Our team is here to help you every step of the way.
          </p>

          <div className="contact-details-list">
            <div className="contact-detail-item">
              <div className="contact-icon-wrapper">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <div>
                <span className="contact-detail-label">Email Us</span>
                <a href="mailto:support@axiorapulse.com" className="contact-detail-val">
                  support@axiorapulse.com
                </a>
              </div>
            </div>

            <div className="contact-detail-item">
              <div className="contact-icon-wrapper">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <div>
                <span className="contact-detail-label">Response Time</span>
                <span className="contact-detail-val">Within 24 business hours</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Form Card */}
        <div className="contact-form-card">
          <form onSubmit={handleSubmit} className="contact-form-inner">
            <div className="form-row-2">
              <div className="form-group-custom">
                <label htmlFor="contact-name" className="form-label-custom">
                  Your Name <span className="required-star">*</span>
                </label>
                <input
                  id="contact-name"
                  type="text"
                  placeholder="e.g. Alex Morgan"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="form-input-custom"
                  disabled={isSubmitting}
                />
              </div>

              <div className="form-group-custom">
                <label htmlFor="contact-email" className="form-label-custom">
                  Email Address <span className="required-star">*</span>
                </label>
                <input
                  id="contact-email"
                  type="email"
                  placeholder="alex@company.com"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="form-input-custom"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="form-group-custom">
              <label htmlFor="contact-subject" className="form-label-custom">
                Subject / Topic
              </label>
              <select
                id="contact-subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="form-input-custom form-select-custom"
                disabled={isSubmitting}
              >
                <option value="General Inquiry">General Inquiry</option>
                <option value="Product Feedback">Product Feedback</option>
                <option value="Partnership / Investment">Partnership / Investment</option>
                <option value="Custom Enterprise Plan">Custom Enterprise Plan</option>
                <option value="Support">Technical Support</option>
              </select>
            </div>

            <div className="form-group-custom">
              <label htmlFor="contact-message" className="form-label-custom">
                Message <span className="required-star">*</span>
              </label>
              <textarea
                id="contact-message"
                rows={4}
                placeholder="Tell us about your startup idea or what you need help with..."
                required
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="form-input-custom form-textarea-custom"
                disabled={isSubmitting}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-submit-contact"
              id="btn-submit-contact"
            >
              {isSubmitting ? (
                <span className="submit-loading-text">Sending message...</span>
              ) : (
                <>
                  <span>Send Message</span>
                  <svg
                    className="cta-arrow"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
