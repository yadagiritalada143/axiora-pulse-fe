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
        const next = prev + 1;
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
    }, 20);

    return () => clearInterval(interval);
  }, [removed, onComplete]);

  if (removed) return null;

  return (
    <div id="site-preloader" className={`site-preloader ${hidden ? 'hidden' : ''}`}>
      <div className="preloader-counter">
        <span id="preloader-number">{count}</span>
        <span className="preloader-percent">%</span>
      </div>
    </div>
  );
}
