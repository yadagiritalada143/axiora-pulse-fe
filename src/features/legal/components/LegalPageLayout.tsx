import { Search, FileText, Shield, Mail, X } from 'lucide-react';
import { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';

import { ROUTES } from '@constants/routes';
import { LandingFooter } from '@features/landing/components/LandingFooter';
import { LandingNavbar } from '@features/landing/components/LandingNavbar';
import { ScrollToTop } from '@features/landing/components/ScrollToTop';
import { cn } from '@lib/utils';

import type { LegalDocument } from '../data/privacyPolicyData';
import '@features/landing/landing.css';

interface LegalPageLayoutProps {
  doc: LegalDocument;
  activeDocType: 'privacy' | 'terms';
}

export function LegalPageLayout({ doc, activeDocType }: LegalPageLayoutProps) {
  const [activeSectionId, setActiveSectionId] = useState<string>(doc.sections[0]?.id ?? '');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const tocListRef = useRef<HTMLUListElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (searchQuery.trim()) return;
    const container = scrollContainerRef.current;
    if (!container) return;
    if (typeof IntersectionObserver === 'undefined') return;

    const handleIntersect: IntersectionObserverCallback = (entries) => {
      const visible = entries.filter((e) => e.isIntersecting);
      if (visible.length > 0) {
        visible.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        const first = visible[0];
        if (first) {
          setActiveSectionId(first.target.id);
        }
      }
    };

    observerRef.current = new IntersectionObserver(handleIntersect, {
      root: container,
      rootMargin: '0px 0px -60% 0px',
      threshold: 0,
    });

    const sections = container.querySelectorAll('.legal-section');
    sections.forEach((sec) => observerRef.current?.observe(sec));

    return () => {
      observerRef.current?.disconnect();
    };
  }, [doc, searchQuery]);

  useEffect(() => {
    if (!activeSectionId || !tocListRef.current) return;
    const activeBtn = tocListRef.current.querySelector<HTMLElement>('[data-active="true"]');
    if (activeBtn) {
      activeBtn.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [activeSectionId]);

  const handleContainerScroll = () => {
    if (searchQuery.trim()) return;
    const container = scrollContainerRef.current;
    if (!container) return;

    const sections = container.querySelectorAll<HTMLElement>('.legal-section');
    const containerTop = container.getBoundingClientRect().top;

    for (const sec of sections) {
      const rect = sec.getBoundingClientRect();
      if (rect.top - containerTop <= 100 && rect.bottom - containerTop > 40) {
        setActiveSectionId(sec.id);
        break;
      }
    }
  };

  const scrollToSection = (id: string) => {
    const container = scrollContainerRef.current;
    const targetEl = document.getElementById(id);
    if (container && targetEl) {
      const containerRect = container.getBoundingClientRect();
      const targetRect = targetEl.getBoundingClientRect();
      const scrollOffset = targetRect.top - containerRect.top + container.scrollTop - 16;
      container.scrollTo({
        top: scrollOffset,
        behavior: 'smooth',
      });
      setActiveSectionId(id);
    }
  };

  const filteredSections = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return doc.sections;

    return doc.sections.filter((sec) => {
      if (sec.title.toLowerCase().includes(q)) return true;
      return sec.blocks.some((b) => b.text.toLowerCase().includes(q));
    });
  }, [doc.sections, searchQuery]);

  return (
    <div
      className="landing-page-root relative min-h-screen overflow-x-hidden bg-black font-sans text-slate-100"
      style={{ minHeight: '100vh', backgroundColor: '#000000', color: '#ffffff' }}
    >
      <div className="pointer-events-none absolute top-0 left-1/2 z-0 h-[500px] w-[1000px] -translate-x-1/2 bg-[radial-gradient(circle_at_50%_0%,rgba(255,69,0,0.08)_0%,rgba(234,88,12,0.03)_40%,transparent_70%)]" />

      <LandingNavbar />

      <section className="relative z-10 mx-auto max-w-[1320px] px-4 pt-8 pb-6 sm:px-6 sm:pt-10 lg:px-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#ea580c]/25 bg-[#ea580c]/10 px-3.5 py-1.5 text-xs font-bold tracking-wider text-[#ff5722] uppercase">
            {activeDocType === 'privacy' ? (
              <>
                <Shield className="size-3.5" /> Legal & Privacy
              </>
            ) : (
              <>
                <FileText className="size-3.5" /> Legal Terms
              </>
            )}
          </span>

          <div className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1">
            <Link
              to={ROUTES.PRIVACY_POLICY}
              className={cn(
                'rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-200 sm:text-sm',
                activeDocType === 'privacy'
                  ? 'bg-[#ea580c] text-white shadow-[0_2px_10px_rgba(234,88,12,0.35)]'
                  : 'text-slate-400 hover:text-white',
              )}
            >
              Privacy Policy
            </Link>
            <Link
              to={ROUTES.TERMS_OF_USE}
              className={cn(
                'rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-200 sm:text-sm',
                activeDocType === 'terms'
                  ? 'bg-[#ea580c] text-white shadow-[0_2px_10px_rgba(234,88,12,0.35)]'
                  : 'text-slate-400 hover:text-white',
              )}
            >
              Terms & Conditions
            </Link>
          </div>
        </div>

        <h1 className="mb-5 text-2xl font-extrabold tracking-tight text-white sm:text-3xl lg:text-4xl">
          {doc.title}
        </h1>

        <div className="relative w-full">
          <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            className="h-13 w-full rounded-xl border border-white/15 bg-slate-900/80 pr-11 pl-12 text-sm text-white shadow-lg transition-all outline-none placeholder:text-slate-400 focus:border-[#ea580c] focus:bg-slate-900 focus:ring-2 focus:ring-[#ea580c]/20 sm:text-base"
            placeholder="Search keywords in this document (e.g. rights, payments, personal data, dispute)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute top-1/2 right-3.5 -translate-y-1/2 rounded-md p-1 text-slate-400 transition-colors hover:text-white"
              aria-label="Clear search"
            >
              <X className="size-4.5" />
            </button>
          ) : null}
        </div>
      </section>

      <div className="sticky top-0 z-20 mx-auto max-w-[1320px] px-4 pt-1 pb-3 backdrop-blur-md sm:px-6 lg:hidden">
        <select
          className="w-full rounded-xl border border-white/15 bg-slate-900 px-3.5 py-2.5 text-sm font-medium text-white outline-none focus:border-[#ea580c]"
          value={activeSectionId}
          onChange={(e) => scrollToSection(e.target.value)}
        >
          {doc.sections.map((sec) => (
            <option key={sec.id} value={sec.id}>
              {sec.title}
            </option>
          ))}
        </select>
      </div>

      <main className="relative z-10 mx-auto grid max-w-[1320px] grid-cols-1 items-stretch gap-6 px-4 pb-16 sm:px-6 lg:grid-cols-[320px_1fr] lg:gap-8 lg:px-8">
        <aside className="hidden h-[860px] max-h-[85vh] min-h-[620px] flex-col rounded-2xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-xl lg:flex lg:h-[900px]">
          <div className="mb-3 flex items-center justify-between border-b border-white/10 px-2 pb-3">
            <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">
              Table of Contents
            </span>
            <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-semibold text-slate-300">
              {doc.sections.length} Sections
            </span>
          </div>

          <ul
            ref={tocListRef}
            className="flex-1 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.2)_transparent] space-y-1 overflow-y-auto pr-1.5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/20 hover:[&::-webkit-scrollbar-thumb]:bg-[#ea580c]"
          >
            {doc.sections.map((sec) => {
              const isActive = activeSectionId === sec.id;
              return (
                <li key={sec.id}>
                  <button
                    type="button"
                    data-active={isActive}
                    onClick={() => scrollToSection(sec.id)}
                    className={cn(
                      'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs transition-all duration-150',
                      isActive
                        ? 'border border-[#ea580c]/30 bg-[#ea580c]/15 font-semibold text-white shadow-sm'
                        : 'border border-transparent font-medium text-slate-400 hover:bg-white/5 hover:text-slate-200',
                    )}
                  >
                    <span
                      className={cn(
                        'w-5 shrink-0 text-right text-[11px] font-bold',
                        isActive ? 'text-[#ff6b35]' : 'text-[#ea580c]',
                      )}
                    >
                      {sec.number}.
                    </span>
                    <span className="flex-1 truncate">{sec.title.replace(/^\d+\.\s*/, '')}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        <article
          ref={scrollContainerRef}
          onScroll={handleContainerScroll}
          className="h-[65vh] max-h-[85vh] min-h-[480px] [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.2)_transparent] overflow-x-hidden overflow-y-auto scroll-smooth rounded-2xl border border-white/10 bg-slate-950/80 p-5 shadow-2xl sm:h-[72vh] sm:min-h-[560px] sm:p-8 lg:h-[900px] lg:min-h-[620px] lg:p-10 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/20 hover:[&::-webkit-scrollbar-thumb]:bg-[#ea580c] [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-white/[0.03]"
        >
          {filteredSections.length === 0 ? (
            <div className="py-20 text-center text-slate-400">
              <p className="text-lg font-medium">
                No matching sections found for &ldquo;{searchQuery}&rdquo;
              </p>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="mt-4 cursor-pointer text-sm font-semibold text-[#ea580c] underline hover:text-[#ff6b35]"
              >
                Clear search filter
              </button>
            </div>
          ) : (
            filteredSections.map((sec) => (
              <section
                key={sec.id}
                id={sec.id}
                className="legal-section mb-8 scroll-mt-4 border-b border-white/5 pb-8 last:mb-0 last:border-b-0 last:pb-0"
              >
                <div className="mb-4">
                  <h2 className="text-lg font-bold tracking-tight text-white sm:text-xl lg:text-2xl">
                    {sec.title}
                  </h2>
                </div>

                <div className="space-y-4">
                  {sec.blocks.map((block, bIdx) => {
                    if (block.type === 'subheading') {
                      return (
                        <h3
                          key={bIdx}
                          className="mt-6 mb-3 flex items-center gap-2 text-sm font-bold text-slate-100 before:inline-block before:h-4 before:w-1 before:rounded-xs before:bg-[#ea580c] before:content-[''] sm:text-base"
                        >
                          {block.text}
                        </h3>
                      );
                    }
                    if (block.type === 'list-item') {
                      return (
                        <ul key={bIdx} className="my-2 list-none pl-2">
                          <li className="relative pl-5 text-sm leading-relaxed text-slate-300 before:absolute before:top-2 before:left-1 before:h-1.5 before:w-1.5 before:rounded-full before:bg-[#ea580c] before:shadow-[0_0_6px_rgba(234,88,12,0.6)] before:content-[''] sm:text-[15px]">
                            {block.text}
                          </li>
                        </ul>
                      );
                    }
                    return (
                      <p
                        key={bIdx}
                        className="text-sm leading-relaxed whitespace-pre-line text-slate-300 sm:text-[15px]"
                      >
                        {block.text}
                      </p>
                    );
                  })}
                </div>
              </section>
            ))
          )}

          <div className="mt-10 flex flex-col items-start gap-4 rounded-xl border border-[#ea580c]/20 bg-[#ea580c]/5 p-5 sm:flex-row sm:items-center sm:p-6">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#ea580c]/30 bg-[#ea580c]/15">
              <Mail className="size-5 text-[#ea580c]" />
            </div>
            <div>
              <h4 className="mb-1 text-base font-bold text-white">
                Have Questions About This Document?
              </h4>
              <p className="text-xs text-slate-400 sm:text-sm">
                Contact our privacy and legal compliance team at{' '}
                <a
                  href="mailto:support@axiorapulse.com"
                  className="font-medium text-[#ea580c] underline hover:text-[#ff6b35]"
                >
                  support@axiorapulse.com
                </a>
              </p>
            </div>
          </div>
        </article>
      </main>

      <ScrollToTop />

      <LandingFooter />
    </div>
  );
}
