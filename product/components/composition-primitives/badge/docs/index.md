# Badge

Badge is a small noninteractive **anchored indicator** on an existing element. Its indicator displays a count, short text or dot. The wrapped element keeps its native semantics and behavior. Badge is not a standalone capsule label; Chip is reserved as a separate future capability.

## When to use

Use Badge to supplement an existing icon, button, Avatar, list item or other visual target with a compact numeric count or dot. For standalone metadata such as Draft, New or Blocked, use ordinary Text; do not borrow Badge as a Chip. TagGroup owns managed collections of interactive tags. Badge itself does not manage notifications, status sources, actions or focus.

## Counts and visibility

`standard` shows authored `badgeContent` (short text or number). Positive counts above `max` show the capped value followed by a plus sign; the default cap is 99. A numeric zero is visually hidden by default; `showZero` reveals it. `invisible` hides either standard or dot indicators without removing the wrapped child. Count meaning, pluralization, locale-specific formatting, and any announcement are consumer-owned. The visual `99+` is not used as an accessible name automatically.

## Placement and overlap

Positioning belongs to Badge rather than Avatar or any wrapped component. The default is top/end, with top/bottom and logical start/end corners and rectangular/circular overlap. Logical horizontal positioning respects RTL. Wrapping an existing interactive element does not make Badge itself interactive. Use an appropriate target size and spacing so the overhanging indicator is not clipped; application overflow containers may require their own layout decisions.

## Tones and sizing

Neutral/accent/danger use established semantic color roles. Sizes sm/md control the indicator only. Standard badges are pill-shaped; dot indicators are circles. Success/warning colors require separate token and contrast approval. No raw color, arbitrary size, dismiss control, action, selection state or presence detection is introduced.

## Accessibility

The badge indicator is visual-only (`aria-hidden="true"`), nonfocusable, and never a status/live region. Place the badge meaning in the wrapped item's accessible name (for example, an Inbox button named “Inbox, 4 unread messages”), and keep that name accurate when the count or visibility changes. For a noninteractive visual target, provide equivalent nearby text. Do not rely on a dot's color alone. Badge must not override wrapped focus, role, keyboard handling or DOM semantics. Check RTL, forced colors, theme contrast, text scaling and narrow reflow.

## Boundaries

Chip, TagGroup, status labels, notification queues, business counting, accessible alerts, activity streams and interactive dismiss/removal remain separate responsibilities. Avatar-with-Badge is a future composition decision, not an option baked into either component.

## Native Web markup

The Native Web documentation surface owns static HTML examples using `@vyrnforge/web/styles/badge.css` and the `data-vf-badge` hooks. React consumers use the public component.
