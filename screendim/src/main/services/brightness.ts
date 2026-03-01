import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import { app } from 'electron';

let daemon: ChildProcess | null = null;
let ready = false;
let pendingCallbacks: Map<number, { resolve: (v: any) => void; reject: (e: Error) => void; timer: ReturnType<typeof setTimeout> }> = new Map();
let callId = 0;
let responseBuffer = '';
let heartbeatInterval: ReturnType<typeof setInterval> | null = null;
let missedHeartbeats = 0;

const HEARTBEAT_MS = 10000;
const HEARTBEAT_MAX_MISS = 3;
const CALL_TIMEOUT_MS = 4000;

function getDaemonScript(): string {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'scripts', 'brightness_daemon.py');
  }
  return path.join(app.getAppPath(), 'src', 'main', 'scripts', 'brightness_daemon.py');
}

function startDaemon(): void {
  if (daemon && !daemon.killed) return;

  ready = false;
  responseBuffer = '';

  const scriptPath = getDaemonScript();
  daemon = spawn('python', [scriptPath], {
    stdio: ['pipe', 'pipe', 'pipe'],
  });

  daemon.stdout?.on('data', (data: Buffer) => {
    responseBuffer += data.toString();
    const lines = responseBuffer.split('\n');
    responseBuffer = lines.pop() || '';

    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const msg = JSON.parse(line.trim());

        if (msg.ready) {
          ready = true;
          console.log('[brightness-daemon] Ready');
          startHeartbeat();
          return;
        }

        if (msg.pong) {
          missedHeartbeats = 0;
          return;
        }

        // Match to pending callback by order
        const oldest = pendingCallbacks.entries().next().value;
        if (oldest) {
          const [id, cb] = oldest;
          clearTimeout(cb.timer);
          pendingCallbacks.delete(id);
          if (msg.ok) cb.resolve(msg);
          else cb.reject(new Error(msg.error || 'Unknown daemon error'));
        }
      } catch { /* ignore malformed lines */ }
    }
  });

  daemon.stderr?.on('data', (data: Buffer) => {
    console.error('[brightness-daemon] stderr:', data.toString().trim());
  });

  daemon.on('exit', (code) => {
    console.warn(`[brightness-daemon] Exited with code ${code}, respawning...`);
    ready = false;
    daemon = null;
    stopHeartbeat();
    rejectAllPending('Daemon exited');
    setTimeout(startDaemon, 500);
  });

  daemon.on('error', (err) => {
    console.error('[brightness-daemon] Error:', err.message);
    ready = false;
    daemon = null;
  });
}

function startHeartbeat(): void {
  stopHeartbeat();
  missedHeartbeats = 0;
  heartbeatInterval = setInterval(() => {
    if (!daemon || !ready) return;
    missedHeartbeats++;
    if (missedHeartbeats > HEARTBEAT_MAX_MISS) {
      console.warn('[brightness-daemon] Heartbeat timeout, killing and respawning');
      daemon.kill();
      return;
    }
    sendRaw({ action: 'ping' });
  }, HEARTBEAT_MS);
}

function stopHeartbeat(): void {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }
}

function rejectAllPending(reason: string): void {
  for (const [id, cb] of pendingCallbacks) {
    clearTimeout(cb.timer);
    cb.reject(new Error(reason));
  }
  pendingCallbacks.clear();
}

function sendRaw(cmd: Record<string, any>): void {
  if (daemon?.stdin?.writable) {
    daemon.stdin.write(JSON.stringify(cmd) + '\n');
  }
}

function sendCommand(cmd: Record<string, any>): Promise<any> {
  return new Promise((resolve, reject) => {
    if (!daemon || !ready) {
      startDaemon();
      reject(new Error('Daemon not ready'));
      return;
    }

    const id = callId++;
    const timer = setTimeout(() => {
      pendingCallbacks.delete(id);
      reject(new Error('Daemon call timeout'));
    }, CALL_TIMEOUT_MS);

    pendingCallbacks.set(id, { resolve, reject, timer });
    sendRaw(cmd);
  });
}

export async function getBrightness(displayId: number): Promise<number> {
  try {
    const result = await sendCommand({ action: 'get', display: displayId });
    return result.value ?? 100;
  } catch {
    return 100;
  }
}

export interface BrightnessResult {
  ok: boolean;
  error?: string;
}

export async function setBrightness(displayId: number, value: number): Promise<BrightnessResult> {
  const v = Math.round(Math.max(0, Math.min(100, value)));
  try {
    await sendCommand({ action: 'set', display: displayId, value: v });
    return { ok: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error(`[brightness] Failed display ${displayId}:`, msg);
    return { ok: false, error: msg };
  }
}

export function initBrightnessDaemon(): void {
  startDaemon();
}

export function destroyBrightnessProcess(): void {
  stopHeartbeat();
  rejectAllPending('Shutting down');
  if (daemon && !daemon.killed) {
    daemon.stdin?.end();
    daemon.kill();
  }
  daemon = null;
  ready = false;
}
