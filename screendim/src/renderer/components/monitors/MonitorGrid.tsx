import { useState, useRef, useCallback, useEffect } from 'react';
import { MonitorCard } from './MonitorCard';
import { MonitorInfo, MonitorState, MonitorPosition } from '../../../shared/types';

interface MonitorGridProps {
  monitors: MonitorInfo[];
  monitorStates: Record<number, MonitorState>;
  selectedMonitors: number[];
  controlAll: boolean;
  monitorPositions: Record<number, MonitorPosition>;
  monitorNames: Record<number, string>;
  onMonitorClick: (id: number) => void;
  onPositionCommit: (id: number, pos: MonitorPosition) => void;
  onMonitorRename: (id: number, name: string) => void;
}

const CARD_W = 156;
const CARD_H = 180;
const CANVAS_H = 400;

function defaultPositions(monitors: MonitorInfo[], canvasWidth: number): Record<number, MonitorPosition> {
  const gap = 10;
  const totalW = monitors.length * CARD_W + (monitors.length - 1) * gap;
  const startX = Math.max(gap, (canvasWidth - totalW) / 2);
  const y = (CANVAS_H - CARD_H) / 2;
  const positions: Record<number, MonitorPosition> = {};
  monitors.forEach((m, i) => {
    positions[m.id] = { x: startX + i * (CARD_W + gap), y };
  });
  return positions;
}

export function MonitorGrid({
  monitors, monitorStates, selectedMonitors, controlAll,
  monitorPositions, monitorNames, onMonitorClick, onPositionCommit, onMonitorRename,
}: MonitorGridProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const dragPos = useRef({ x: 0, y: 0 });
  const didMove = useRef(false);
  const [canvasWidth, setCanvasWidth] = useState(600);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const obs = new ResizeObserver((entries) => {
      for (const e of entries) setCanvasWidth(e.contentRect.width);
    });
    obs.observe(el);
    setCanvasWidth(el.clientWidth);
    return () => obs.disconnect();
  }, []);

  const getPositions = useCallback((): Record<number, MonitorPosition> => {
    const saved = monitorPositions ?? {};
    if (monitors.length > 0 && monitors.every((m) => saved[m.id])) return saved;
    return { ...defaultPositions(monitors, canvasWidth), ...saved };
  }, [monitors, monitorPositions, canvasWidth]);

  const posRef = useRef(getPositions());
  posRef.current = getPositions();

  const handleMouseDown = useCallback((id: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const pos = posRef.current[id];
    if (!pos) return;
    dragOffset.current = { x: e.clientX - rect.left - pos.x, y: e.clientY - rect.top - pos.y };
    dragPos.current = { ...pos };
    didMove.current = false;
    setDraggingId(id);
  }, []);

  useEffect(() => {
    if (draggingId === null) return;

    const handleMove = (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      didMove.current = true;
      const x = Math.max(0, Math.min(rect.width - CARD_W, e.clientX - rect.left - dragOffset.current.x));
      const y = Math.max(0, Math.min(CANVAS_H - CARD_H, e.clientY - rect.top - dragOffset.current.y));
      dragPos.current = { x, y };
      const el = cardRefs.current.get(draggingId);
      if (el) {
        el.style.left = `${x}px`;
        el.style.top = `${y}px`;
      }
    };

    const handleUp = () => {
      if (didMove.current) {
        onPositionCommit(draggingId, dragPos.current);
      } else {
        onMonitorClick(draggingId);
      }
      setDraggingId(null);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [draggingId, onPositionCommit, onMonitorClick]);

  if (monitors.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-text-muted text-xs">
        No monitors detected
      </div>
    );
  }

  const pos = getPositions();

  return (
    <div>
      {/* Animated gradient border frame */}
      <div className="canvas-frame">
        <div className="relative rounded-[14px] overflow-auto"
             style={{ background: 'linear-gradient(180deg, var(--canvas-bg-top) 0%, var(--canvas-bg-bottom) 100%)' }}>

          {/* Subtle dot grid */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
               style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 0.5px, transparent 0.5px)', backgroundSize: '20px 20px' }} />

          {/* Canvas */}
          <div ref={canvasRef} className="relative" style={{ height: CANVAS_H, minWidth: monitors.length * (CARD_W + 12) }}>
            {monitors.map((monitor) => {
              const p = pos[monitor.id] ?? { x: 0, y: 0 };
              const isDragging = draggingId === monitor.id;
              return (
                <div
                  key={monitor.id}
                  ref={(el) => { if (el) cardRefs.current.set(monitor.id, el); }}
                  onMouseDown={(e) => handleMouseDown(monitor.id, e)}
                  className={`absolute ${isDragging ? 'z-50' : 'z-10'}`}
                  style={{
                    left: p.x,
                    top: p.y,
                    willChange: isDragging ? 'left, top' : 'auto',
                    transition: isDragging ? 'none' : 'left 0.15s ease-out, top 0.15s ease-out',
                  }}
                >
                  <MonitorCard
                    monitor={monitor}
                    state={monitorStates[monitor.id] ?? { id: monitor.id, brightness: 100, dimness: 50, overlayOpacity: 0, isSelected: false }}
                    isSelected={selectedMonitors.includes(monitor.id)}
                    controlAll={controlAll}
                    isDragging={isDragging}
                    customName={monitorNames[monitor.id]}
                    onRename={onMonitorRename}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {monitors.length > 1 && (
        <p className="text-center text-[11px] text-text-muted/40 mt-2">
          drag to arrange &middot; click to select
        </p>
      )}
    </div>
  );
}
