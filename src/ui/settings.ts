const STORAGE_KEY = 'seven-circles.aim-sens';
const MIN = 0.2;
const MAX = 2.5;
const DEFAULT = 1;

function clamp(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT;
  return Math.min(MAX, Math.max(MIN, value));
}

function readStored(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return DEFAULT;
    return clamp(Number(raw));
  } catch {
    return DEFAULT;
  }
}

function writeStored(value: number): void {
  try {
    localStorage.setItem(STORAGE_KEY, String(value));
  } catch {
    // Private mode or blocked storage — the slider still works this session.
  }
}

/**
 * Gear + aim slider. Esc releases pointer lock and opens the panel.
 * Clicking the view locks the mouse again and closes it.
 */
export function initAimSettings(
  canvas: HTMLElement,
  onChange: (scale: number) => void,
): number {
  const gear = document.getElementById('settings-gear');
  const panel = document.getElementById('settings-panel');
  const slider = document.getElementById('aim-sens');
  const readout = document.getElementById('sens-readout');
  if (!(gear instanceof HTMLButtonElement)) throw new Error('#settings-gear missing');
  if (!(panel instanceof HTMLElement)) throw new Error('#settings-panel missing');
  if (!(slider instanceof HTMLInputElement)) throw new Error('#aim-sens missing');
  if (!readout) throw new Error('#sens-readout missing');

  const settingsPanel: HTMLElement = panel;
  let open = false;
  const initial = readStored();
  slider.value = String(initial);
  readout.textContent = initial.toFixed(2);
  onChange(initial);

  function setOpen(next: boolean): void {
    open = next;
    settingsPanel.hidden = !next;
    if (next && document.pointerLockElement) document.exitPointerLock();
  }

  slider.addEventListener('input', () => {
    const scale = clamp(Number(slider.value));
    readout.textContent = scale.toFixed(2);
    writeStored(scale);
    onChange(scale);
  });

  gear.addEventListener('click', (event) => {
    event.stopPropagation();
    setOpen(!open);
  });

  window.addEventListener('keydown', (event) => {
    if (event.code !== 'Escape') return;
    if (open) {
      setOpen(false);
      return;
    }
    setOpen(true);
  });

  document.addEventListener('pointerlockchange', () => {
    if (document.pointerLockElement === canvas) setOpen(false);
  });

  return initial;
}
