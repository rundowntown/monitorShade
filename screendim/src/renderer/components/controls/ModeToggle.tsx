import { AppMode } from '../../../shared/types';

interface ModeToggleProps {
  mode: AppMode;
  onToggle: (mode: AppMode) => void;
  tronIntensity?: number;
}

export function ModeToggle({ mode, onToggle, tronIntensity = 0 }: ModeToggleProps) {
  const tron = tronIntensity > 0;

  return (
    <div className="flex items-center rounded-lg p-0.5 transition-colors duration-300"
         style={{ backgroundColor: tron ? `rgba(255,140,50,${0.03 + tronIntensity * 0.03})` : 'color-mix(in srgb, var(--color-accent) 5%, transparent)' }}>
      {(['auto', 'toggle'] as const).map((m) => (
        <button
          key={m}
          onClick={() => onToggle(m)}
          className="px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-all duration-300"
          style={{
            backgroundColor: mode === m
              ? tron ? `rgba(255,140,50,${0.12 + tronIntensity * 0.08})` : 'color-mix(in srgb, var(--color-accent) 15%, transparent)'
              : undefined,
            color: mode === m
              ? tron ? `rgba(255,160,70,${0.7 + tronIntensity * 0.3})` : 'var(--color-accent)'
              : tron ? `rgba(255,150,60,${0.3 + tronIntensity * 0.2})` : 'var(--color-text-muted)',
          }}
        >
          {m}
        </button>
      ))}
    </div>
  );
}
