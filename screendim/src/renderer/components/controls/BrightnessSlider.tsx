import { Sun } from 'lucide-react';

interface BrightnessSliderProps {
  value: number;
  onChange: (value: number) => void;
  label?: string;
}

export function BrightnessSlider({ value, onChange, label = 'Brightness' }: BrightnessSliderProps) {
  const dark = value < 45;
  const intensity = dark ? (45 - value) / 45 : 0;

  return (
    <div className="flex items-center gap-3">
      <Sun size={16} className="shrink-0 transition-colors duration-300"
           style={{ color: dark ? `rgba(255,150,50,${0.5 + intensity * 0.5})` : 'var(--color-accent)' }} />
      <div className="flex-1 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium transition-colors duration-300"
                style={{ color: dark ? `rgba(255,160,70,${0.6 + intensity * 0.4})` : 'var(--color-text-secondary)' }}>
            {label}
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
                   ? `linear-gradient(90deg, rgba(255,120,30,${0.5 + intensity * 0.4}), rgba(255,180,60,${0.3 + intensity * 0.3}))`
                   : 'var(--color-accent)',
                 boxShadow: dark ? `0 0 ${4 + intensity * 6}px rgba(255,120,30,${intensity * 0.3})` : 'none',
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
