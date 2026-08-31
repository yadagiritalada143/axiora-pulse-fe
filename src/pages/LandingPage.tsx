import '@features/landing/landing.css';
import { AboutSection } from '@features/landing/components/AboutSection';
import { AIMentorSection } from '@features/landing/components/AIMentorSection';
import { BurstSection } from '@features/landing/components/BurstSection';
import { ContactSection } from '@features/landing/components/ContactSection';
import { CtaBanner } from '@features/landing/components/CtaBanner';
import { FAQSection } from '@features/landing/components/FAQSection';
import { FounderChallengesSection } from '@features/landing/components/FounderChallengesSection';
import { LandingFooter } from '@features/landing/components/LandingFooter';
import { LandingHero } from '@features/landing/components/LandingHero';
import { LandingNavbar } from '@features/landing/components/LandingNavbar';
import { MagicRingsBg } from '@features/landing/components/MagicRingsBg';
import { Preloader } from '@features/landing/components/Preloader';
import { ScrollToTop } from '@features/landing/components/ScrollToTop';
import { StartupJourneySection } from '@features/landing/components/StartupJourneySection';
import { TestimonialsSection } from '@features/landing/components/TestimonialsSection';

export default function LandingPage() {
  return (
    <div
      className="landing-page-root"
      style={{ minHeight: '100vh', backgroundColor: '#000000', color: '#ffffff' }}
    >
      <Preloader />
      <MagicRingsBg />
      <LandingNavbar />
      <LandingHero />
      <FounderChallengesSection />
      <AboutSection />
      <AIMentorSection />
      <StartupJourneySection />
      <FAQSection />
      <TestimonialsSection />
      <ContactSection />
      <CtaBanner />
      <LandingFooter />
      <BurstSection />
      <ScrollToTop />
    </div>
  );
}
