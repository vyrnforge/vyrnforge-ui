import { createElement, forwardRef } from 'react';
import type { CSSProperties, HTMLAttributes, ReactElement } from 'react';
import type { ThemeElement } from './theme.js';

export type MotionEffect = 'fade' | 'grow' | 'slide' | 'zoom' | 'fade-slide' | 'pop';
export type MotionDirection = 'block-start' | 'block-end' | 'inline-start' | 'inline-end';

export interface MotionProps extends Omit<HTMLAttributes<HTMLElement>, 'color'> {
  /** Native semantic wrapper, using the same host choices as ThemeScope. */
  as?: ThemeElement;
  /** One-shot entrance effect; component presence and exit are consumer-owned. */
  effect?: MotionEffect;
  /** Toggle the entrance decoration without remounting or hiding children. */
  active?: boolean;
  /** Logical slide origin; includes RTL adaptation. */
  direction?: MotionDirection;
  /** Optional per-instance timing in milliseconds; default is Web's 320ms token. */
  duration?: number;
}

const makeElement = createElement as (host: ThemeElement, props: object) => ReactElement;

/** SSR-safe React adapter over the shared Web CSS entrance effects. */
export const Motion = forwardRef<HTMLElement, MotionProps>(function Motion(
  { as = 'div', effect = 'fade', active = true, direction, duration, style, ...nativeProps },
  ref
) {
  if (duration !== undefined && (!Number.isFinite(duration) || duration < 0)) {
    throw new RangeError('Motion duration must be a finite, non-negative number of milliseconds.');
  }
  const resolvedStyle: CSSProperties | undefined = duration === undefined
    ? style
    : { ...style, '--vf-motion-duration-enter': `${duration}ms` } as CSSProperties;
  return makeElement(as, {
    ...nativeProps,
    ref,
    'data-vf-motion': active ? effect : undefined,
    'data-vf-motion-direction': active ? direction : undefined,
    style: resolvedStyle,
  });
});
