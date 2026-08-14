import { cn } from '@lib/utils';

const LOGO_SIZE_CLASSES = {
  sm: 'text-sm',
  md: 'text-lg',
  lg: 'text-2xl',
} as const;

export type LogoSize = keyof typeof LOGO_SIZE_CLASSES;
export type LogoTone = 'auto' | 'dark';

interface LogoProps {
  className?: string;
  size?: LogoSize;
  animated?: boolean;
  tone?: LogoTone;
}

export function Logo({ className, size = 'md', animated = true, tone = 'auto' }: LogoProps) {
  const isDark = tone === 'dark';

  return (
    <span
      className={cn(
        'axiora-logo inline-flex items-start leading-none select-none',
        LOGO_SIZE_CLASSES[size],
        className,
      )}
    >
      <span className="sr-only">Axiora Pulse</span>

      <span
        aria-hidden="true"
        className={cn(
          'font-display relative top-[-0.05em] mr-[0.42em] text-[0.4em] font-bold tracking-[0.24em] uppercase',
          isDark ? 'text-[#FDF5E8]/40' : 'text-muted-foreground',
        )}
      >
        Axiora
      </span>

      <span
        aria-hidden="true"
        className={cn(
          'text-[1em] font-black tracking-[-0.02em]',
          isDark ? 'text-[#FDF5E8]' : 'text-foreground',
        )}
        style={{ fontFamily: "'Playfair Display', Georgia, 'Times New Roman', serif" }}
      >
        Pulse
      </span>

      <span className="relative mt-[0.2em] ml-[0.28em] inline-flex size-[0.95em] shrink-0 items-center justify-center">
        <span className="relative inline-block size-[0.39em]">
          {animated ? (
            <>
              <span
                className="axiora-logo-ring absolute inset-0 rounded-full"
                style={{ animationDelay: '0s' }}
              />
              <span
                className="axiora-logo-ring absolute inset-0 rounded-full"
                style={{ animationDelay: '0.9s' }}
              />
              <span
                className="axiora-logo-ring absolute inset-0 rounded-full"
                style={{ animationDelay: '1.8s' }}
              />
            </>
          ) : null}
          <span
            aria-hidden="true"
            className={cn(
              'axiora-logo-dot absolute inset-0 rounded-full',
              animated && 'axiora-logo-dot--animated',
            )}
          />
        </span>
      </span>

      <style>{LOGO_STYLE}</style>
    </span>
  );
}

const LOGO_STYLE = `
  .axiora-logo-dot {
    background-color: #FF4500;
    box-shadow: 0 0 0 1px rgba(255, 69, 0, 0.35), 0 0 10px 2px rgba(255, 69, 0, 0.65);
  }

  .axiora-logo-ring {
    border: 1.5px solid rgba(255, 69, 0, 0.85);
    opacity: 0;
  }

  @media (prefers-reduced-motion: no-preference) {
    .axiora-logo-dot--animated {
      animation: axiora-logo-blink 1.8s ease-in-out infinite;
    }

    .axiora-logo-ring {
      animation: axiora-logo-ring-wave 2.7s cubic-bezier(0.25, 0.6, 0.35, 1) infinite;
    }
  }

@keyframes axiora-logo-ring-wave {
  0% {
    transform: scale(1);
    opacity: 0.6;
  }

  65% {
    opacity: 0.12;
  }

  100% {
    transform: scale(3.4);
    opacity: 0;
  }
}

  @keyframes axiora-logo-blink {
    0%,
    100% {
      opacity: 1;
      box-shadow: 0 0 0 1px rgba(255, 69, 0, 0.35), 0 0 10px 2px rgba(255, 69, 0, 0.65);
    }
    50% {
      opacity: 0.5;
      box-shadow: 0 0 0 1px rgba(255, 69, 0, 0.18), 0 0 4px 1px rgba(255, 69, 0, 0.3);
    }
  }
`;
