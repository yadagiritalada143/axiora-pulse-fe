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

export const PRIVACY_POLICY_DATA: LegalDocument = {
  title: 'AXIORA PULSE PRIVACY POLICY',
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
      title: '1. Introduction',
      blocks: [
        {
          type: 'paragraph',
          text: 'Axiora Global Solutions Pvt. Ltd. (“Axiora”, “Axiora Global”, “we”, “our”, or “us”) owns and operates Axiora Pulse, an AI-Mentor mentorship, market-feedback, validation, analytics and business decision-support platform.',
        },
        {
          type: 'paragraph',
          text: 'This Privacy Policy explains how we collect, use, store, process, disclose and protect personal data when individuals:',
        },
        {
          type: 'list-item',
          text: 'visit or use the Axiora Pulse website or application',
        },
        {
          type: 'list-item',
          text: 'create an account or workspace',
        },
        {
          type: 'list-item',
          text: 'interact with Axiora Pulse AI Mentor or other AI-Mentor features',
        },
        {
          type: 'list-item',
          text: 'upload ideas, documents, business information or other content',
        },
        {
          type: 'list-item',
          text: 'create or participate in surveys, polls or feedback programmes',
        },
        {
          type: 'list-item',
          text: 'subscribe to paid services',
        },
        {
          type: 'list-item',
          text: 'communicate with Axiora',
        },
        {
          type: 'list-item',
          text: 'participate in communities, webinars, promotions or referral programmes, or',
        },
        {
          type: 'list-item',
          text: 'otherwise interact with Axiora Pulse.',
        },
        {
          type: 'paragraph',
          text: 'By using Axiora Pulse, you acknowledge that you have read this Privacy Policy.',
        },
        {
          type: 'paragraph',
          text: 'Where consent is legally required, we will seek appropriate consent before processing personal data.',
        },
      ],
    },
    {
      id: 'section-2',
      number: '2',
      title: '2. Who We Are',
      blocks: [
        {
          type: 'paragraph',
          text: 'For personal data for which Axiora determines the purpose and means of processing, Axiora Global Solutions Pvt. Ltd. acts as the relevant Data Fiduciary/data controller, subject to applicable law.',
        },
        {
          type: 'paragraph',
          text: 'For certain surveys, employee-feedback programmes, customer-feedback programmes or enterprise workspaces created by our customers, the customer may determine why personal data is being collected. In such circumstances, the customer may act as the relevant Data Fiduciary/controller and Axiora may process data on its behalf as a service provider or Data Processor.',
        },
        {
          type: 'paragraph',
          text: 'Users creating surveys or collecting information through Axiora Pulse are independently responsible for ensuring that their collection and use of respondent information is lawful.',
        },
      ],
    },
    {
      id: 'section-3',
      number: '3',
      title: '3. Personal Data We May Collect',
      blocks: [
        {
          type: 'paragraph',
          text: 'Depending upon how you use Axiora Pulse, we may collect the following categories of information.',
        },
        {
          type: 'subheading',
          text: '3.1 Account and Identity Information',
        },
        {
          type: 'paragraph',
          text: 'This may include:',
        },
        {
          type: 'list-item',
          text: 'name',
        },
        {
          type: 'list-item',
          text: 'email address',
        },
        {
          type: 'list-item',
          text: 'mobile number',
        },
        {
          type: 'list-item',
          text: 'organisation name',
        },
        {
          type: 'list-item',
          text: 'job title or designation',
        },
        {
          type: 'list-item',
          text: 'account username',
        },
        {
          type: 'list-item',
          text: 'authentication information',
        },
        {
          type: 'list-item',
          text: 'OTP or verification records',
        },
        {
          type: 'list-item',
          text: 'account and workspace identifiers, and',
        },
        {
          type: 'list-item',
          text: 'subscription or entitlement information.',
        },
        {
          type: 'paragraph',
          text: 'Passwords should be stored only in protected cryptographic form where password authentication is used.',
        },
        {
          type: 'subheading',
          text: '3.2 Founder, Business and Workspace Information',
        },
        {
          type: 'paragraph',
          text: 'Axiora Pulse may process information voluntarily provided by users, including:',
        },
        {
          type: 'list-item',
          text: 'business ideas',
        },
        {
          type: 'list-item',
          text: 'startup concepts',
        },
        {
          type: 'list-item',
          text: 'problem statements',
        },
        {
          type: 'list-item',
          text: 'target-customer information',
        },
        {
          type: 'list-item',
          text: 'founder background',
        },
        {
          type: 'list-item',
          text: 'business stage',
        },
        {
          type: 'list-item',
          text: 'financial assumptions',
        },
        {
          type: 'list-item',
          text: 'capital and runway information',
        },
        {
          type: 'list-item',
          text: 'pricing assumptions',
        },
        {
          type: 'list-item',
          text: 'product plans',
        },
        {
          type: 'list-item',
          text: 'competitor information',
        },
        {
          type: 'list-item',
          text: 'business-model information',
        },
        {
          type: 'list-item',
          text: 'GTM plans',
        },
        {
          type: 'list-item',
          text: 'uploaded business files',
        },
        {
          type: 'list-item',
          text: 'presentations',
        },
        {
          type: 'list-item',
          text: 'reports',
        },
        {
          type: 'list-item',
          text: 'spreadsheets',
        },
        {
          type: 'list-item',
          text: 'survey data',
        },
        {
          type: 'list-item',
          text: 'feedback data',
        },
        {
          type: 'list-item',
          text: 'execution plans, and',
        },
        {
          type: 'list-item',
          text: 'other workspace content.',
        },
        {
          type: 'paragraph',
          text: 'Some of this information may be commercially confidential.',
        },
        {
          type: 'paragraph',
          text: 'Users should avoid submitting unnecessary personal, confidential or legally restricted information.',
        },
      ],
    },
    {
      id: 'section-4',
      number: '4',
      title: '4. AI Interaction Data',
      blocks: [
        {
          type: 'paragraph',
          text: 'When you interact with Axiora Pulse’s AI-Mentor features, we may process:',
        },
        {
          type: 'list-item',
          text: 'prompts',
        },
        {
          type: 'list-item',
          text: 'questions',
        },
        {
          type: 'list-item',
          text: 'conversation content',
        },
        {
          type: 'list-item',
          text: 'uploaded materials',
        },
        {
          type: 'list-item',
          text: 'AI responses',
        },
        {
          type: 'list-item',
          text: 'ratings or feedback',
        },
        {
          type: 'list-item',
          text: 'analysis results',
        },
        {
          type: 'list-item',
          text: 'confidence scores',
        },
        {
          type: 'list-item',
          text: 'assumptions',
        },
        {
          type: 'list-item',
          text: 'validation outputs',
        },
        {
          type: 'list-item',
          text: 'recommendations, and',
        },
        {
          type: 'list-item',
          text: 'interaction metadata.',
        },
        {
          type: 'paragraph',
          text: 'This data may be processed to deliver requested AI functionality, maintain context, improve reliability, detect abuse and enhance Axiora Pulse.',
        },
        {
          type: 'paragraph',
          text: 'Where third-party AI infrastructure is used, relevant information may be transmitted to approved technology providers strictly as required to provide the feature and subject to applicable contractual and security safeguards.',
        },
        {
          type: 'paragraph',
          text: 'Axiora will not intentionally use identifiable confidential business content to train publicly available third-party foundation models unless we separately disclose such use and obtain consent where required.',
        },
        {
          type: 'paragraph',
          text: 'We may use appropriately aggregated, anonymised or de-identified information to improve platform quality, analytics, security and product performance where legally permitted.',
        },
      ],
    },
    {
      id: 'section-5',
      number: '5',
      title: '5. Survey, Poll and Feedback Information',
      blocks: [
        {
          type: 'paragraph',
          text: 'Axiora Pulse enables customers to conduct surveys, market research, polls, feedback programmes and validation exercises.',
        },
        {
          type: 'paragraph',
          text: 'Depending on the survey configuration, we may process:',
        },
        {
          type: 'list-item',
          text: 'survey responses',
        },
        {
          type: 'list-item',
          text: 'opinions',
        },
        {
          type: 'list-item',
          text: 'ratings',
        },
        {
          type: 'list-item',
          text: 'open-text responses',
        },
        {
          type: 'list-item',
          text: 'demographic information',
        },
        {
          type: 'list-item',
          text: 'age range',
        },
        {
          type: 'list-item',
          text: 'gender, where relevant and lawfully requested',
        },
        {
          type: 'list-item',
          text: 'city or region',
        },
        {
          type: 'list-item',
          text: 'occupation',
        },
        {
          type: 'list-item',
          text: 'company or industry',
        },
        {
          type: 'list-item',
          text: 'device and technical information',
        },
        {
          type: 'list-item',
          text: 'response time',
        },
        {
          type: 'list-item',
          text: 'completion status',
        },
        {
          type: 'list-item',
          text: 'fraud-prevention indicators, and',
        },
        {
          type: 'list-item',
          text: 'incentive or referral information.',
        },
        {
          type: 'paragraph',
          text: 'Some surveys may be configured to be anonymous.',
        },
        {
          type: 'paragraph',
          text: 'Where a survey is described as anonymous, Axiora and the survey creator should not intentionally display personally identifying respondent information in results unless such identification was separately disclosed and lawfully collected.',
        },
        {
          type: 'paragraph',
          text: 'Anonymous or aggregated reporting does not necessarily mean that no technical data is processed for security, anti-fraud or operational purposes.',
        },
      ],
    },
    {
      id: 'section-6',
      number: '6',
      title: '6. Information Collected Automatically',
      blocks: [
        {
          type: 'paragraph',
          text: 'When you use Axiora Pulse, we may automatically collect:',
        },
        {
          type: 'list-item',
          text: 'IP address',
        },
        {
          type: 'list-item',
          text: 'browser type',
        },
        {
          type: 'list-item',
          text: 'device type',
        },
        {
          type: 'list-item',
          text: 'operating system',
        },
        {
          type: 'list-item',
          text: 'approximate location derived from IP',
        },
        {
          type: 'list-item',
          text: 'login timestamps',
        },
        {
          type: 'list-item',
          text: 'session information',
        },
        {
          type: 'list-item',
          text: 'referring pages',
        },
        {
          type: 'list-item',
          text: 'page interactions',
        },
        {
          type: 'list-item',
          text: 'feature usage',
        },
        {
          type: 'list-item',
          text: 'crash information',
        },
        {
          type: 'list-item',
          text: 'diagnostic information',
        },
        {
          type: 'list-item',
          text: 'cookies or similar identifiers',
        },
        {
          type: 'list-item',
          text: 'authentication events, and',
        },
        {
          type: 'list-item',
          text: 'security logs.',
        },
        {
          type: 'paragraph',
          text: 'We use such information for security, service delivery, performance measurement, analytics and fraud prevention.',
        },
      ],
    },
    {
      id: 'section-7',
      number: '7',
      title: '7. Payment Information',
      blocks: [
        {
          type: 'paragraph',
          text: 'Payments may be processed through authorised third-party payment gateways.',
        },
        {
          type: 'paragraph',
          text: 'Axiora may receive information such as:',
        },
        {
          type: 'list-item',
          text: 'transaction reference',
        },
        {
          type: 'list-item',
          text: 'payment status',
        },
        {
          type: 'list-item',
          text: 'subscription plan',
        },
        {
          type: 'list-item',
          text: 'billing amount',
        },
        {
          type: 'list-item',
          text: 'GST-related information',
        },
        {
          type: 'list-item',
          text: 'billing address, and',
        },
        {
          type: 'list-item',
          text: 'limited payment-method metadata.',
        },
        {
          type: 'paragraph',
          text: 'Axiora should not directly store complete card numbers, CVV or similar payment credentials where payment processing is handled by regulated payment providers.',
        },
        {
          type: 'paragraph',
          text: 'Payment providers process payment data under their own terms and privacy policies.',
        },
      ],
    },
    {
      id: 'section-8',
      number: '8',
      title: '8. How We Use Personal Data',
      blocks: [
        {
          type: 'paragraph',
          text: 'We may process information for purposes including:',
        },
        {
          type: 'list-item',
          text: 'creating and managing accounts',
        },
        {
          type: 'list-item',
          text: 'authenticating users',
        },
        {
          type: 'list-item',
          text: 'providing Axiora Pulse services',
        },
        {
          type: 'list-item',
          text: 'operating workspaces',
        },
        {
          type: 'list-item',
          text: 'generating AI-assisted analysis and recommendations',
        },
        {
          type: 'list-item',
          text: 'providing idea-validation functionality',
        },
        {
          type: 'list-item',
          text: 'generating surveys and questionnaires',
        },
        {
          type: 'list-item',
          text: 'analysing survey responses',
        },
        {
          type: 'list-item',
          text: 'producing dashboards and reports',
        },
        {
          type: 'list-item',
          text: 'providing business, market, financial and GTM decision support',
        },
        {
          type: 'list-item',
          text: 'maintaining strategic context and workspace continuity',
        },
        {
          type: 'list-item',
          text: 'generating user-requested reports',
        },
        {
          type: 'list-item',
          text: 'processing subscriptions and payments',
        },
        {
          type: 'list-item',
          text: 'delivering customer support',
        },
        {
          type: 'list-item',
          text: 'communicating service updates',
        },
        {
          type: 'list-item',
          text: 'sending transactional notifications',
        },
        {
          type: 'list-item',
          text: 'preventing fraud and misuse',
        },
        {
          type: 'list-item',
          text: 'maintaining platform security',
        },
        {
          type: 'list-item',
          text: 'enforcing our Terms',
        },
        {
          type: 'list-item',
          text: 'auditing system activity',
        },
        {
          type: 'list-item',
          text: 'complying with legal obligations',
        },
        {
          type: 'list-item',
          text: 'resolving disputes',
        },
        {
          type: 'list-item',
          text: 'improving user experience',
        },
        {
          type: 'list-item',
          text: 'improving AI quality and product performance using permitted data',
        },
        {
          type: 'list-item',
          text: 'developing new features',
        },
        {
          type: 'list-item',
          text: 'conducting internal analytics, and',
        },
        {
          type: 'list-item',
          text: 'protecting Axiora, our users and third parties.',
        },
        {
          type: 'paragraph',
          text: 'We will not intentionally process personal data for an unrelated purpose without appropriate legal basis, notice or consent where required.',
        },
      ],
    },
    {
      id: 'section-9',
      number: '9',
      title: '9. Consent',
      blocks: [
        {
          type: 'paragraph',
          text: 'Where our processing relies on consent, we seek consent that is specific, informed and capable of being withdrawn in accordance with applicable law.',
        },
        {
          type: 'paragraph',
          text: 'Withdrawal of consent will not ordinarily affect processing already lawfully completed before withdrawal.',
        },
        {
          type: 'paragraph',
          text: 'Certain information may remain necessary to:',
        },
        {
          type: 'list-item',
          text: 'fulfil contractual obligations',
        },
        {
          type: 'list-item',
          text: 'maintain statutory records',
        },
        {
          type: 'list-item',
          text: 'prevent fraud',
        },
        {
          type: 'list-item',
          text: 'establish or defend legal claims',
        },
        {
          type: 'list-item',
          text: 'comply with law, or',
        },
        {
          type: 'list-item',
          text: 'maintain security and audit records.',
        },
      ],
    },
    {
      id: 'section-10',
      number: '10',
      title: '10. Business Customer and Survey Creator Responsibilities',
      blocks: [
        {
          type: 'paragraph',
          text: 'If you use Axiora Pulse to collect personal data from customers, employees, students, survey respondents or other individuals, you are responsible for:',
        },
        {
          type: 'list-item',
          text: 'having a lawful basis to collect the information',
        },
        {
          type: 'list-item',
          text: 'giving respondents appropriate privacy notice',
        },
        {
          type: 'list-item',
          text: 'obtaining consent where required',
        },
        {
          type: 'list-item',
          text: 'collecting only necessary information',
        },
        {
          type: 'list-item',
          text: 'not misleading respondents',
        },
        {
          type: 'list-item',
          text: 'not collecting prohibited or excessive sensitive information',
        },
        {
          type: 'list-item',
          text: 'honouring anonymity promises',
        },
        {
          type: 'list-item',
          text: 'configuring access appropriately',
        },
        {
          type: 'list-item',
          text: 'protecting exported information',
        },
        {
          type: 'list-item',
          text: 'responding to applicable data-rights requests, and',
        },
        {
          type: 'list-item',
          text: 'complying with sector-specific laws applicable to your organisation.',
        },
        {
          type: 'paragraph',
          text: 'Axiora may suspend surveys or accounts that appear unlawful, deceptive, abusive or privacy-invasive.',
        },
      ],
    },
    {
      id: 'section-11',
      number: '11',
      title: '11. Children and Minors',
      blocks: [
        {
          type: 'paragraph',
          text: 'Axiora Pulse’s general account services are intended for persons capable of entering into a legally valid agreement.',
        },
        {
          type: 'paragraph',
          text: 'Users must not knowingly use Axiora Pulse to collect personal data from children in violation of applicable law.',
        },
        {
          type: 'paragraph',
          text: 'Where collection of children’s personal data requires verifiable parental or guardian consent, the survey creator or relevant Data Fiduciary must obtain such consent before collection unless another lawful exemption applies.',
        },
        {
          type: 'paragraph',
          text: 'Axiora may restrict, suspend or remove any survey or processing activity involving children where appropriate safeguards cannot be demonstrated.',
        },
      ],
    },
    {
      id: 'section-12',
      number: '12',
      title: '12. Cookies and Similar Technologies',
      blocks: [
        {
          type: 'paragraph',
          text: 'Axiora Pulse may use cookies, pixels, local storage and similar technologies for:',
        },
        {
          type: 'list-item',
          text: 'authentication',
        },
        {
          type: 'list-item',
          text: 'account security',
        },
        {
          type: 'list-item',
          text: 'session management',
        },
        {
          type: 'list-item',
          text: 'preferences',
        },
        {
          type: 'list-item',
          text: 'analytics',
        },
        {
          type: 'list-item',
          text: 'performance monitoring',
        },
        {
          type: 'list-item',
          text: 'fraud prevention',
        },
        {
          type: 'list-item',
          text: 'marketing attribution, and',
        },
        {
          type: 'list-item',
          text: 'functionality.',
        },
        {
          type: 'paragraph',
          text: 'Where legally required, non-essential cookies will be subject to consent choices.',
        },
        {
          type: 'paragraph',
          text: 'Users may control certain cookies through browser or platform settings, although disabling necessary cookies may prevent parts of the service from functioning.',
        },
      ],
    },
    {
      id: 'section-13',
      number: '13',
      title: '13. How We Share Information',
      blocks: [
        {
          type: 'paragraph',
          text: 'We may disclose information only where reasonably necessary to operate, secure or support Axiora Pulse.',
        },
        {
          type: 'paragraph',
          text: 'Recipients may include:',
        },
        {
          type: 'subheading',
          text: '13.1 Technology Service Providers',
        },
        {
          type: 'paragraph',
          text: 'Including providers of:',
        },
        {
          type: 'list-item',
          text: 'cloud infrastructure',
        },
        {
          type: 'list-item',
          text: 'storage',
        },
        {
          type: 'list-item',
          text: 'AI/ML services',
        },
        {
          type: 'list-item',
          text: 'authentication',
        },
        {
          type: 'list-item',
          text: 'email',
        },
        {
          type: 'list-item',
          text: 'SMS',
        },
        {
          type: 'list-item',
          text: 'WhatsApp communication',
        },
        {
          type: 'list-item',
          text: 'analytics',
        },
        {
          type: 'list-item',
          text: 'CRM',
        },
        {
          type: 'list-item',
          text: 'cybersecurity',
        },
        {
          type: 'list-item',
          text: 'monitoring',
        },
        {
          type: 'list-item',
          text: 'customer support',
        },
        {
          type: 'list-item',
          text: 'document processing, and',
        },
        {
          type: 'list-item',
          text: 'payment services.',
        },
        {
          type: 'subheading',
          text: '13.2 Enterprise Customers',
        },
        {
          type: 'paragraph',
          text: 'Where a user accesses Axiora Pulse through an organisation, authorised administrators may have access to information within that organisation’s workspace according to configured permissions.',
        },
        {
          type: 'subheading',
          text: '13.3 Professional Advisers',
        },
        {
          type: 'paragraph',
          text: 'We may share information with authorised advocates, auditors, accountants, consultants or insurers where reasonably necessary.',
        },
        {
          type: 'subheading',
          text: '13.4 Authorities',
        },
        {
          type: 'paragraph',
          text: 'We may disclose information where required by:',
        },
        {
          type: 'list-item',
          text: 'applicable law',
        },
        {
          type: 'list-item',
          text: 'lawful court order',
        },
        {
          type: 'list-item',
          text: 'statutory authority',
        },
        {
          type: 'list-item',
          text: 'regulatory requirement',
        },
        {
          type: 'list-item',
          text: 'investigation, or',
        },
        {
          type: 'list-item',
          text: 'valid government request.',
        },
        {
          type: 'subheading',
          text: '13.5 Corporate Transactions',
        },
        {
          type: 'paragraph',
          text: 'Information may be transferred as part of a lawful merger, acquisition, financing, restructuring, investment, sale of assets or similar corporate transaction, subject to appropriate safeguards.',
        },
        {
          type: 'paragraph',
          text: 'We do not sell personal data as a standalone commercial product.',
        },
      ],
    },
    {
      id: 'section-14',
      number: '14',
      title: '14. Survey Results and Reports',
      blocks: [
        {
          type: 'paragraph',
          text: 'Survey creators may receive:',
        },
        {
          type: 'list-item',
          text: 'response data',
        },
        {
          type: 'list-item',
          text: 'aggregate statistics',
        },
        {
          type: 'list-item',
          text: 'demographic analysis',
        },
        {
          type: 'list-item',
          text: 'AI-generated insights',
        },
        {
          type: 'list-item',
          text: 'validation scores',
        },
        {
          type: 'list-item',
          text: 'trend information',
        },
        {
          type: 'list-item',
          text: 'respondent-quality indicators, and',
        },
        {
          type: 'list-item',
          text: 'reports.',
        },
        {
          type: 'paragraph',
          text: 'Survey creators are responsible for how exported information is subsequently used or shared outside Axiora Pulse.',
        },
        {
          type: 'paragraph',
          text: 'Axiora may use aggregated or de-identified survey information for benchmarking, platform analytics and product improvement where legally permitted and where individuals are not reasonably identifiable.',
        },
      ],
    },
    {
      id: 'section-15',
      number: '15',
      title: '15. Confidential Business Information',
      blocks: [
        {
          type: 'paragraph',
          text: 'We recognise that users may submit commercially sensitive business ideas and documents.',
        },
        {
          type: 'paragraph',
          text: 'Axiora applies reasonable technical and organisational safeguards to protect workspace data.',
        },
        {
          type: 'paragraph',
          text: 'However:',
        },
        {
          type: 'list-item',
          text: 'Axiora Pulse is not a legal escrow service',
        },
        {
          type: 'list-item',
          text: 'use of the platform does not automatically create an attorney-client, fiduciary or professional-confidentiality relationship',
        },
        {
          type: 'list-item',
          text: 'users remain responsible for deciding what confidential information to upload, and',
        },
        {
          type: 'list-item',
          text: 'no internet or cloud platform can guarantee absolute security.',
        },
        {
          type: 'paragraph',
          text: 'Users requiring contractual confidentiality beyond this Privacy Policy should enter into an appropriate written NDA or enterprise agreement with Axiora.',
        },
      ],
    },
    {
      id: 'section-16',
      number: '16',
      title: '16. Security Measures',
      blocks: [
        {
          type: 'paragraph',
          text: 'Depending on the relevant product module and deployment, Axiora may use safeguards including:',
        },
        {
          type: 'list-item',
          text: 'encryption in transit',
        },
        {
          type: 'list-item',
          text: 'encryption at rest',
        },
        {
          type: 'list-item',
          text: 'access controls',
        },
        {
          type: 'list-item',
          text: 'role-based access control',
        },
        {
          type: 'list-item',
          text: 'multi-factor authentication',
        },
        {
          type: 'list-item',
          text: 'secure credential handling',
        },
        {
          type: 'list-item',
          text: 'session monitoring',
        },
        {
          type: 'list-item',
          text: 'activity logging',
        },
        {
          type: 'list-item',
          text: 'audit trails',
        },
        {
          type: 'list-item',
          text: 'vulnerability management',
        },
        {
          type: 'list-item',
          text: 'secure backups',
        },
        {
          type: 'list-item',
          text: 'intrusion or anomaly monitoring',
        },
        {
          type: 'list-item',
          text: 'incident-response procedures',
        },
        {
          type: 'list-item',
          text: 'data-segregation controls',
        },
        {
          type: 'list-item',
          text: 'access revocation',
        },
        {
          type: 'list-item',
          text: 'secure software-development practices, and',
        },
        {
          type: 'list-item',
          text: 'vendor risk management.',
        },
        {
          type: 'paragraph',
          text: 'Security measures are continuously reviewed based on risk, technical feasibility and applicable law.',
        },
        {
          type: 'paragraph',
          text: 'No system can be guaranteed to be completely secure, and Axiora does not warrant absolute protection against every cyberattack or unauthorised action.',
        },
      ],
    },
    {
      id: 'section-17',
      number: '17',
      title: '17. Data Retention',
      blocks: [
        {
          type: 'paragraph',
          text: 'We retain personal data only for as long as reasonably required for:',
        },
        {
          type: 'list-item',
          text: 'providing the service',
        },
        {
          type: 'list-item',
          text: 'maintaining an active account',
        },
        {
          type: 'list-item',
          text: 'fulfilling user-requested reports',
        },
        {
          type: 'list-item',
          text: 'maintaining platform continuity',
        },
        {
          type: 'list-item',
          text: 'meeting contractual obligations',
        },
        {
          type: 'list-item',
          text: 'fraud prevention',
        },
        {
          type: 'list-item',
          text: 'legal compliance',
        },
        {
          type: 'list-item',
          text: 'tax and accounting requirements',
        },
        {
          type: 'list-item',
          text: 'resolving disputes',
        },
        {
          type: 'list-item',
          text: 'security investigations, and',
        },
        {
          type: 'list-item',
          text: 'enforcing agreements.',
        },
        {
          type: 'paragraph',
          text: 'Different categories of information may have different retention periods.',
        },
        {
          type: 'paragraph',
          text: 'When information is no longer required, we may delete, anonymise or securely archive it, subject to applicable law, backup cycles and legitimate legal requirements.',
        },
        {
          type: 'paragraph',
          text: 'Users may request account deletion through available platform controls or by contacting Axiora.',
        },
        {
          type: 'paragraph',
          text: 'Deletion from active systems may not result in immediate deletion from encrypted backups, audit trails or records legally required to be retained.',
        },
      ],
    },
    {
      id: 'section-18',
      number: '18',
      title: '18. Data Principal/User Rights',
      blocks: [
        {
          type: 'paragraph',
          text: 'Subject to applicable law and legal exceptions, individuals may be entitled to request:',
        },
        {
          type: 'list-item',
          text: 'information regarding their personal data',
        },
        {
          type: 'list-item',
          text: 'correction of inaccurate information',
        },
        {
          type: 'list-item',
          text: 'completion or updating of information',
        },
        {
          type: 'list-item',
          text: 'erasure of personal data',
        },
        {
          type: 'list-item',
          text: 'withdrawal of consent',
        },
        {
          type: 'list-item',
          text: 'grievance redressal, and',
        },
        {
          type: 'list-item',
          text: 'nomination of another individual to exercise applicable rights in circumstances permitted by law.',
        },
        {
          type: 'paragraph',
          text: 'Certain rights may depend on the relevant provision of law being in force and on Axiora’s role in relation to the data.',
        },
        {
          type: 'paragraph',
          text: 'If Axiora is processing information solely on behalf of a business customer, we may redirect the request to that customer.',
        },
        {
          type: 'paragraph',
          text: 'Requests may require reasonable identity verification to protect the individual concerned.',
        },
      ],
    },
    {
      id: 'section-19',
      number: '19',
      title: '19. Marketing Communications',
      blocks: [
        {
          type: 'paragraph',
          text: 'We may send marketing messages where lawfully permitted.',
        },
        {
          type: 'paragraph',
          text: 'Users can unsubscribe using:',
        },
        {
          type: 'list-item',
          text: 'the unsubscribe link',
        },
        {
          type: 'list-item',
          text: 'relevant account settings, or',
        },
        {
          type: 'list-item',
          text: 'the communication method provided in the message.',
        },
        {
          type: 'paragraph',
          text: 'Service, security, billing and account notices may still be sent where necessary.',
        },
      ],
    },
    {
      id: 'section-20',
      number: '20',
      title: '20. International Processing and Data Transfers',
      blocks: [
        {
          type: 'paragraph',
          text: 'Axiora Pulse may use technology and service providers operating in India or other countries.',
        },
        {
          type: 'paragraph',
          text: 'Where data is processed outside India, Axiora will seek to implement safeguards required by applicable law and will comply with government restrictions on cross-border transfers where applicable.',
        },
        {
          type: 'paragraph',
          text: 'Users operating in other jurisdictions may have additional statutory rights under their local privacy laws.',
        },
      ],
    },
    {
      id: 'section-21',
      number: '21',
      title: '21. Third-Party Links and Integrations',
      blocks: [
        {
          type: 'paragraph',
          text: 'Axiora Pulse may integrate with or link to third-party products, social-media platforms, payment providers, messaging services, AI providers or websites.',
        },
        {
          type: 'paragraph',
          text: 'Axiora is not responsible for the independent privacy practices of third parties.',
        },
        {
          type: 'paragraph',
          text: 'Users should review third-party privacy policies before using external services.',
        },
      ],
    },
    {
      id: 'section-22',
      number: '22',
      title: '22. AI-Specific Transparency',
      blocks: [
        {
          type: 'paragraph',
          text: 'Axiora Pulse uses artificial intelligence to support analysis, recommendations and decision-making.',
        },
        {
          type: 'paragraph',
          text: 'AI outputs may:',
        },
        {
          type: 'list-item',
          text: 'contain errors',
        },
        {
          type: 'list-item',
          text: 'be incomplete',
        },
        {
          type: 'list-item',
          text: 'depend on inaccurate user information',
        },
        {
          type: 'list-item',
          text: 'contain assumptions',
        },
        {
          type: 'list-item',
          text: 'become outdated',
        },
        {
          type: 'list-item',
          text: 'vary between runs, or',
        },
        {
          type: 'list-item',
          text: 'require professional verification.',
        },
        {
          type: 'paragraph',
          text: 'AI-generated information is not automatically a verified fact.',
        },
        {
          type: 'paragraph',
          text: 'Users remain responsible for reviewing important outputs before making significant legal, financial, investment, hiring, compliance, health, safety or commercial decisions.',
        },
      ],
    },
    {
      id: 'section-23',
      number: '23',
      title: '23. Data Breach and Security Incidents',
      blocks: [
        {
          type: 'paragraph',
          text: 'If Axiora becomes aware of a personal-data breach requiring notification under applicable law, Axiora will take reasonable steps to:',
        },
        {
          type: 'list-item',
          text: 'investigate',
        },
        {
          type: 'list-item',
          text: 'contain the incident',
        },
        {
          type: 'list-item',
          text: 'mitigate foreseeable harm',
        },
        {
          type: 'list-item',
          text: 'preserve relevant evidence',
        },
        {
          type: 'list-item',
          text: 'notify affected stakeholders where required, and',
        },
        {
          type: 'list-item',
          text: 'make required regulatory notifications.',
        },
        {
          type: 'paragraph',
          text: 'The timing and contents of any notification will depend on applicable law and the circumstances of the incident.',
        },
      ],
    },
    {
      id: 'section-24',
      number: '24',
      title: '24. Grievance and Privacy Contact',
      blocks: [
        {
          type: 'paragraph',
          text: 'For questions, correction requests, privacy complaints or other data-related concerns, contact:\n\nAxiora Global Solutions Pvt. Ltd.\nEmail: support@axioraglobalsolutions.com\nRegistered Office: Hyderabad, Telangana, India\nWebsite: www.axiorapulse.com',
        },
        {
          type: 'paragraph',
          text: 'Axiora may request information necessary to verify the request before taking action.',
        },
      ],
    },
    {
      id: 'section-25',
      number: '25',
      title: '25. Changes to This Privacy Policy',
      blocks: [
        {
          type: 'paragraph',
          text: 'We may revise this Privacy Policy to reflect:',
        },
        {
          type: 'list-item',
          text: 'changes in law',
        },
        {
          type: 'list-item',
          text: 'new product functionality',
        },
        {
          type: 'list-item',
          text: 'security requirements',
        },
        {
          type: 'list-item',
          text: 'business changes',
        },
        {
          type: 'list-item',
          text: 'regulatory guidance, or',
        },
        {
          type: 'list-item',
          text: 'operational improvements.',
        },
        {
          type: 'paragraph',
          text: 'The revised policy will be posted with an updated “Last Updated” date.',
        },
        {
          type: 'paragraph',
          text: 'Where required by law, material changes will be separately notified or new consent will be obtained.',
        },
      ],
    },
    {
      id: 'section-26',
      number: '26',
      title: '26. Governing Framework',
      blocks: [
        {
          type: 'paragraph',
          text: 'This Privacy Policy is intended to operate subject to applicable Indian law, including the Digital Personal Data Protection Act, 2023, relevant rules made thereunder, the Information Technology Act, 2000 and other applicable legal requirements, as amended or brought into force from time to time.',
        },
        {
          type: 'paragraph',
          text: 'Nothing in this Privacy Policy limits any mandatory statutory rights available to an individual under applicable law.',
        },
      ],
    },
  ],
};
