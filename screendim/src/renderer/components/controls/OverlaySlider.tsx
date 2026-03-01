import { Moon } from 'lucide-react';

interface OverlaySliderProps {
  value: number;
  onChange: (value: number) => void;
}

export function OverlaySlider({ value, onChange }: OverlaySliderProps) {
  const dark = value > 25;
  const intensity = dark ? Math.min(1, (value - 25) / 50) : 0;

  return (
    <div className="flex items-center gap-3">
      <Moon size={16} className="shrink-0 transition-colors duration-300"
            style={{ color: dark ? `rgba(255,150,50,${0.5 + intensity * 0.5})` : 'var(--color-accent)' }} />
      <div className="flex-1 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium transition-colors duration-300"
                style={{ color: dark ? `rgba(255,160,70,${0.6 + intensity * 0.4})` : 'var(--color-text-secondary)' }}>
            Dark Overlay
          </span>
          <span className="text-xs font-mono tabular-nums transition-colors duration-300"
                style={{ color: dark ? `rgba(255,150,50,${0.5 + intensity * 0.5})` : 'var(--color-text-muted)' }}>
            {value}%
          </span>
        </div>
        <div className="relative h-5 flex items-center">
          <div className="absolute h-1 inset-x-0 rounded-full transition-colors duration-300"
               style={{ backgroundColor: dark ? `rgba(255,120,30,${0.06 + intensity * 0.06})` : 'var(--color-border)' }} />
          <div className="absolute h-1 left-0 rounded-full transition-all duration-150"
               style={{
                 width: `${value}%`,
                 background: dark
                   ? `linear-gradient(90deg, rgba(255,140,40,${0.5 + intensity * 0.4}), rgba(255,80,20,${0.3 + intensity * 0.4}))`
                   : `linear-gradient(90deg, var(--color-accent), var(--color-surface-hover))`,
                 boxShadow: dark ? `0 0 ${4 + intensity * 8}px rgba(255,120,30,${intensity * 0.35})` : 'none',
                 opacity: dark ? 1 : 0.5,
               }} />
          <input
            type="range" min={0} max={100} value={value}
            onChange={(e) => onChange(parseInt(e.target.value, 10))}
            className={`relative w-full z-10 ${dark ? 'tron-thumb' : ''}`}
          />
        </div>
      </div>
    </div>
  );
}
