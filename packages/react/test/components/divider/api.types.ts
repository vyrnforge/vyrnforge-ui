import type { Ref } from 'react';
import { Divider, type DividerOrientation, type DividerProps } from '@vyrnforge/react/divider';
import { Divider as RootDivider } from '@vyrnforge/react';

const defaultProps: DividerProps = { id: 'visual-rule', className: 'rule', 'data-testid': 'line' };
const verticalProps: DividerProps = { orientation: 'vertical' };
const horizontal: DividerOrientation = 'horizontal';
const ref: Ref<HTMLSpanElement> | undefined = undefined;
// @ts-expect-error orientation is deliberately limited
const invalid: DividerProps = { orientation: 'diagonal' };
// @ts-expect-error visual-only Divider does not author meaningful children
const children: DividerProps = { children: 'not permitted' };
// @ts-expect-error semantic separator role is not this visual capability
const role: DividerProps = { role: 'separator' };
// @ts-expect-error consumers cannot make a decorative line a focus target
const focusable: DividerProps = { tabIndex: 0 };
void [Divider, RootDivider, defaultProps, verticalProps, horizontal, ref, invalid, children, role, focusable];
