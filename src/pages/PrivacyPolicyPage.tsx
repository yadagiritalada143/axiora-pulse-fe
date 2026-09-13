import { useEffect } from 'react';

import { LegalPageLayout } from '@features/legal/components/LegalPageLayout';
import { PRIVACY_POLICY_DATA } from '@features/legal/data/privacyPolicyData';

export default function PrivacyPolicyPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'Privacy Policy | Axiora Pulse';
  }, []);

  return <LegalPageLayout doc={PRIVACY_POLICY_DATA} activeDocType="privacy" />;
}
