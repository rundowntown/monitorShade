import { useState, useRef } from 'react';

interface AppLogoProps {
  size?: number;
  tronIntensity?: number;
}

export function AppLogo({ size = 54, tronIntensity = 0 }: AppLogoProps) {
  const [hovered, setHovered] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const spinAngle = useRef(0);

  const tron = tronIntensity > 0;
  const c1 = tron ? '#ff9632' : 'var(--color-accent)';
  const c2 = tron ? '#ffb860' : 'var(--color-accent-bright)';
  const cGlow = tron ? 'rgba(255,140,50,0.6)' : 'var(--color-accent-dim)';
  const active = hovered || spinning;

  const handleClick = () => {
    spinAngle.current += 360;
    setSpinning(true);
    setClickCount((c) => c + 1);
    setTimeout(() => setSpinning(false), 800);
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handleClick}
      className="cursor-pointer"
      style={{
        transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.3s ease',
        transform: spinning
          ? `scale(1.2) rotate(${spinAngle.current}deg)`
          : hovered ? 'scale(1.1)' : 'scale(1)',
        filter: `drop-shadow(0 0 ${active ? 12 : 7}px ${cGlow})`,
      }}
    >
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="lCore" cx="50%" cy="50%" r="35%">
            <stop offset="0%" stopColor={c2} stopOpacity="1" />
            <stop offset="100%" stopColor={c1} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Monitor body */}
        <rect x="5" y="6" width="38" height="24" rx="3" fill="none"
              stroke={c1} strokeWidth={active ? '2.2' : '1.8'} opacity={active ? '1' : '0.75'} />

        {/* Screen fill */}
        <rect x="7" y="8" width="34" height="20" rx="1.5"
              fill={c1} opacity={active ? '0.1' : '0.05'} />

        {/* Monitor stand */}
        <line x1="24" y1="30" x2="24" y2="36" stroke={c1} strokeWidth="2.5" strokeLinecap="round" opacity={active ? '0.8' : '0.55'} />
        <line x1="15" y1="37" x2="33" y2="37" stroke={c1} strokeWidth="2.5" strokeLinecap="round" opacity={active ? '0.8' : '0.55'} />

        {/* Sun circle */}
        <circle cx="24" cy="18" r="5" fill="none" stroke={c2} strokeWidth="1.8" opacity={active ? '1' : '0.75'} />

        {/* Sun core — glowing */}
        <circle cx="24" cy="18" r="2.5" fill="url(#lCore)">
          <animate attributeName="r" values="2;3;2" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.85;1;0.85" dur="2s" repeatCount="indefinite" />
        </circle>

        {/* Rays — thicker, brighter */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
          const len = angle % 90 === 0 ? 9 : 7.5;
          const innerR = 6;
          return (
            <line key={angle}
                  x1={24 + Math.cos((angle * Math.PI) / 180) * innerR}
                  y1={18 + Math.sin((angle * Math.PI) / 180) * innerR}
                  x2={24 + Math.cos((angle * Math.PI) / 180) * len}
                  y2={18 + Math.sin((angle * Math.PI) / 180) * len}
                  stroke={c2} strokeWidth="1.3" strokeLinecap="round"
                  opacity={active ? '0.7' : '0.4'} />
          );
        })}

        {/* Pulse ring */}
        <circle cx="24" cy="18" r="5" fill="none" stroke={c2} strokeWidth="0.6">
          <animate attributeName="r" values="5;9;5" dur="2.5s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.5;0;0.5" dur="2.5s" repeatCount="indefinite" />
        </circle>

        {/* Click count Easter egg — tiny dots */}
        {clickCount > 2 && (
          <text x="24" y="44" textAnchor="middle" fill={c1} opacity="0.4" fontSize="5" fontFamily="monospace">
            ×{clickCount}
          </text>
        )}
      </svg>
    </div>
  );
}
