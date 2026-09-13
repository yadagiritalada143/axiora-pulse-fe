export interface LegalContentBlock {
  type: 'subheading' | 'paragraph' | 'list-item';
  text: string;
}

export interface LegalSection {
  id: string;
  number: string;
  title: string;
  blocks: LegalContentBlock[];
}

export interface LegalDocument {
  title: string;
  metadata: string[];
  sections: LegalSection[];
}

export const TERMS_OF_USE_DATA: LegalDocument = {
  title: 'AXIORA PULSE TERMS OF USE & LEGAL TERMS',
  metadata: [
    'Operated by Axiora Global Solutions Pvt. Ltd.',
    'Website: www.axiorapulse.com',
    'Effective Date: [Insert Date]',
    'Last Updated: [Insert Date]',
  ],
  sections: [
    {
      id: 'section-1',
      number: '1',
      title: '1. Acceptance of Terms',
      blocks: [
        {
          type: 'paragraph',
          text: 'These Terms of Use (“Terms”) govern access to and use of Axiora Pulse, including its website, applications, AI-powered features, surveys, feedback tools, reports, dashboards, subscriptions, communities and related services.',
        },
        {
          type: 'paragraph',
          text: 'Axiora Pulse is operated by Axiora Global Solutions Pvt. Ltd.',
        },
        {
          type: 'paragraph',
          text: 'By creating an account, purchasing a subscription, clicking an acceptance button, accessing a paid feature or otherwise using Axiora Pulse, you agree to be bound by:',
        },
        {
          type: 'list-item',
          text: 'these Terms',
        },
        {
          type: 'list-item',
          text: 'the Privacy Policy',
        },
        {
          type: 'list-item',
          text: 'applicable subscription or order terms',
        },
        {
          type: 'list-item',
          text: 'any enterprise agreement applicable to your organisation, and',
        },
        {
          type: 'list-item',
          text: 'policies specifically referenced by Axiora Pulse.',
        },
        {
          type: 'paragraph',
          text: 'If you do not agree, you must not use the service.',
        },
      ],
    },
    {
      id: 'section-2',
      number: '2',
      title: '2. About Axiora Pulse',
      blocks: [
        {
          type: 'paragraph',
          text: 'Axiora Pulse is an AI-powered mentorship, market-feedback, validation, analytics and business decision-support platform.',
        },
        {
          type: 'paragraph',
          text: 'Depending on the plan and stage of development, features may include:',
        },
        {
          type: 'list-item',
          text: 'AI Mentor interactions',
        },
        {
          type: 'list-item',
          text: 'idea validation',
        },
        {
          type: 'list-item',
          text: 'market research',
        },
        {
          type: 'list-item',
          text: 'survey generation',
        },
        {
          type: 'list-item',
          text: 'questionnaire generation',
        },
        {
          type: 'list-item',
          text: 'survey and polling distribution',
        },
        {
          type: 'list-item',
          text: 'respondent analytics',
        },
        {
          type: 'list-item',
          text: 'feedback analysis',
        },
        {
          type: 'list-item',
          text: 'financial-readiness support',
        },
        {
          type: 'list-item',
          text: 'GTM planning',
        },
        {
          type: 'list-item',
          text: 'MVP and execution planning',
        },
        {
          type: 'list-item',
          text: 'dashboards',
        },
        {
          type: 'list-item',
          text: 'AI-generated reports',
        },
        {
          type: 'list-item',
          text: 'investor-readiness materials',
        },
        {
          type: 'list-item',
          text: 'business-lifecycle guidance',
        },
        {
          type: 'list-item',
          text: 'strategic recommendations',
        },
        {
          type: 'list-item',
          text: 'document analysis',
        },
        {
          type: 'list-item',
          text: 'human mentorship, and',
        },
        {
          type: 'list-item',
          text: 'related business-support functionality.',
        },
        {
          type: 'paragraph',
          text: 'Features may differ between plans, geographies, beta versions and enterprise deployments.',
        },
      ],
    },
    {
      id: 'section-3',
      number: '3',
      title: '3. Eligibility',
      blocks: [
        {
          type: 'paragraph',
          text: 'You must have legal capacity under applicable law to enter into these Terms.',
        },
        {
          type: 'paragraph',
          text: 'If you are using Axiora Pulse on behalf of a company, institution or other organisation, you represent that you have authority to bind that organisation.',
        },
        {
          type: 'paragraph',
          text: 'If you do not have such authority, you may use Axiora Pulse only in your individual capacity.',
        },
      ],
    },
    {
      id: 'section-4',
      number: '4',
      title: '4. Account Registration',
      blocks: [
        {
          type: 'paragraph',
          text: 'Users must provide accurate and current information when creating an account.',
        },
        {
          type: 'paragraph',
          text: 'You are responsible for:',
        },
        {
          type: 'list-item',
          text: 'maintaining confidentiality of login credentials',
        },
        {
          type: 'list-item',
          text: 'controlling access to your account',
        },
        {
          type: 'list-item',
          text: 'keeping contact information updated',
        },
        {
          type: 'list-item',
          text: 'preventing unauthorised use',
        },
        {
          type: 'list-item',
          text: 'complying with security requirements, and',
        },
        {
          type: 'list-item',
          text: 'promptly reporting suspected compromise.',
        },
        {
          type: 'paragraph',
          text: 'Axiora may require OTP, MFA, passkey, identity verification or other security measures.',
        },
        {
          type: 'paragraph',
          text: 'You must not share accounts where the subscribed plan does not permit shared access.',
        },
      ],
    },
    {
      id: 'section-5',
      number: '5',
      title: '5. Licence to Use Axiora Pulse',
      blocks: [
        {
          type: 'paragraph',
          text: 'Subject to these Terms and payment of applicable fees, Axiora grants you a limited, revocable, non-exclusive, non-transferable and non-sublicensable right to access and use Axiora Pulse for lawful personal or internal business purposes.',
        },
        {
          type: 'paragraph',
          text: 'This licence does not transfer ownership of the platform or any Axiora intellectual property.',
        },
      ],
    },
    {
      id: 'section-6',
      number: '6',
      title: '6. Prohibited Activities',
      blocks: [
        {
          type: 'paragraph',
          text: 'Users must not:',
        },
        {
          type: 'list-item',
          text: 'use Axiora Pulse unlawfully',
        },
        {
          type: 'list-item',
          text: 'commit fraud',
        },
        {
          type: 'list-item',
          text: 'impersonate others',
        },
        {
          type: 'list-item',
          text: 'obtain unauthorised access',
        },
        {
          type: 'list-item',
          text: 'interfere with platform security',
        },
        {
          type: 'list-item',
          text: 'bypass usage limitations',
        },
        {
          type: 'list-item',
          text: 'scrape the platform without written permission',
        },
        {
          type: 'list-item',
          text: 'reverse engineer protected technology except where such restriction is prohibited by law',
        },
        {
          type: 'list-item',
          text: 'copy proprietary platform logic',
        },
        {
          type: 'list-item',
          text: 'resell access without authorisation',
        },
        {
          type: 'list-item',
          text: 'conduct malicious automated activity',
        },
        {
          type: 'list-item',
          text: 'distribute malware',
        },
        {
          type: 'list-item',
          text: 'conduct phishing',
        },
        {
          type: 'list-item',
          text: 'upload unlawful or infringing content',
        },
        {
          type: 'list-item',
          text: 'violate privacy rights',
        },
        {
          type: 'list-item',
          text: 'collect personal data without lawful authority',
        },
        {
          type: 'list-item',
          text: 'intentionally submit false survey responses',
        },
        {
          type: 'list-item',
          text: 'manipulate survey results',
        },
        {
          type: 'list-item',
          text: 'abuse respondent incentives',
        },
        {
          type: 'list-item',
          text: 'harass or discriminate against individuals',
        },
        {
          type: 'list-item',
          text: 'use the platform to facilitate illegal activities',
        },
        {
          type: 'list-item',
          text: 'attempt to extract system prompts, security credentials or confidential platform architecture',
        },
        {
          type: 'list-item',
          text: 'use Axiora output to falsely represent professional certification, or',
        },
        {
          type: 'list-item',
          text: 'use Axiora Pulse in a manner that may expose Axiora to legal, regulatory, reputational or cybersecurity risk.',
        },
        {
          type: 'paragraph',
          text: 'Axiora may investigate suspected violations and suspend relevant functionality while an investigation is pending.',
        },
      ],
    },
    {
      id: 'section-7',
      number: '7',
      title: '7. User Content',
      blocks: [
        {
          type: 'paragraph',
          text: '“User Content” includes information submitted, uploaded or created by you through Axiora Pulse, including:',
        },
        {
          type: 'list-item',
          text: 'business ideas',
        },
        {
          type: 'list-item',
          text: 'documents',
        },
        {
          type: 'list-item',
          text: 'prompts',
        },
        {
          type: 'list-item',
          text: 'spreadsheets',
        },
        {
          type: 'list-item',
          text: 'reports',
        },
        {
          type: 'list-item',
          text: 'survey questions',
        },
        {
          type: 'list-item',
          text: 'survey responses',
        },
        {
          type: 'list-item',
          text: 'logos',
        },
        {
          type: 'list-item',
          text: 'business data',
        },
        {
          type: 'list-item',
          text: 'images',
        },
        {
          type: 'list-item',
          text: 'marketing material',
        },
        {
          type: 'list-item',
          text: 'financial assumptions, and',
        },
        {
          type: 'list-item',
          text: 'other uploaded or entered information.',
        },
        {
          type: 'paragraph',
          text: 'As between you and Axiora, you retain ownership of your pre-existing User Content, subject to rights you grant under these Terms.',
        },
        {
          type: 'paragraph',
          text: 'You grant Axiora a limited licence to host, store, reproduce, process, analyse, transmit, transform and display User Content only as reasonably required to:',
        },
        {
          type: 'list-item',
          text: 'provide the service',
        },
        {
          type: 'list-item',
          text: 'generate requested outputs',
        },
        {
          type: 'list-item',
          text: 'secure the platform',
        },
        {
          type: 'list-item',
          text: 'operate authorised integrations',
        },
        {
          type: 'list-item',
          text: 'provide support',
        },
        {
          type: 'list-item',
          text: 'comply with law, and',
        },
        {
          type: 'list-item',
          text: 'improve the service using de-identified or appropriately permitted data.',
        },
        {
          type: 'paragraph',
          text: 'You represent that you have all rights and permissions necessary to submit the User Content.',
        },
      ],
    },
    {
      id: 'section-8',
      number: '8',
      title: '8. Confidential Ideas and Business Information',
      blocks: [
        {
          type: 'paragraph',
          text: 'Axiora recognises that founders and businesses may submit sensitive commercial information.',
        },
        {
          type: 'paragraph',
          text: 'Axiora will apply its applicable privacy and security controls to such data.',
        },
        {
          type: 'paragraph',
          text: 'However:',
        },
        {
          type: 'list-item',
          text: 'Axiora Pulse is not a legal deposit, patent-registration service or trade-secret escrow service',
        },
        {
          type: 'list-item',
          text: 'uploading an idea does not create a patent, trademark, copyright or other statutory right',
        },
        {
          type: 'list-item',
          text: 'Axiora does not guarantee that an idea is unique',
        },
        {
          type: 'list-item',
          text: 'Axiora does not guarantee that similar ideas are not independently submitted by others, and',
        },
        {
          type: 'list-item',
          text: 'use of the platform alone does not create a fiduciary, attorney-client, accountant-client or investment-adviser relationship.',
        },
        {
          type: 'paragraph',
          text: 'Users should obtain independent IP and legal advice where protection of proprietary ideas is commercially significant.',
        },
      ],
    },
    {
      id: 'section-9',
      number: '9',
      title: '9. AI-Generated Outputs',
      blocks: [
        {
          type: 'paragraph',
          text: 'Axiora Pulse uses artificial intelligence and automated systems.',
        },
        {
          type: 'paragraph',
          text: 'AI outputs may include:',
        },
        {
          type: 'list-item',
          text: 'recommendations',
        },
        {
          type: 'list-item',
          text: 'analyses',
        },
        {
          type: 'list-item',
          text: 'validation scores',
        },
        {
          type: 'list-item',
          text: 'market observations',
        },
        {
          type: 'list-item',
          text: 'forecasts',
        },
        {
          type: 'list-item',
          text: 'survey questions',
        },
        {
          type: 'list-item',
          text: 'business models',
        },
        {
          type: 'list-item',
          text: 'financial scenarios',
        },
        {
          type: 'list-item',
          text: 'legal-risk flags',
        },
        {
          type: 'list-item',
          text: 'GTM recommendations',
        },
        {
          type: 'list-item',
          text: 'dashboards',
        },
        {
          type: 'list-item',
          text: 'action plans, and',
        },
        {
          type: 'list-item',
          text: 'generated reports.',
        },
        {
          type: 'paragraph',
          text: 'AI outputs may occasionally be inaccurate, incomplete or outdated.',
        },
        {
          type: 'paragraph',
          text: 'Important information must be independently verified.',
        },
        {
          type: 'paragraph',
          text: 'Users must apply independent judgment before relying on AI-generated content.',
        },
        {
          type: 'paragraph',
          text: 'Axiora does not warrant that an AI output is:',
        },
        {
          type: 'list-item',
          text: 'accurate',
        },
        {
          type: 'list-item',
          text: 'complete',
        },
        {
          type: 'list-item',
          text: 'unique',
        },
        {
          type: 'list-item',
          text: 'error-free',
        },
        {
          type: 'list-item',
          text: 'legally compliant for every jurisdiction',
        },
        {
          type: 'list-item',
          text: 'suitable for a particular purpose, or',
        },
        {
          type: 'list-item',
          text: 'capable of producing a particular business outcome.',
        },
      ],
    },
    {
      id: 'section-10',
      number: '10',
      title: '10. No Professional Advice',
      blocks: [
        {
          type: 'paragraph',
          text: 'Axiora Pulse provides educational, analytical and decision-support information.',
        },
        {
          type: 'paragraph',
          text: 'Unless Axiora expressly provides a separately contracted professional service through a qualified professional, Axiora Pulse does not provide licensed:',
        },
        {
          type: 'list-item',
          text: 'legal advice',
        },
        {
          type: 'list-item',
          text: 'tax advice',
        },
        {
          type: 'list-item',
          text: 'accounting advice',
        },
        {
          type: 'list-item',
          text: 'audit services',
        },
        {
          type: 'list-item',
          text: 'investment advice',
        },
        {
          type: 'list-item',
          text: 'securities advice',
        },
        {
          type: 'list-item',
          text: 'banking advice',
        },
        {
          type: 'list-item',
          text: 'lending approval',
        },
        {
          type: 'list-item',
          text: 'insurance advice',
        },
        {
          type: 'list-item',
          text: 'statutory certification, or',
        },
        {
          type: 'list-item',
          text: 'regulated financial advice.',
        },
        {
          type: 'paragraph',
          text: 'Users should verify important legal, tax, investment, IP, compliance, loan, accounting and regulatory matters with qualified professionals.',
        },
      ],
    },
    {
      id: 'section-11',
      number: '11',
      title: '11. No Guarantee of Business Success',
      blocks: [
        {
          type: 'paragraph',
          text: 'Axiora Pulse is designed to reduce guesswork and support better decision-making.',
        },
        {
          type: 'paragraph',
          text: 'Axiora does not guarantee:',
        },
        {
          type: 'list-item',
          text: 'startup success',
        },
        {
          type: 'list-item',
          text: 'business profitability',
        },
        {
          type: 'list-item',
          text: 'fundraising',
        },
        {
          type: 'list-item',
          text: 'loan approval',
        },
        {
          type: 'list-item',
          text: 'investor interest',
        },
        {
          type: 'list-item',
          text: 'product-market fit',
        },
        {
          type: 'list-item',
          text: 'customer acquisition',
        },
        {
          type: 'list-item',
          text: 'market demand',
        },
        {
          type: 'list-item',
          text: 'survey response volume',
        },
        {
          type: 'list-item',
          text: 'survey accuracy',
        },
        {
          type: 'list-item',
          text: 'revenue',
        },
        {
          type: 'list-item',
          text: 'break-even',
        },
        {
          type: 'list-item',
          text: 'business growth',
        },
        {
          type: 'list-item',
          text: 'successful expansion, or',
        },
        {
          type: 'list-item',
          text: 'any specific commercial result.',
        },
        {
          type: 'paragraph',
          text: 'Business outcomes depend on many factors outside Axiora’s control.',
        },
      ],
    },
    {
      id: 'section-12',
      number: '12',
      title: '12. Survey and Research Disclaimer',
      blocks: [
        {
          type: 'paragraph',
          text: 'Survey and polling results may be influenced by:',
        },
        {
          type: 'list-item',
          text: 'respondent selection',
        },
        {
          type: 'list-item',
          text: 'sample size',
        },
        {
          type: 'list-item',
          text: 'response bias',
        },
        {
          type: 'list-item',
          text: 'question design',
        },
        {
          type: 'list-item',
          text: 'fraudulent responses',
        },
        {
          type: 'list-item',
          text: 'demographic imbalance',
        },
        {
          type: 'list-item',
          text: 'distribution channel',
        },
        {
          type: 'list-item',
          text: 'timing',
        },
        {
          type: 'list-item',
          text: 'respondent honesty, and',
        },
        {
          type: 'list-item',
          text: 'external market conditions.',
        },
        {
          type: 'paragraph',
          text: 'Unless expressly stated otherwise and supported by appropriate methodology, survey insights should be treated as directional market intelligence, not as guaranteed representation of an entire population.',
        },
        {
          type: 'paragraph',
          text: 'Axiora may provide respondent-quality, confidence or validation indicators, but these do not eliminate research limitations.',
        },
      ],
    },
    {
      id: 'section-13',
      number: '13',
      title: '13. Survey Creator Obligations',
      blocks: [
        {
          type: 'paragraph',
          text: 'A user who creates a survey, poll, employee survey, customer-feedback programme or similar data-collection exercise is responsible for:',
        },
        {
          type: 'list-item',
          text: 'having lawful authority to conduct it',
        },
        {
          type: 'list-item',
          text: 'giving required notices',
        },
        {
          type: 'list-item',
          text: 'obtaining consent where applicable',
        },
        {
          type: 'list-item',
          text: 'selecting appropriate questions',
        },
        {
          type: 'list-item',
          text: 'avoiding unlawful discrimination',
        },
        {
          type: 'list-item',
          text: 'avoiding deceptive or coercive questions',
        },
        {
          type: 'list-item',
          text: 'protecting respondent confidentiality',
        },
        {
          type: 'list-item',
          text: 'complying with employment, education, consumer and sector-specific rules',
        },
        {
          type: 'list-item',
          text: 'obtaining parental consent where legally required for minors',
        },
        {
          type: 'list-item',
          text: 'complying with applicable election or political-polling laws where relevant, and',
        },
        {
          type: 'list-item',
          text: 'ensuring lawful use of collected results.',
        },
        {
          type: 'paragraph',
          text: 'Axiora may remove, suspend or restrict surveys presenting material legal, privacy, security or ethical concerns.',
        },
      ],
    },
    {
      id: 'section-14',
      number: '14',
      title: '14. Intellectual Property Rights',
      blocks: [
        {
          type: 'paragraph',
          text: 'Axiora and its licensors own all rights in Axiora Pulse, including:',
        },
        {
          type: 'list-item',
          text: 'software',
        },
        {
          type: 'list-item',
          text: 'platform architecture',
        },
        {
          type: 'list-item',
          text: 'source code',
        },
        {
          type: 'list-item',
          text: 'object code',
        },
        {
          type: 'list-item',
          text: 'workflows',
        },
        {
          type: 'list-item',
          text: 'proprietary frameworks',
        },
        {
          type: 'list-item',
          text: 'algorithms',
        },
        {
          type: 'list-item',
          text: 'scoring methods',
        },
        {
          type: 'list-item',
          text: 'model orchestration',
        },
        {
          type: 'list-item',
          text: 'dashboard designs',
        },
        {
          type: 'list-item',
          text: 'user-interface elements',
        },
        {
          type: 'list-item',
          text: 'brand assets',
        },
        {
          type: 'list-item',
          text: 'documentation',
        },
        {
          type: 'list-item',
          text: 'templates',
        },
        {
          type: 'list-item',
          text: 'platform prompts',
        },
        {
          type: 'list-item',
          text: 'product logic',
        },
        {
          type: 'list-item',
          text: 'trademarks, and',
        },
        {
          type: 'list-item',
          text: 'confidential know-how.',
        },
        {
          type: 'paragraph',
          text: 'Nothing in these Terms transfers these rights to the user.',
        },
        {
          type: 'paragraph',
          text: 'Users may not copy, reproduce, distribute or commercially exploit Axiora proprietary materials except as expressly permitted.',
        },
      ],
    },
    {
      id: 'section-15',
      number: '15',
      title: '15. Rights in Generated Outputs',
      blocks: [
        {
          type: 'paragraph',
          text: 'Subject to these Terms, users may use reports, analyses and other outputs generated specifically from their lawful User Content for their own business or personal purposes.',
        },
        {
          type: 'paragraph',
          text: 'Axiora retains ownership of:',
        },
        {
          type: 'list-item',
          text: 'the platform',
        },
        {
          type: 'list-item',
          text: 'underlying tools',
        },
        {
          type: 'list-item',
          text: 'methodologies',
        },
        {
          type: 'list-item',
          text: 'templates',
        },
        {
          type: 'list-item',
          text: 'algorithms',
        },
        {
          type: 'list-item',
          text: 'models',
        },
        {
          type: 'list-item',
          text: 'scoring systems',
        },
        {
          type: 'list-item',
          text: 'generic frameworks, and',
        },
        {
          type: 'list-item',
          text: 'pre-existing intellectual property used to create those outputs.',
        },
        {
          type: 'paragraph',
          text: 'AI-generated content may not qualify for exclusive intellectual-property protection in every jurisdiction.',
        },
        {
          type: 'paragraph',
          text: 'Axiora does not guarantee that generated content is unique or free from similarity to content generated for others.',
        },
      ],
    },
    {
      id: 'section-16',
      number: '16',
      title: '16. Feedback to Axiora',
      blocks: [
        {
          type: 'paragraph',
          text: 'If you provide suggestions, product ideas, feature recommendations or feedback about Axiora Pulse, you permit Axiora to use that feedback without restriction or compensation, unless a separate written agreement states otherwise.',
        },
        {
          type: 'paragraph',
          text: 'This clause does not transfer ownership of your separate confidential business idea merely because you used Axiora Pulse.',
        },
      ],
    },
    {
      id: 'section-17',
      number: '17',
      title: '17. Third-Party Services',
      blocks: [
        {
          type: 'paragraph',
          text: 'Axiora Pulse may integrate with third-party products, including:',
        },
        {
          type: 'list-item',
          text: 'payment providers',
        },
        {
          type: 'list-item',
          text: 'AI platforms',
        },
        {
          type: 'list-item',
          text: 'cloud providers',
        },
        {
          type: 'list-item',
          text: 'email providers',
        },
        {
          type: 'list-item',
          text: 'WhatsApp',
        },
        {
          type: 'list-item',
          text: 'analytics platforms',
        },
        {
          type: 'list-item',
          text: 'CRM platforms',
        },
        {
          type: 'list-item',
          text: 'authentication providers',
        },
        {
          type: 'list-item',
          text: 'social networks, and',
        },
        {
          type: 'list-item',
          text: 'data services.',
        },
        {
          type: 'paragraph',
          text: 'Third-party services may be governed by separate terms.',
        },
        {
          type: 'paragraph',
          text: 'Axiora is not responsible for failures, changes, outages or independent actions of third-party services beyond Axiora’s reasonable control.',
        },
      ],
    },
    {
      id: 'section-18',
      number: '18',
      title: '18. Plans and Feature Availability',
      blocks: [
        {
          type: 'paragraph',
          text: 'Axiora may offer:',
        },
        {
          type: 'list-item',
          text: 'free plans',
        },
        {
          type: 'list-item',
          text: 'trials',
        },
        {
          type: 'list-item',
          text: 'paid subscriptions',
        },
        {
          type: 'list-item',
          text: 'usage-based plans',
        },
        {
          type: 'list-item',
          text: 'enterprise plans',
        },
        {
          type: 'list-item',
          text: 'one-time packages, and',
        },
        {
          type: 'list-item',
          text: 'promotional access.',
        },
        {
          type: 'paragraph',
          text: 'Available functionality, limits, storage, usage allowance and support levels depend on the applicable plan.',
        },
        {
          type: 'paragraph',
          text: 'Axiora may modify future plan features, limits and pricing by providing reasonable notice where required.',
        },
        {
          type: 'paragraph',
          text: 'A change will not retrospectively alter amounts already paid for a completed billing period unless legally permitted and appropriately notified.',
        },
      ],
    },
    {
      id: 'section-19',
      number: '19',
      title: '19. Payments',
      blocks: [
        {
          type: 'paragraph',
          text: 'Users agree to pay all applicable charges displayed before purchase.',
        },
        {
          type: 'paragraph',
          text: 'Prices may be exclusive or inclusive of applicable taxes as stated during checkout.',
        },
        {
          type: 'paragraph',
          text: 'Users authorise Axiora and its payment partners to process applicable charges.',
        },
        {
          type: 'paragraph',
          text: 'Failure of payment may result in:',
        },
        {
          type: 'list-item',
          text: 'service restriction',
        },
        {
          type: 'list-item',
          text: 'downgrade',
        },
        {
          type: 'list-item',
          text: 'suspension',
        },
        {
          type: 'list-item',
          text: 'loss of premium access, or',
        },
        {
          type: 'list-item',
          text: 'termination after reasonable recovery attempts.',
        },
        {
          type: 'paragraph',
          text: 'Axiora is not responsible for fees imposed independently by banks, card issuers or payment providers.',
        },
      ],
    },
    {
      id: 'section-20',
      number: '20',
      title: '20. Recurring Subscriptions',
      blocks: [
        {
          type: 'paragraph',
          text: 'Where a plan automatically renews, the renewal structure should be disclosed at purchase.',
        },
        {
          type: 'paragraph',
          text: 'Users may cancel renewal through available account controls or by contacting Axiora.',
        },
        {
          type: 'paragraph',
          text: 'Cancellation ordinarily prevents future renewal and does not automatically create a refund for the current billing period unless required by law or stated in the applicable refund policy.',
        },
      ],
    },
    {
      id: 'section-21',
      number: '21',
      title: '21. Refunds',
      blocks: [
        {
          type: 'paragraph',
          text: 'Fees are generally non-refundable after the applicable service or subscription period has commenced, except:',
        },
        {
          type: 'list-item',
          text: 'where required by applicable law',
        },
        {
          type: 'list-item',
          text: 'for proven duplicate charges',
        },
        {
          type: 'list-item',
          text: 'where Axiora expressly approves a refund',
        },
        {
          type: 'list-item',
          text: 'where a specific written refund policy applies, or',
        },
        {
          type: 'list-item',
          text: 'where a material paid service was not delivered due solely to a verified Axiora technical failure and no reasonable remedy was provided.',
        },
        {
          type: 'paragraph',
          text: 'Promotional credits, trial balances, reward credits and coupons ordinarily have no cash value unless expressly stated.',
        },
        {
          type: 'paragraph',
          text: 'Nothing in this clause limits non-waivable consumer rights.',
        },
      ],
    },
    {
      id: 'section-22',
      number: '22',
      title: '22. Free Trials and Promotions',
      blocks: [
        {
          type: 'paragraph',
          text: 'Axiora may change, withdraw or limit free trials, promotional offers or credits.',
        },
        {
          type: 'paragraph',
          text: 'Users may not create multiple accounts or use deceptive methods to repeatedly obtain introductory benefits.',
        },
        {
          type: 'paragraph',
          text: 'Axiora may cancel promotional access where abuse is reasonably suspected.',
        },
      ],
    },
    {
      id: 'section-23',
      number: '23',
      title: '23. Taxes',
      blocks: [
        {
          type: 'paragraph',
          text: 'Users are responsible for taxes applicable to their purchase except taxes legally imposed directly on Axiora.',
        },
        {
          type: 'paragraph',
          text: 'Axiora may collect GST or other taxes where required.',
        },
        {
          type: 'paragraph',
          text: 'Business users are responsible for providing accurate invoicing and tax information.',
        },
      ],
    },
    {
      id: 'section-24',
      number: '24',
      title: '24. Availability and Product Changes',
      blocks: [
        {
          type: 'paragraph',
          text: 'Axiora seeks to provide reliable service but does not guarantee uninterrupted availability.',
        },
        {
          type: 'paragraph',
          text: 'Services may be affected by:',
        },
        {
          type: 'list-item',
          text: 'maintenance',
        },
        {
          type: 'list-item',
          text: 'model-provider outages',
        },
        {
          type: 'list-item',
          text: 'cloud outages',
        },
        {
          type: 'list-item',
          text: 'telecommunications failure',
        },
        {
          type: 'list-item',
          text: 'cyberattacks',
        },
        {
          type: 'list-item',
          text: 'force majeure',
        },
        {
          type: 'list-item',
          text: 'regulatory restrictions',
        },
        {
          type: 'list-item',
          text: 'third-party API changes, or',
        },
        {
          type: 'list-item',
          text: 'necessary security actions.',
        },
        {
          type: 'paragraph',
          text: 'Axiora may add, modify, discontinue or replace features where commercially or technically necessary.',
        },
        {
          type: 'paragraph',
          text: 'Where a material change affects a paid committed service, Axiora will apply reasonable contractual and legal obligations.',
        },
      ],
    },
    {
      id: 'section-25',
      number: '25',
      title: '25. Beta and Experimental Features',
      blocks: [
        {
          type: 'paragraph',
          text: 'Certain features may be marked beta, preview, experimental or early access.',
        },
        {
          type: 'paragraph',
          text: 'Such features may:',
        },
        {
          type: 'list-item',
          text: 'be incomplete',
        },
        {
          type: 'list-item',
          text: 'contain errors',
        },
        {
          type: 'list-item',
          text: 'change materially',
        },
        {
          type: 'list-item',
          text: 'have limited support, or',
        },
        {
          type: 'list-item',
          text: 'be discontinued.',
        },
        {
          type: 'paragraph',
          text: 'Beta features should not be relied upon for critical production or legally sensitive decisions unless expressly agreed otherwise.',
        },
      ],
    },
    {
      id: 'section-26',
      number: '26',
      title: '26. Suspension',
      blocks: [
        {
          type: 'paragraph',
          text: 'Axiora may immediately suspend or restrict access where reasonably necessary to:',
        },
        {
          type: 'list-item',
          text: 'protect security',
        },
        {
          type: 'list-item',
          text: 'prevent fraud',
        },
        {
          type: 'list-item',
          text: 'comply with law',
        },
        {
          type: 'list-item',
          text: 'investigate abuse',
        },
        {
          type: 'list-item',
          text: 'prevent harm',
        },
        {
          type: 'list-item',
          text: 'address unpaid amounts',
        },
        {
          type: 'list-item',
          text: 'protect third-party rights',
        },
        {
          type: 'list-item',
          text: 'protect platform integrity, or',
        },
        {
          type: 'list-item',
          text: 'prevent material breach of these Terms.',
        },
        {
          type: 'paragraph',
          text: 'Where appropriate, Axiora may provide notice and an opportunity to remedy the issue.',
        },
      ],
    },
    {
      id: 'section-27',
      number: '27',
      title: '27. Termination',
      blocks: [
        {
          type: 'paragraph',
          text: 'Users may stop using Axiora Pulse at any time.',
        },
        {
          type: 'paragraph',
          text: 'Axiora may terminate an account for:',
        },
        {
          type: 'list-item',
          text: 'material breach',
        },
        {
          type: 'list-item',
          text: 'repeated policy violation',
        },
        {
          type: 'list-item',
          text: 'fraudulent conduct',
        },
        {
          type: 'list-item',
          text: 'unlawful activity',
        },
        {
          type: 'list-item',
          text: 'serious security risk',
        },
        {
          type: 'list-item',
          text: 'non-payment',
        },
        {
          type: 'list-item',
          text: 'misuse of AI, surveys or platform infrastructure, or',
        },
        {
          type: 'list-item',
          text: 'circumstances requiring termination by law.',
        },
        {
          type: 'paragraph',
          text: 'Termination may result in loss of access to stored content after any applicable retrieval or retention period.',
        },
        {
          type: 'paragraph',
          text: 'Users are responsible for exporting necessary information before closing an account where export functionality is available.',
        },
      ],
    },
    {
      id: 'section-28',
      number: '28',
      title: '28. Data After Termination',
      blocks: [
        {
          type: 'paragraph',
          text: 'Following account closure, Axiora may delete or anonymise account data according to its Privacy Policy, applicable retention periods and legal requirements.',
        },
        {
          type: 'paragraph',
          text: 'Axiora is not obligated to retain inactive user content indefinitely unless expressly agreed in an enterprise contract.',
        },
      ],
    },
    {
      id: 'section-29',
      number: '29',
      title: '29. User Responsibility for Decisions',
      blocks: [
        {
          type: 'paragraph',
          text: 'You acknowledge that you remain solely responsible for decisions you make using Axiora Pulse.',
        },
        {
          type: 'paragraph',
          text: 'Axiora is not responsible merely because a user:',
        },
        {
          type: 'list-item',
          text: 'follows an AI recommendation',
        },
        {
          type: 'list-item',
          text: 'launches or does not launch a business',
        },
        {
          type: 'list-item',
          text: 'spends or loses money',
        },
        {
          type: 'list-item',
          text: 'hires or dismisses a person',
        },
        {
          type: 'list-item',
          text: 'enters into a contract',
        },
        {
          type: 'list-item',
          text: 'applies for funding',
        },
        {
          type: 'list-item',
          text: 'changes pricing',
        },
        {
          type: 'list-item',
          text: 'follows an investment strategy',
        },
        {
          type: 'list-item',
          text: 'makes a regulatory filing, or',
        },
        {
          type: 'list-item',
          text: 'relies on a survey outcome.',
        },
        {
          type: 'paragraph',
          text: 'Important decisions should be independently evaluated.',
        },
      ],
    },
    {
      id: 'section-30',
      number: '30',
      title: '30. Disclaimer of Warranties',
      blocks: [
        {
          type: 'paragraph',
          text: 'To the maximum extent permitted by law, Axiora Pulse is provided on an “as available” and “as is” basis.',
        },
        {
          type: 'paragraph',
          text: 'Axiora does not make warranties that:',
        },
        {
          type: 'list-item',
          text: 'the service will always be available',
        },
        {
          type: 'list-item',
          text: 'every defect will be corrected immediately',
        },
        {
          type: 'list-item',
          text: 'outputs will be error-free',
        },
        {
          type: 'list-item',
          text: 'all external information will be current',
        },
        {
          type: 'list-item',
          text: 'generated content will be unique',
        },
        {
          type: 'list-item',
          text: 'recommendations will achieve results, or',
        },
        {
          type: 'list-item',
          text: 'the platform will satisfy every specific business requirement.',
        },
        {
          type: 'paragraph',
          text: 'Any warranties that cannot legally be excluded remain unaffected.',
        },
      ],
    },
    {
      id: 'section-31',
      number: '31',
      title: '31. Limitation of Liability',
      blocks: [
        {
          type: 'paragraph',
          text: 'To the maximum extent permitted by applicable law, Axiora, its directors, employees, affiliates and service providers will not be liable for indirect, incidental, special, exemplary, punitive or consequential losses arising from the use of Axiora Pulse, including loss of:',
        },
        {
          type: 'list-item',
          text: 'profits',
        },
        {
          type: 'list-item',
          text: 'business opportunity',
        },
        {
          type: 'list-item',
          text: 'goodwill',
        },
        {
          type: 'list-item',
          text: 'anticipated savings',
        },
        {
          type: 'list-item',
          text: 'investment',
        },
        {
          type: 'list-item',
          text: 'customer relationships, or',
        },
        {
          type: 'list-item',
          text: 'business reputation.',
        },
        {
          type: 'paragraph',
          text: 'To the maximum extent permitted by law, Axiora’s aggregate liability arising from the affected service shall not exceed the amount actually paid by the claimant to Axiora for that service during the six months immediately preceding the event giving rise to the claim, or ₹5,000 where no fee was paid, whichever applicable contractual basis governs the claim.',
        },
        {
          type: 'paragraph',
          text: 'This limitation does not apply where liability cannot legally be excluded or limited.',
        },
      ],
    },
    {
      id: 'section-32',
      number: '32',
      title: '32. Indemnity',
      blocks: [
        {
          type: 'paragraph',
          text: 'To the maximum extent permitted by law, business and professional users agree to indemnify and hold harmless Axiora and its authorised personnel against third-party claims, losses, penalties and reasonable costs arising from:',
        },
        {
          type: 'list-item',
          text: 'unlawful User Content',
        },
        {
          type: 'list-item',
          text: 'infringement of third-party rights',
        },
        {
          type: 'list-item',
          text: 'unlawful surveys',
        },
        {
          type: 'list-item',
          text: 'privacy violations caused by the user’s instructions;',
        },
        {
          type: 'list-item',
          text: 'misuse of respondent data',
        },
        {
          type: 'list-item',
          text: 'fraud',
        },
        {
          type: 'list-item',
          text: 'intentional abuse of the platform, or',
        },
        {
          type: 'list-item',
          text: 'material breach of these Terms.',
        },
        {
          type: 'paragraph',
          text: 'This clause does not require a consumer to waive any non-waivable statutory right.',
        },
      ],
    },
    {
      id: 'section-33',
      number: '33',
      title: '33. Consumer Rights',
      blocks: [
        {
          type: 'paragraph',
          text: 'Nothing in these Terms is intended to exclude rights that cannot legally be excluded under applicable consumer-protection law.',
        },
        {
          type: 'paragraph',
          text: 'Where a provision conflicts with a mandatory consumer right, the mandatory legal requirement will apply to the extent of the conflict.',
        },
      ],
    },
    {
      id: 'section-34',
      number: '34',
      title: '34. Privacy',
      blocks: [
        {
          type: 'paragraph',
          text: 'Use of Axiora Pulse is subject to the Axiora Pulse Privacy Policy.',
        },
        {
          type: 'paragraph',
          text: 'Users creating surveys or handling third-party data must independently ensure that their own use complies with applicable privacy law.',
        },
      ],
    },
    {
      id: 'section-35',
      number: '35',
      title: '35. Electronic Communications',
      blocks: [
        {
          type: 'paragraph',
          text: 'You consent to receive legally permissible electronic communications relating to:',
        },
        {
          type: 'list-item',
          text: 'account security',
        },
        {
          type: 'list-item',
          text: 'authentication',
        },
        {
          type: 'list-item',
          text: 'transactions',
        },
        {
          type: 'list-item',
          text: 'subscriptions',
        },
        {
          type: 'list-item',
          text: 'billing',
        },
        {
          type: 'list-item',
          text: 'platform changes',
        },
        {
          type: 'list-item',
          text: 'legal notices',
        },
        {
          type: 'list-item',
          text: 'support, and',
        },
        {
          type: 'list-item',
          text: 'requested services.',
        },
        {
          type: 'paragraph',
          text: 'Electronic acceptance and records may be used to evidence contractual actions in accordance with applicable law.',
        },
      ],
    },
    {
      id: 'section-36',
      number: '36',
      title: '36. Force Majeure',
      blocks: [
        {
          type: 'paragraph',
          text: 'Axiora will not be liable for delays or failure caused by events beyond its reasonable control, including:',
        },
        {
          type: 'list-item',
          text: 'natural disasters',
        },
        {
          type: 'list-item',
          text: 'war',
        },
        {
          type: 'list-item',
          text: 'terrorism',
        },
        {
          type: 'list-item',
          text: 'riots',
        },
        {
          type: 'list-item',
          text: 'pandemic',
        },
        {
          type: 'list-item',
          text: 'government action',
        },
        {
          type: 'list-item',
          text: 'court orders',
        },
        {
          type: 'list-item',
          text: 'internet failure',
        },
        {
          type: 'list-item',
          text: 'telecommunications failure',
        },
        {
          type: 'list-item',
          text: 'cloud-service outage',
        },
        {
          type: 'list-item',
          text: 'power failure',
        },
        {
          type: 'list-item',
          text: 'cyberattack',
        },
        {
          type: 'list-item',
          text: 'labour disruption, or',
        },
        {
          type: 'list-item',
          text: 'failure of critical third-party providers.',
        },
      ],
    },
    {
      id: 'section-37',
      number: '37',
      title: '37. Governing Law',
      blocks: [
        {
          type: 'paragraph',
          text: 'These Terms are governed by the laws of India.',
        },
        {
          type: 'paragraph',
          text: 'Subject to mandatory consumer-protection rights and applicable statutory forums, courts having jurisdiction in Hyderabad, Telangana shall have jurisdiction over disputes connected with these Terms.',
        },
      ],
    },
    {
      id: 'section-38',
      number: '38',
      title: '38. Commercial Dispute Resolution',
      blocks: [
        {
          type: 'paragraph',
          text: 'For disputes involving business, enterprise or professional users, the parties should first attempt good-faith resolution through written notice.',
        },
        {
          type: 'paragraph',
          text: 'If the dispute is not resolved within 30 days, it may be referred to arbitration in accordance with the Arbitration and Conciliation Act, 1996, as amended.',
        },
        {
          type: 'paragraph',
          text: 'Unless otherwise agreed:',
        },
        {
          type: 'list-item',
          text: 'arbitration shall be conducted by a sole arbitrator',
        },
        {
          type: 'list-item',
          text: 'the seat and venue shall be Hyderabad, Telangana',
        },
        {
          type: 'list-item',
          text: 'proceedings shall be conducted in English, and',
        },
        {
          type: 'list-item',
          text: 'the award shall be final and binding subject to applicable law.',
        },
        {
          type: 'paragraph',
          text: 'This section does not prevent either party from seeking urgent interim or injunctive relief from a competent court.',
        },
        {
          type: 'paragraph',
          text: 'Consumer users retain access to statutory consumer-dispute forums where applicable.',
        },
      ],
    },
    {
      id: 'section-39',
      number: '39',
      title: '39. Grievance Officer',
      blocks: [
        {
          type: 'paragraph',
          text: 'Questions, complaints or grievances regarding Axiora Pulse may be submitted to:\n\nAxiora Global Solutions Pvt. Ltd.\nEmail: support@axioraglobalsolutions.com\nRegistered Office: Hyderabad, Telangana, India\nWebsite: www.axiorapulse.com',
        },
      ],
    },
    {
      id: 'section-40',
      number: '40',
      title: '40. Changes to These Terms',
      blocks: [
        {
          type: 'paragraph',
          text: 'Axiora may revise these Terms for legal, regulatory, security, technical or commercial reasons.',
        },
        {
          type: 'paragraph',
          text: 'Updated Terms will be posted with a revised effective date.',
        },
        {
          type: 'paragraph',
          text: 'Where legally required, material changes will be communicated separately.',
        },
        {
          type: 'paragraph',
          text: 'Continued use after an effective change constitutes acceptance only to the extent permitted under applicable law.',
        },
      ],
    },
    {
      id: 'section-41',
      number: '41',
      title: '41. Severability',
      blocks: [
        {
          type: 'paragraph',
          text: 'If any provision is held invalid or unenforceable, the remaining provisions will continue in effect.',
        },
        {
          type: 'paragraph',
          text: 'The affected provision shall be interpreted or modified only to the minimum extent necessary to make it enforceable where legally permitted.',
        },
      ],
    },
    {
      id: 'section-42',
      number: '42',
      title: '42. No Waiver',
      blocks: [
        {
          type: 'paragraph',
          text: 'Failure by Axiora to enforce a provision immediately does not waive its right to enforce that provision later.',
        },
      ],
    },
    {
      id: 'section-43',
      number: '43',
      title: '43. Assignment',
      blocks: [
        {
          type: 'paragraph',
          text: 'Users may not assign their rights or obligations under these Terms without Axiora’s prior written approval.',
        },
        {
          type: 'paragraph',
          text: 'Axiora may assign or transfer these Terms as part of a merger, restructuring, acquisition, corporate reorganisation or transfer of the relevant business, subject to applicable law.',
        },
      ],
    },
    {
      id: 'section-44',
      number: '44',
      title: '44. Entire Agreement',
      blocks: [
        {
          type: 'paragraph',
          text: 'These Terms, together with the Privacy Policy, applicable order forms, plan terms and signed enterprise agreements, constitute the agreement governing use of Axiora Pulse.',
        },
        {
          type: 'paragraph',
          text: 'Where an individually signed enterprise agreement expressly conflicts with these standard Terms, the signed enterprise agreement will control for that customer’s use.',
        },
      ],
    },
    {
      id: 'section-45',
      number: '45',
      title: '45. Contact',
      blocks: [
        {
          type: 'paragraph',
          text: 'Axiora Global Solutions Pvt. Ltd.\nHyderabad, Telangana, India\nWebsite: www.axiorapulse.com\nEmail: support@axiorapulse.com',
        },
        {
          type: 'paragraph',
          text: 'By creating an account, purchasing a subscription or continuing to use Axiora Pulse, you confirm that you have read, understood and agreed to these Terms.',
        },
      ],
    },
  ],
};
