import type { MotionDirection, MotionEffect, MotionProps } from '@vyrnforge/react';
import { Motion } from '@vyrnforge/react';

const effect: MotionEffect = 'fade-slide';
const direction: MotionDirection = 'inline-start';
const props: MotionProps = {
  effect, direction, active: false, duration: 420, as: 'section', dir: 'rtl', id: 'announcement',
  className: 'my-effect', 'aria-label': 'New content',
};
// @ts-expect-error Unsupported effects cannot enter the public API.
const invalidEffect: MotionEffect = 'rotate';
// @ts-expect-error Motion durations must be numeric milliseconds.
const invalidDuration: MotionProps = { duration: 'very-slow' };
// @ts-expect-error Arbitrary non-semantic custom tags are not supported hosts.
const invalidHost: MotionProps = { as: 'some-unknown-tag' };
void [Motion, props, invalidEffect, invalidDuration, invalidHost];
