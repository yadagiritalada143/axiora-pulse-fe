import { useEffect, useState } from 'react';

import { CartoonBotLoader } from '@components/common/CartoonBotLoader';

interface PreloaderProps {
  onComplete?: () => void;
}

export function Preloader({ onComplete }: PreloaderProps) {
  const [count, setCount] = useState(0);
  const [hidden, setHidden] = useState(false);
  const [removed, setRemoved] = useState(() => {
    return Boolean(typeof window !== 'undefined' && sessionStorage.getItem('preloaderShown'));
  });

  useEffect(() => {
    if (removed) {
      onComplete?.();
      return;
    }

    const interval = setInterval(() => {
      setCount((prev) => {
        const next = prev + 2;
        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setHidden(true);
            setTimeout(() => {
              setRemoved(true);
              sessionStorage.setItem('preloaderShown', 'true');
              onComplete?.();
            }, 600);
          }, 300);
          return 100;
        }
        return next;
      });
    }, 25);

    return () => clearInterval(interval);
  }, [removed, onComplete]);

  if (removed) return null;

  return (
    <div
      id="site-preloader"
      className={`site-preloader ${hidden ? 'hidden' : ''}`}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#05070F',
        transition: 'opacity 0.6s ease, visibility 0.6s ease',
        opacity: hidden ? 0 : 1,
        visibility: hidden ? 'hidden' : 'visible',
      }}
    >
      <div className="flex flex-col items-center justify-center p-6 text-center">
        <CartoonBotLoader size="lg" showStatusMessages={true} />

        <div className="mt-5 flex w-56 flex-col items-center gap-2">
          <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-zinc-900 p-0.5 ring-1 ring-white/15">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#FF6B35] via-[#F04F1E] to-[#FF4500] shadow-[0_0_12px_#F04F1E] transition-all duration-150 ease-out"
              style={{ width: `${count}%` }}
            />
          </div>

          <div className="preloader-counter flex items-baseline gap-0.5 font-mono text-xl font-bold tracking-wider text-white">
            <span id="preloader-number">{count}</span>
            <span className="preloader-percent text-[#f04f1e]">%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
