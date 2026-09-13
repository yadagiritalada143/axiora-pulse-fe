import { useEffect } from 'react';

import { LegalPageLayout } from '@features/legal/components/LegalPageLayout';
import { TERMS_OF_USE_DATA } from '@features/legal/data/termsOfUseData';

export default function TermsOfUsePage() {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'Terms of Use & Legal Terms | Axiora Pulse';
  }, []);

  return <LegalPageLayout doc={TERMS_OF_USE_DATA} activeDocType="terms" />;
}
