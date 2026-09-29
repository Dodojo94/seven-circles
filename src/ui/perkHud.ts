import type { PerkView } from '../perks/run';

/** Equipped weapon's perk names and one-liners. No base-stat numbers. */
export function initPerkHud(): {
  sync(views: readonly PerkView[]): void;
  flash(name: string): void;
} {
  const list = document.getElementById('perk-list');
  const toast = document.getElementById('perk-toast');
  if (!list || !toast) throw new Error('perk HUD markup missing');

  let toastUntil = 0;

  return {
    flash(name: string): void {
      toast.textContent = name;
      toast.hidden = false;
      toastUntil = performance.now() + 900;
    },

    sync(views: readonly PerkView[]): void {
      list.replaceChildren();
      if (views.length > 0) {
        const heading = document.createElement('div');
        heading.className = 'perk-heading';
        heading.textContent = 'Perks';
        list.append(heading);
      }
      for (const view of views) {
        const row = document.createElement('div');
        row.className = view.hot ? 'perk hot' : 'perk';
        const name = document.createElement('div');
        name.className = 'perk-name';
        name.textContent = view.name;
        const desc = document.createElement('div');
        desc.className = 'perk-desc';
        desc.textContent = view.description;
        row.append(name, desc);
        list.append(row);
      }

      if (toastUntil > 0 && performance.now() > toastUntil) {
        toast.hidden = true;
        toastUntil = 0;
      }
    },
  };
}
