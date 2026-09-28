import type { PerkDef } from '../perks/catalog';
import type { PerkView } from '../perks/run';

/** Names and one-line descriptions. No base-stat numbers. */
export function initPerkHud(onChoose: (index: number) => void): {
  sync(views: readonly PerkView[], offer: readonly PerkDef[]): void;
  flash(name: string): void;
} {
  const list = document.getElementById('perk-list');
  const offerEl = document.getElementById('perk-offer');
  const cards = document.getElementById('perk-cards');
  const toast = document.getElementById('perk-toast');
  if (!list || !offerEl || !cards || !toast) throw new Error('perk HUD markup missing');

  let shown = '';
  let toastUntil = 0;

  window.addEventListener('keydown', (event) => {
    if (offerEl.hidden) return;
    const index = event.code === 'Digit1' ? 0 : event.code === 'Digit2' ? 1 : event.code === 'Digit3' ? 2 : -1;
    if (index < 0) return;
    event.preventDefault();
    onChoose(index);
  });

  return {
    flash(name: string): void {
      toast.textContent = name;
      toast.hidden = false;
      toastUntil = performance.now() + 1100;
    },

    sync(views: readonly PerkView[], offer: readonly PerkDef[]): void {
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

      const key = offer.map((perk) => perk.id).join('|');
      offerEl.hidden = offer.length === 0;
      if (offer.length === 0) {
        shown = '';
        cards.replaceChildren();
      } else if (key !== shown) {
        shown = key;
        cards.replaceChildren();
        offer.forEach((perk, index) => {
          const button = document.createElement('button');
          button.type = 'button';
          button.className = 'perk-card';
          const kicker = document.createElement('div');
          kicker.className = 'perk-key';
          kicker.textContent = String(index + 1);
          const name = document.createElement('div');
          name.className = 'perk-name';
          name.textContent = perk.name;
          const desc = document.createElement('div');
          desc.className = 'perk-desc';
          desc.textContent = perk.description;
          button.append(kicker, name, desc);
          button.addEventListener('click', (event) => {
            event.stopPropagation();
            onChoose(index);
          });
          cards.append(button);
        });
      }

      if (toastUntil > 0 && performance.now() > toastUntil) {
        toast.hidden = true;
        toastUntil = 0;
      }
    },
  };
}
