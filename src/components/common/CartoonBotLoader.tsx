import { useState, useEffect } from 'react';

import { cn } from '@lib/utils';

interface CartoonBotLoaderProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  showProgress?: boolean;
  progress?: number;
  showStatusMessages?: boolean;
}

const DEFAULT_MESSAGES = [
  'Waking up AI Validation Agents...',
  'Scanning Market Intelligence...',
  'Crunching Competitor Signals...',
  'Synthesizing Customer Sentiments...',
  'Preparing Your Venture Blueprint...',
];

export function CartoonBotLoader({
  className,
  size = 'md',
  label,
  showProgress = false,
  progress = 0,
  showStatusMessages = true,
}: CartoonBotLoaderProps) {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    if (!showStatusMessages) return;
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % DEFAULT_MESSAGES.length);
    }, 1800);
    return () => clearInterval(interval);
  }, [showStatusMessages]);

  const sizeDimensions = {
    sm: { width: 80, height: 95 },
    md: { width: 130, height: 155 },
    lg: { width: 180, height: 215 },
  }[size];

  return (
    <div
      role="status"
      className={cn(
        'cartoon-loader-wrapper flex flex-col items-center justify-center select-none',
        className,
      )}
    >
      <style>{`
        @keyframes cartoonFloat {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-12px) rotate(1.5deg);
          }
        }
        @keyframes shadowScale {
          0%, 100% {
            transform: scale(1);
            opacity: 0.28;
          }
          50% {
            transform: scale(0.65);
            opacity: 0.12;
          }
        }
        @keyframes eyeBlink {
          0%, 90%, 100% {
            transform: scaleY(1);
          }
          95% {
            transform: scaleY(0.1);
          }
        }
        @keyframes antennaPulse {
          0%, 100% {
            r: 7;
            opacity: 1;
            filter: drop-shadow(0 0 8px #FF4500);
          }
          50% {
            r: 9;
            opacity: 0.85;
            filter: drop-shadow(0 0 14px #FF5722);
          }
        }
        @keyframes signalWave {
          0% {
            r: 8;
            opacity: 0.8;
            stroke-width: 2.5;
          }
          100% {
            r: 24;
            opacity: 0;
            stroke-width: 0.5;
          }
        }
        @keyframes chestGlow {
          0%, 100% {
            transform: scale(1);
            filter: drop-shadow(0 0 6px #FF4500);
          }
          50% {
            transform: scale(1.15);
            filter: drop-shadow(0 0 12px #FFA07A);
          }
        }
        @keyframes handWaveLeft {
          0%, 100% {
            transform: rotate(0deg);
          }
          50% {
            transform: rotate(-14deg) translateY(-3px);
          }
        }
        @keyframes handWaveRight {
          0%, 100% {
            transform: rotate(0deg);
          }
          50% {
            transform: rotate(14deg) translateY(-3px);
          }
        }
        @keyframes orbitSparkle {
          0% {
            transform: rotate(0deg) translateX(48px) rotate(0deg) scale(0.8);
            opacity: 0.4;
          }
          50% {
            transform: rotate(180deg) translateX(48px) rotate(-180deg) scale(1.2);
            opacity: 1;
          }
          100% {
            transform: rotate(360deg) translateX(48px) rotate(-360deg) scale(0.8);
            opacity: 0.4;
          }
        }
        @keyframes orbitSparkleReverse {
          0% {
            transform: rotate(360deg) translateX(42px) rotate(-360deg) scale(1);
            opacity: 0.8;
          }
          50% {
            transform: rotate(180deg) translateX(42px) rotate(-180deg) scale(0.6);
            opacity: 0.3;
          }
          100% {
            transform: rotate(0deg) translateX(42px) rotate(0deg) scale(1);
            opacity: 0.8;
          }
        }
        @keyframes textFadeInOut {
          0%, 100% { opacity: 1; transform: translateY(0); }
          50% { opacity: 0.85; transform: translateY(-1px); }
        }
      `}</style>

      {/* SVG Cartoon AI Character */}
      <div className="relative flex items-center justify-center">
        <svg
          width={sizeDimensions.width}
          height={sizeDimensions.height}
          viewBox="0 0 160 190"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="overflow-visible"
        >
          <defs>
            {/* Gradients */}
            <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2E3039" />
              <stop offset="50%" stopColor="#1E2026" />
              <stop offset="100%" stopColor="#14151A" />
            </linearGradient>

            <linearGradient id="visorGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0F1015" />
              <stop offset="100%" stopColor="#1A1C24" />
            </linearGradient>

            <linearGradient id="orangeNeon" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF6B35" />
              <stop offset="100%" stopColor="#F04F1E" />
            </linearGradient>

            <linearGradient id="earGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF5722" />
              <stop offset="100%" stopColor="#E64A19" />
            </linearGradient>

            <linearGradient id="pulseCoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF8A65" />
              <stop offset="50%" stopColor="#FF4500" />
              <stop offset="100%" stopColor="#D84315" />
            </linearGradient>

            {/* Filter Glows */}
            <filter id="softGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Shadow Ellipse on Ground */}
          <ellipse
            cx="80"
            cy="180"
            rx="38"
            ry="9"
            fill="#000000"
            style={{
              transformOrigin: '80px 180px',
              animation: 'shadowScale 2.4s ease-in-out infinite',
            }}
          />

          {/* Floating Bot Container */}
          <g
            id="cartoon-bot-body-group"
            style={{
              transformOrigin: '80px 100px',
              animation: 'cartoonFloat 2.4s ease-in-out infinite',
            }}
          >
            {/* Orbiting Sparkles */}
            <g
              style={{
                transformOrigin: '80px 80px',
                animation: 'orbitSparkle 3.5s linear infinite',
              }}
            >
              <polygon points="80,72 82,78 88,80 82,82 80,88 78,82 72,80 78,78" fill="#FF8A65" />
            </g>
            <g
              style={{
                transformOrigin: '80px 80px',
                animation: 'orbitSparkleReverse 4.2s linear infinite',
              }}
            >
              <polygon
                points="80,74 81.5,78 86,79.5 81.5,81 80,85 78.5,81 74,79.5 78.5,78"
                fill="#FFAB91"
              />
            </g>

            {/* Antenna Signal Radio Waves */}
            <circle
              cx="80"
              cy="25"
              r="8"
              stroke="#FF5722"
              fill="none"
              style={{
                transformOrigin: '80px 25px',
                animation: 'signalWave 1.8s cubic-bezier(0.1, 0.8, 0.3, 1) infinite',
              }}
            />
            <circle
              cx="80"
              cy="25"
              r="8"
              stroke="#FF7043"
              fill="none"
              style={{
                transformOrigin: '80px 25px',
                animation: 'signalWave 1.8s cubic-bezier(0.1, 0.8, 0.3, 1) infinite 0.6s',
              }}
            />

            {/* Antenna Stem */}
            <rect
              x="78"
              y="28"
              width="4"
              height="18"
              rx="2"
              fill="#4B4E5A"
              stroke="#1E2026"
              strokeWidth="1.5"
            />

            {/* Antenna Glowing Beacon Bulb */}
            <circle
              cx="80"
              cy="25"
              r="7"
              fill="url(#orangeNeon)"
              stroke="#FFFFFF"
              strokeWidth="1.5"
              style={{
                transformOrigin: '80px 25px',
                animation: 'antennaPulse 1.4s ease-in-out infinite',
              }}
            />

            {/* Left Ear Muff / Headphone */}
            <rect
              x="22"
              y="65"
              width="12"
              height="26"
              rx="6"
              fill="url(#earGrad)"
              stroke="#1E2026"
              strokeWidth="2"
            />
            <circle cx="28" cy="78" r="3" fill="#FFFFFF" opacity="0.8" />

            {/* Right Ear Muff / Headphone */}
            <rect
              x="126"
              y="65"
              width="12"
              height="26"
              rx="6"
              fill="url(#earGrad)"
              stroke="#1E2026"
              strokeWidth="2"
            />
            <circle cx="132" cy="78" r="3" fill="#FFFFFF" opacity="0.8" />

            {/* Headphone Bridge Bar */}
            <path
              d="M 30 70 C 30 42, 130 42, 130 70"
              fill="none"
              stroke="#3A3D48"
              strokeWidth="4.5"
              strokeLinecap="round"
            />

            {/* Head Outer Chassis */}
            <rect
              x="30"
              y="44"
              width="100"
              height="70"
              rx="24"
              fill="url(#bodyGrad)"
              stroke="#FF5722"
              strokeWidth="2.5"
              style={{ filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.5))' }}
            />

            {/* Visor Screen */}
            <rect
              x="38"
              y="52"
              width="84"
              height="54"
              rx="16"
              fill="url(#visorGrad)"
              stroke="#2E3039"
              strokeWidth="2"
            />

            {/* Visor Gloss Reflection Curve */}
            <path
              d="M 44 58 Q 80 54 116 58"
              stroke="#FFFFFF"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.25"
            />

            {/* Cartoon Eyes (Glowing & Animated Blinking) */}
            <g
              id="cartoon-eyes"
              style={{
                transformOrigin: '80px 76px',
                animation: 'eyeBlink 3.2s ease-in-out infinite',
              }}
            >
              {/* Left Eye */}
              <ellipse
                cx="62"
                cy="76"
                rx="9"
                ry="11"
                fill="url(#orangeNeon)"
                style={{ filter: 'url(#softGlow)' }}
              />
              {/* Left Eye Catchlight Highlight */}
              <circle cx="65" cy="73" r="3.5" fill="#FFFFFF" />
              <circle cx="59" cy="80" r="1.5" fill="#FFFFFF" opacity="0.8" />

              {/* Right Eye */}
              <ellipse
                cx="98"
                cy="76"
                rx="9"
                ry="11"
                fill="url(#orangeNeon)"
                style={{ filter: 'url(#softGlow)' }}
              />
              {/* Right Eye Catchlight Highlight */}
              <circle cx="101" cy="73" r="3.5" fill="#FFFFFF" />
              <circle cx="95" cy="80" r="1.5" fill="#FFFFFF" opacity="0.8" />
            </g>

            {/* Cute Rosy Cheeks */}
            <ellipse cx="48" cy="88" rx="5" ry="2.5" fill="#FF5722" opacity="0.3" />
            <ellipse cx="112" cy="88" rx="5" ry="2.5" fill="#FF5722" opacity="0.3" />

            {/* Bot Cute Smile */}
            <path
              d="M 73 90 Q 80 96 87 90"
              fill="none"
              stroke="#FF8A65"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Bot Neck Joint */}
            <rect x="72" y="114" width="16" height="8" rx="4" fill="#3A3D48" />

            {/* Bot Torso */}
            <rect
              x="44"
              y="120"
              width="72"
              height="44"
              rx="18"
              fill="url(#bodyGrad)"
              stroke="#3A3D48"
              strokeWidth="2"
            />

            {/* Torso Glowing Pulse Heart Core */}
            <g
              style={{
                transformOrigin: '80px 142px',
                animation: 'chestGlow 1.4s ease-in-out infinite',
              }}
            >
              <circle cx="80" cy="142" r="12" fill="#14151A" stroke="#FF5722" strokeWidth="1.5" />
              {/* Pulse / Heartbeat Wave Line */}
              <path
                d="M 72 142 L 76 142 L 78 137 L 81 147 L 83 140 L 85 142 L 88 142"
                fill="none"
                stroke="url(#orangeNeon)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>

            {/* Left Floating Cartoon Hand */}
            <g
              style={{
                transformOrigin: '32px 136px',
                animation: 'handWaveLeft 2.4s ease-in-out infinite',
              }}
            >
              <circle
                cx="32"
                cy="136"
                r="8"
                fill="url(#earGrad)"
                stroke="#1E2026"
                strokeWidth="1.5"
              />
              <circle cx="32" cy="136" r="3" fill="#FFFFFF" opacity="0.7" />
            </g>

            {/* Right Floating Cartoon Hand */}
            <g
              style={{
                transformOrigin: '128px 136px',
                animation: 'handWaveRight 2.4s ease-in-out infinite',
              }}
            >
              <circle
                cx="128"
                cy="136"
                r="8"
                fill="url(#earGrad)"
                stroke="#1E2026"
                strokeWidth="1.5"
              />
              <circle cx="128" cy="136" r="3" fill="#FFFFFF" opacity="0.7" />
            </g>
          </g>
        </svg>
      </div>

      {/* Progress Bar (Optional) */}
      {showProgress && (
        <div className="mt-4 flex w-48 flex-col items-center gap-1.5">
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-zinc-800/80 p-0.5 ring-1 ring-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#FF6B35] to-[#F04F1E] shadow-[0_0_10px_#F04F1E] transition-all duration-300 ease-out"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
          <span className="font-mono text-xs font-semibold text-[#FF8A65]">
            {Math.round(progress)}%
          </span>
        </div>
      )}

      {/* Label / Dynamic AI Startup Status Text */}
      <div className="mt-3 flex flex-col items-center justify-center text-center">
        {label ? (
          <span className="text-sm font-semibold tracking-wide text-zinc-100">{label}</span>
        ) : showStatusMessages ? (
          <span
            key={msgIndex}
            className="text-xs font-medium tracking-wide text-zinc-300 transition-all duration-300 sm:text-sm"
            style={{ animation: 'textFadeInOut 1.8s ease-in-out infinite' }}
          >
            {DEFAULT_MESSAGES[msgIndex]}
          </span>
        ) : (
          <span className="sr-only">Loading</span>
        )}
      </div>
    </div>
  );
}
