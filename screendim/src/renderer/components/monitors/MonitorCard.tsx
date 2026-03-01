import { useState } from 'react';
import { Monitor, Sun, Moon } from 'lucide-react';
import { MonitorInfo, MonitorState } from '../../../shared/types';

interface MonitorCardProps {
  monitor: MonitorInfo;
  state: MonitorState;
  isSelected: boolean;
  controlAll: boolean;
  isDragging: boolean;
  customName?: string;
  onRename?: (id: number, name: string) => void;
}

export function MonitorCard({ monitor, state, isSelected, controlAll, isDragging, customName, onRename }: MonitorCardProps) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const b = state.brightness;
  const o = state.overlayOpacity;
  const hasOverlay = o > 0;
  const active = isSelected || controlAll;

  const screenLight = Math.round((b / 100) * 30 + 6);

  const darkness = Math.max(0, (100 - b) / 100, o / 100);
  // Smooth ramp — no hard threshold, no flickering
  const tronIntensity = Math.min(1, Math.max(0, (darkness - 0.2) / 0.5));
  const tronColor = `rgba(255, 140, 50, ${tronIntensity * 0.7})`;
  const tronGlow = `rgba(255, 120, 30, ${tronIntensity * 0.4})`;

  const tron = tronIntensity > 0.05;
  const sr = 'var(--select-r)';
  const sg = 'var(--select-g)';
  const sb = 'var(--select-b)';

  const screenBg = active
    ? `linear-gradient(145deg, hsl(230 25% ${screenLight + 4}%), hsl(240 20% ${Math.max(5, screenLight - 2)}%))`
    : `linear-gradient(145deg, hsl(230 12% ${screenLight}%), hsl(230 10% ${Math.max(4, screenLight - 3)}%))`;

  const cardShadow = isDragging
    ? `0 12px 40px rgba(${sr},${sg},${sb},0.25)`
    : active
      ? tron
        ? `0 4px 24px rgba(255,120,30,${0.12 + tronIntensity * 0.12}), 0 0 0 1px rgba(255,140,50,${0.3 + tronIntensity * 0.2})`
        : `0 4px 24px rgba(${sr},${sg},${sb},0.12), 0 0 0 1px rgba(${sr},${sg},${sb},0.3)`
      : '0 0 0 1px rgba(255,255,255,0.04)';

  const cardBg = isDragging ? 'var(--card-bg-active)'
    : active
      ? tron ? 'rgba(30,20,10,0.9)' : 'var(--card-bg-active)'
      : 'var(--card-bg)';

  return (
    <div
      className={`
        relative flex flex-col items-center gap-2 px-4 pt-4 pb-3 rounded-2xl select-none
        w-[156px] cursor-grab active:cursor-grabbing
        transition-all duration-200 ease-out
        ${isDragging ? 'scale-110 z-50' : ''}
      `}
      style={{
        backgroundColor: cardBg,
        boxShadow: cardShadow,
      }}
    >
      {/* Selected indicator bar — top edge */}
      {active && !isDragging && (
        <div className="absolute top-0 left-4 right-4 h-[2px] rounded-full transition-colors duration-300"
             style={{
               background: tron
                 ? `linear-gradient(90deg, transparent, rgba(255,150,50,${0.6 + tronIntensity * 0.4}), transparent)`
                 : `linear-gradient(90deg, transparent, rgba(${sr},${sg},${sb},0.5), transparent)`,
               boxShadow: tron
                 ? `0 0 8px rgba(255,120,30,${0.3 + tronIntensity * 0.2})`
                 : `0 0 8px rgba(${sr},${sg},${sb},0.2)`,
             }} />
      )}

      {/* Screen with bezel */}
      <div className="relative w-full pointer-events-none">
        {/* Outer bezel */}
        <div className="rounded-lg p-[2px] transition-all duration-300"
             style={{
               background: active
                 ? tron
                   ? `linear-gradient(145deg, rgba(255,150,50,0.4), rgba(255,120,30,0.15))`
                   : `linear-gradient(145deg, rgba(${sr},${sg},${sb},0.4), rgba(${sr},${sg},${sb},0.15))`
                 : 'linear-gradient(145deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))',
             }}>
          {/* Inner screen */}
          <div
            className="relative aspect-[16/10] rounded-md overflow-hidden"
            style={{
              background: screenBg,
              boxShadow: tron
                ? `inset 0 0 2px ${tronColor}, 0 0 ${8 + tronIntensity * 12}px ${tronGlow}`
            : active
              ? `inset 0 1px 1px rgba(255,255,255,0.03), inset 0 0 12px rgba(${sr},${sg},${sb},0.04)`
                  : 'inset 0 1px 1px rgba(255,255,255,0.02)',
              transition: 'box-shadow 0.3s ease, background 0.3s ease',
            }}
          >
            {/* Scanline texture */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                 style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 3px)', backgroundSize: '100% 3px' }} />

            {/* Top edge highlight */}
            <div className="absolute top-0 inset-x-0 h-px"
                 style={{ background: active
                   ? tron ? `linear-gradient(90deg, transparent 10%, rgba(255,150,50,0.3) 50%, transparent 90%)` : `linear-gradient(90deg, transparent 10%, rgba(${sr},${sg},${sb},0.25) 50%, transparent 90%)`
                   : 'linear-gradient(90deg, transparent 10%, rgba(255,255,255,0.06) 50%, transparent 90%)'
                 }} />

            {/* Screen reflection */}
            <div className="absolute inset-0 pointer-events-none"
                 style={{
                   background: active && !tron
                     ? `linear-gradient(135deg, rgba(${sr},${sg},${sb},0.04) 0%, transparent 30%), linear-gradient(315deg, rgba(0,0,0,0.15) 0%, transparent 40%)`
                     : tron
                       ? `linear-gradient(135deg, rgba(255,150,50,${tronIntensity * 0.04}) 0%, transparent 30%), linear-gradient(315deg, rgba(0,0,0,0.15) 0%, transparent 40%)`
                       : 'linear-gradient(135deg, rgba(255,255,255,0.015) 0%, transparent 30%), linear-gradient(315deg, rgba(0,0,0,0.1) 0%, transparent 40%)',
                 }} />

            {hasOverlay && (
              <div className="absolute inset-0 bg-black transition-opacity duration-200" style={{ opacity: o / 100 * 0.85 }} />
            )}

            {/* Tron edge lines */}
            {tron && (
              <>
                <div className="absolute top-0 inset-x-0 h-px" style={{
                  background: `linear-gradient(90deg, transparent 5%, ${tronColor} 30%, rgba(255,160,60,${tronIntensity * 0.9}) 50%, ${tronColor} 70%, transparent 95%)`,
                  boxShadow: `0 0 4px ${tronGlow}`,
                }} />
                <div className="absolute bottom-0 inset-x-0 h-px" style={{
                  background: `linear-gradient(90deg, transparent 10%, ${tronColor} 35%, rgba(255,160,60,${tronIntensity * 0.8}) 50%, ${tronColor} 65%, transparent 90%)`,
                  boxShadow: `0 0 4px ${tronGlow}`,
                }} />
                <div className="absolute left-0 inset-y-0 w-px" style={{
                  background: `linear-gradient(180deg, transparent 10%, ${tronColor} 40%, transparent 90%)`,
                }} />
                <div className="absolute right-0 inset-y-0 w-px" style={{
                  background: `linear-gradient(180deg, transparent 10%, ${tronColor} 40%, transparent 90%)`,
                }} />
              </>
            )}

            {/* Monitor icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Monitor size={active ? 28 : 24} strokeWidth={active ? 1.8 : 1.2}
                className="transition-all duration-200"
                style={{
                  color: tron
                    ? `rgba(255, 150, 50, ${0.3 + tronIntensity * 0.5})`
                    : active ? `rgba(${sr},${sg},${sb},0.75)` : 'rgba(255,255,255,0.1)',
                  filter: active && !tron ? `drop-shadow(0 0 4px rgba(${sr},${sg},${sb},0.3))` : 'none',
                }}
              />
            </div>

            {/* Brightness bar */}
            <div className="absolute bottom-0 inset-x-0 h-1 bg-black/20">
              <div className="h-full transition-all duration-200"
                style={{
                  width: `${b}%`,
                  background: tron
                    ? `linear-gradient(90deg, rgba(255,120,30,${0.5 + tronIntensity * 0.4}), rgba(255,170,60,${0.4 + tronIntensity * 0.3}))`
                    : active
                      ? `linear-gradient(90deg, rgba(${sr},${sg},${sb},0.6), rgba(${sr},${sg},${sb},0.3))`
                      : 'rgba(255,255,255,0.15)',
                  boxShadow: active && !tron ? `0 0 4px rgba(${sr},${sg},${sb},0.2)` : undefined,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stand */}
      <div className="flex flex-col items-center gap-[1px] pointer-events-none">
        <div className="w-1 h-1.5 rounded-sm transition-colors duration-300"
             style={{ backgroundColor: active ? (tron ? `rgba(255,140,50,${0.25 + tronIntensity * 0.15})` : `rgba(${sr},${sg},${sb},0.2)`) : 'rgba(255,255,255,0.05)' }} />
        <div className="w-8 h-[2px] rounded-full transition-colors duration-300"
             style={{ backgroundColor: active ? (tron ? `rgba(255,140,50,${0.2 + tronIntensity * 0.1})` : `rgba(${sr},${sg},${sb},0.15)`) : 'rgba(255,255,255,0.04)' }} />
      </div>

      {/* Label — double-click to rename */}
      {editing ? (
        <input
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { onRename?.(monitor.id, editValue.trim() || monitor.name); setEditing(false); }
            if (e.key === 'Escape') setEditing(false);
          }}
          onBlur={() => { onRename?.(monitor.id, editValue.trim() || monitor.name); setEditing(false); }}
          autoFocus
          className="text-sm font-medium text-center w-full bg-white/[0.06] border border-white/[0.1] rounded px-1 py-0.5 outline-none focus:ring-1 focus:ring-accent/40 pointer-events-auto"
          style={{ color: active ? (tron ? 'rgba(255,170,80,0.9)' : `rgba(${sr},${sg},${sb},0.9)`) : 'var(--color-text-primary)' }}
        />
      ) : (
        <span className="text-sm font-medium leading-tight truncate max-w-full transition-colors duration-200 cursor-default"
              style={{ color: active ? (tron ? 'rgba(255,170,80,0.9)' : `rgba(${sr},${sg},${sb},0.9)`) : 'var(--color-text-secondary)' }}
              onDoubleClick={(e) => {
                e.stopPropagation();
                setEditValue(customName || monitor.name.replace(' (Primary)', ''));
                setEditing(true);
              }}>
          {(customName || monitor.name.replace(' (Primary)', ''))}
          {monitor.isPrimary && !customName && <span style={{ opacity: 0.5 }}> · P</span>}
        </span>
      )}

      {/* Stats row */}
      <div className="flex items-center gap-3 pointer-events-none">
        <span className="flex items-center gap-1 text-xs font-mono transition-colors duration-200"
              style={{ color: tron ? `rgba(255,150,60,${0.5 + tronIntensity * 0.4})` : active ? `rgba(${sr},${sg},${sb},0.55)` : 'var(--color-text-muted)' }}>
          <Sun size={12} />
          {b}%
        </span>
        <span className="flex items-center gap-1 text-xs font-mono transition-colors duration-200"
              style={{ color: tron ? `rgba(255,150,60,${0.5 + tronIntensity * 0.4})` : hasOverlay && active ? `rgba(${sr},${sg},${sb},0.55)` : 'var(--color-text-muted)' }}>
          <Moon size={12} />
          {o}%
        </span>
      </div>

      {/* Active indicator dot */}
      {active && !isDragging && (
        <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full transition-all duration-300"
             style={{
               backgroundColor: tron ? `rgba(255,150,50,${0.8 + tronIntensity * 0.2})` : `rgb(${sr},${sg},${sb})`,
               boxShadow: tron ? '0 0 8px rgba(255,120,30,0.6)' : `0 0 8px rgba(${sr},${sg},${sb},0.5)`,
             }} />
      )}
    </div>
  );
}
