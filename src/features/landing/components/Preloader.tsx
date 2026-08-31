import { useEffect, useState } from 'react';

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
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#000000',
        transition: 'opacity 0.6s ease, visibility 0.6s ease',
        opacity: hidden ? 0 : 1,
        visibility: hidden ? 'hidden' : 'visible',
      }}
    >
      <div
        className="preloader-counter"
        style={{ color: '#ffffff', fontSize: '3rem', fontWeight: 700 }}
      >
        <span id="preloader-number">{count}</span>
        <span className="preloader-percent" style={{ color: '#f04f1e' }}>
          %
        </span>
      </div>
    </div>
  );
}
