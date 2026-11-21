import type { Ref } from 'react';
import {
  Divider,
  type DividerOrientation,
  type DividerProps,
  type DividerTextAlign,
  type DividerTextDirection,
} from '@vyrnforge/react/divider';
import {
  Divider as RootDivider,
  type DividerTextAlign as RootDividerTextAlign,
  type DividerTextDirection as RootDividerTextDirection,
} from '@vyrnforge/react';

const defaultProps: DividerProps = { id: 'visual-rule', className: 'rule', title: 'decorative' };
const verticalProps: DividerProps = { orientation: 'vertical' };
const labeled: DividerProps = { children: 'OR', textAlign: 'center' };
const labeledNumber: DividerProps = { children: 0, orientation: 'vertical', textAlign: 'end' };
const horizontal: DividerOrientation = 'horizontal';
const logicalStart: DividerTextAlign = 'start';
const logicalEnd: RootDividerTextAlign = 'end';
const defaultVerticalDirection: DividerTextDirection = 'top-to-bottom';
const reversedVerticalDirection: RootDividerTextDirection = 'bottom-to-top';
const horizontalVerticalDirection: DividerProps = {
  orientation: 'vertical', textDirection: 'horizontal', children: 'OR',
};
const ref: Ref<HTMLSpanElement> | undefined = undefined;
// @ts-expect-error orientation is deliberately limited
const invalid: DividerProps = { orientation: 'diagonal' };
// @ts-expect-error text alignment has three logical options
const invalidAlignment: DividerProps = { textAlign: 'left' };
// @ts-expect-error interactive React elements are not valid label text
const nonTextChildren: DividerProps = { children: {} };
// @ts-expect-error text direction accepts only the documented modes
const invalidTextDirection: DividerProps = { textDirection: 'reverse' };
// @ts-expect-error semantic separator role is not this visual capability
const role: DividerProps = { role: 'separator' };
// @ts-expect-error consumers cannot make a visual divider a focus target
const focusable: DividerProps = { tabIndex: 0 };
void [
  Divider, RootDivider, defaultProps, verticalProps, labeled, labeledNumber, horizontal,
  logicalStart, logicalEnd, defaultVerticalDirection, reversedVerticalDirection,
  horizontalVerticalDirection, invalidTextDirection,
  ref, invalid, invalidAlignment, nonTextChildren, role, focusable,
];
