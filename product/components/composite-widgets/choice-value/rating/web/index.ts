import { defineIcon } from '../icon/index.js';

// The owned default uses identical outline/fill geometry for fractional paint;
// the optional catalog remains a consumer dependency, not a renderer dependency.
const starPath = 'M12 2.5 14.9 8.6 21.6 9.5 16.8 14.2 17.9 20.9 12 17.7 6.1 20.9 7.2 14.2 2.4 9.5 9.1 8.6Z';
export const ratingStar = defineIcon({
  name: 'rating-star',
  outlined: {
    paths: [{ d: starPath, fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinejoin: 'round' }],
  },
  filled: {
    paths: [{ d: starPath, fill: 'currentColor', stroke: 'currentColor', strokeWidth: 1.7, strokeLinejoin: 'round' }],
  },
});

/** Shared finite bounds for generated rating scales. */
export function ratingMaximum(max = 5): number {
  return Number.isFinite(max) ? Math.max(1, Math.min(20, Math.floor(max))) : 5;
}

export function ratingValue(value: number, max: number, precision: 1 | 0.5 = 1, readOnly = false): number {
  const bounded = Number.isFinite(value) ? Math.max(0, Math.min(max, value)) : 0;
  return readOnly ? bounded : Math.round(bounded / precision) * precision;
}

/** Reconcile only native radios owned by this Rating group after an uncanceled reset. */
export function ratingRadios(root: HTMLElement | null): HTMLInputElement[] {
  return Array.from(root?.querySelectorAll<HTMLInputElement>('input[type="radio"]') ?? []).filter(
    (radio) => radio.closest('[data-vf-rating-root]') === root,
  );
}

export function reconcileRating(root: HTMLElement | null, value: number): void {
  for (const radio of ratingRadios(root)) radio.checked = Number(radio.value) === value;
}

/** Browser-only opt-in used by state-owning adapters; native authored markup needs no connection. */
export function connectRatingReset(root: () => HTMLElement | null, restore: () => number): () => void {
  const document = root()?.ownerDocument;
  let active = true;
  const onReset = (event: Event) => {
    const group = ratingRadios(root());
    if (!group.length || !group.every((radio) => radio.form && radio.form === event.target)) return;
    setTimeout(() => {
      if (!active || event.defaultPrevented) return;
      const current = root();
      const group = ratingRadios(current);
      if (!group.length || !group.every((radio) => radio.form && radio.form === event.target)) return;
      reconcileRating(current, restore());
    }, 0);
  };
  document?.addEventListener('reset', onReset, true);
  return () => {
    active = false;
    document?.removeEventListener('reset', onReset, true);
  };
}

/** Clear on a repeated native activation of the committed choice, never on a new choice. */
export function clearRatingOnRepeat(radio: HTMLInputElement, selected: number, clear: () => void): void {
  if (!selected || !radio.checked || Number(radio.value) !== selected || radio.required || radio.matches(':disabled')) {
    return;
  }
  // A pointer still over the cleared choice must not immediately repaint the previous score.
  if (radio.matches(':hover')) {
    radio.setAttribute('data-vf-rating-cleared', '');
    radio.addEventListener('pointerleave', () => radio.removeAttribute('data-vf-rating-cleared'), { once: true });
  }
  clear();
}
