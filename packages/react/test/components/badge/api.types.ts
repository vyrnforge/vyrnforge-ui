import type { Ref } from 'react';
import {
  Badge, type BadgeProps, type BadgeTone, type BadgeSize,
  type BadgeShape, type BadgeVariant,
} from '@vyrnforge/react/badge';
import { Badge as RootBadge } from '@vyrnforge/react';

const text: BadgeProps = { children: 'Draft', id: 'draft' };
const count: BadgeProps = { children: 0, tone: 'accent' };
const namedDot: BadgeProps = { appearance: 'dot', label: 'Sync in progress' };
const decorativeDot: BadgeProps = { appearance: 'dot', decorative: true };
const tone: BadgeTone = 'neutral';
const size: BadgeSize = 'sm';
const shape: BadgeShape = 'pill';
const variant: BadgeVariant = 'outline';
const ref: Ref<HTMLSpanElement> | undefined = undefined;

// @ts-expect-error no arbitrary palette colors
const customTone: BadgeProps = { children: 'X', tone: 'success' };
// @ts-expect-error dots require an accessible label unless decorative
const unnamedDot: BadgeProps = { appearance: 'dot' };
// @ts-expect-error dots have no visible text children
const dotWithText: BadgeProps = { appearance: 'dot', label: 'X', children: 'x' };
// @ts-expect-error count badges are not focusable controls
const focusable: BadgeProps = { children: 'X', tabIndex: 0 };
// @ts-expect-error status role belongs to owning notification semantics
const role: BadgeProps = { children: 'X', role: 'status' };
// @ts-expect-error arbitrary interactive label content is not supported
const interactive: BadgeProps = { children: {} };
// @ts-expect-error dot-only decorative cannot invent a redundant accessible name
const decoratedNamedDot: BadgeProps = { appearance: 'dot', decorative: true, label: 'X' };

void [Badge, RootBadge, text, count, namedDot, decorativeDot, tone, size, shape,
  variant, ref, customTone, unnamedDot, dotWithText, focusable, role,
  interactive, decoratedNamedDot];
