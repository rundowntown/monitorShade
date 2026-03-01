import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

async function runPython(script: string): Promise<string> {
  const { stdout } = await execFileAsync('python', ['-c', script], { timeout: 5000 });
  return stdout.trim();
}

export async function getBrightness(displayId: number): Promise<number> {
  try {
    const output = await runPython(
      `import screen_brightness_control as sbc; print(sbc.get_brightness(display=${displayId})[0] if isinstance(sbc.get_brightness(display=${displayId}), list) else sbc.get_brightness(display=${displayId}))`
    );
    const val = parseInt(output, 10);
    return isNaN(val) ? 100 : val;
  } catch {
    return 100;
  }
}

export async function setBrightness(displayId: number, value: number): Promise<void> {
  const v = Math.round(Math.max(0, Math.min(100, value)));
  try {
    await runPython(
      `import screen_brightness_control as sbc; sbc.set_brightness(${v}, display=${displayId})`
    );
  } catch (err) {
    console.error(`Failed to set brightness for display ${displayId}:`, err);
  }
}

export function destroyBrightnessProcess(): void {
  // no persistent process to clean up
}
