import { defineIcon } from '../icon/index.js';

// The owned default uses identical outline/fill geometry for fractional paint;
// the optional catalog remains a consumer dependency, not a renderer dependency.
const starPath = 'M12 2.5 14.9 8.6 21.6 9.5 16.8 14.2 17.9 20.9 12 17.7 6.1 20.9 7.2 14.2 2.4 9.5 9.1 8.6Z';
export const ratingStar = defineIcon({
  name: 'rating-star',
  outlined: { paths: [{ d: starPath, fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinejoin: 'round' }] },
  filled: { paths: [{ d: starPath, fill: 'currentColor', stroke: 'currentColor', strokeWidth: 1.7, strokeLinejoin: 'round' }] },
});

/** Shared finite bounds for generated rating scales. */
export function ratingMaximum(max = 5): number {
  return Number.isFinite(max) ? Math.max(1, Math.min(20, Math.floor(max))) : 5;
}

export function ratingValue(value: number, max: number, precision: 1 | 0.5 = 1, readOnly = false): number {
  const bounded = Number.isFinite(value) ? Math.max(0, Math.min(max, value)) : 0;
  return readOnly ? bounded : Math.round(bounded / precision) * precision;
}
