import { createElement, type Ref } from 'react';
import {
  Badge, type BadgeProps, type BadgeTone, type BadgeSize,
  type BadgeVariant, type BadgeOverlap, type BadgeAnchorOrigin,
} from '@vyrnforge/react/badge';
import { Badge as RootBadge } from '@vyrnforge/react';

const child = createElement('button', { type: 'button', 'aria-label': 'Inbox, four unread' }, 'Inbox');
const count: BadgeProps = { children: child, badgeContent: 4, tone: 'accent' };
const text: BadgeProps = { children: child, badgeContent: 'NEW' };
const dot: BadgeProps = { children: child, variant: 'dot', overlap: 'circular' };
const zero: BadgeProps = { children: child, badgeContent: 0, showZero: true };
const hidden: BadgeProps = { children: child, badgeContent: 3, invisible: true };
const anchor: BadgeAnchorOrigin = { vertical: 'bottom', horizontal: 'start' };
const tone: BadgeTone = 'neutral';
const size: BadgeSize = 'sm';
const variant: BadgeVariant = 'standard';
const overlap: BadgeOverlap = 'rectangular';
const ref: Ref<HTMLSpanElement> | undefined = undefined;

// @ts-expect-error Badge needs a wrapped target
const withoutTarget: BadgeProps = { badgeContent: 4 };
// @ts-expect-error default standard Badge needs visual content
const withoutContent: BadgeProps = { children: child };
// @ts-expect-error old standalone appearance contract removed
const oldAppearance: BadgeProps = { children: child, badgeContent: 4, appearance: 'text' };
// @ts-expect-error Chip-style pill appearance no longer belongs to Badge
const oldShape: BadgeProps = { children: child, badgeContent: 4, shape: 'pill' };
// @ts-expect-error no old outline visual variant
const outline: BadgeProps = { children: child, badgeContent: 4, variant: 'outline' };
// @ts-expect-error dot variant does not take count content
const dotWithCount: BadgeProps = { children: child, variant: 'dot', badgeContent: 4 };
// @ts-expect-error unknown semantic palette
const unsupportedTone: BadgeProps = { children: child, badgeContent: 4, tone: 'success' };
// @ts-expect-error no manual focus target on Badge wrapper
const focusable: BadgeProps = { children: child, badgeContent: 4, tabIndex: 0 };
// @ts-expect-error role belongs to wrapped target, not Badge
const statusRole: BadgeProps = { children: child, badgeContent: 4, role: 'status' };
// @ts-expect-error invalid logical corner
const invalidAnchor: BadgeAnchorOrigin = { vertical: 'middle', horizontal: 'right' };

void [Badge, RootBadge, count, text, dot, zero, hidden, anchor, tone, size, variant,
  overlap, ref, withoutTarget, withoutContent, oldAppearance, oldShape, outline,
  dotWithCount, unsupportedTone, focusable, statusRole, invalidAnchor];
