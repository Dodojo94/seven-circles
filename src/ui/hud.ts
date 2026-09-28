/** HUD: title + weapon slot labels. Lazy owns polish later. */
export function initHud(): void {
  const slots: Record<string, HTMLElement | null> = {
    Digit1: document.getElementById('slot-primary'),
    Digit2: document.getElementById('slot-secondary'),
    Digit3: document.getElementById('slot-melee'),
  };

  const highlight = (code: string): void => {
    for (const [key, el] of Object.entries(slots)) {
      if (!el) continue;
      el.style.borderColor = key === code ? '#e8c070' : '#8b4513';
      el.style.color = key === code ? '#fff0c0' : '#e8c070';
    }
  };

  // Default: Primary selected
  highlight('Digit1');

  window.addEventListener('weapon-slot', ((e: CustomEvent<string>) => {
    highlight(e.detail);
  }) as EventListener);
}
