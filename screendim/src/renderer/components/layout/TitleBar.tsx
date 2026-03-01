import { Minus, Square, X } from 'lucide-react';

interface TitleBarProps {
  tronIntensity?: number;
}

export function TitleBar({ tronIntensity = 0 }: TitleBarProps) {
  const tron = tronIntensity > 0;

  return (
    <div className="flex items-center justify-between h-9 select-none transition-colors duration-500"
         style={{
           borderBottom: `1px solid ${tron ? `rgba(255,140,50,${0.08 + tronIntensity * 0.08})` : 'rgba(255,255,255,0.04)'}`,
           WebkitAppRegion: 'drag',
         } as React.CSSProperties}>
      <div className="flex items-center gap-2.5 pl-4">
        <span className="text-xs font-bold tracking-[0.08em] uppercase transition-colors duration-500"
              style={{ color: tron ? `rgba(255,170,80,${0.6 + tronIntensity * 0.4})` : 'var(--color-accent)' }}>
          MonitorShade
        </span>
      </div>

      <div className="flex h-full" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
        <button onClick={() => window.electronAPI.minimize()}
          className="flex items-center justify-center w-11 h-full text-text-muted/60 hover:text-text-primary hover:bg-white/[0.06] transition-colors">
          <Minus size={14} />
        </button>
        <button onClick={() => window.electronAPI.maximize()}
          className="flex items-center justify-center w-11 h-full text-text-muted/60 hover:text-text-primary hover:bg-white/[0.06] transition-colors">
          <Square size={10} />
        </button>
        <button onClick={() => window.electronAPI.close()}
          className="flex items-center justify-center w-11 h-full text-text-muted/60 hover:text-white hover:bg-red-500/70 transition-colors">
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
