# Badge — anchored visual indicator

Badge attaches a compact **count/text or dot** indicator to a wrapped element. It is not a standalone Draft/New/Blocked label, Chip, TagGroup item, notification, status feed or action. The wrapped element keeps its own accessible name and interaction behavior.

React public entrypoint: `@vyrnforge/react/badge`; shared styling: `@vyrnforge/web/styles/badge.css`.

## Compose existing VyrnForge components

In React consumer examples, reuse the public VyrnForge components that already own each responsibility. Use `Button` for actions, `Avatar` for an identity, `Icon` for iconography, `Text` for authored text and `Flow` for layout instead of hand-built HTML and one-off styles.

```tsx
import { Badge } from '@vyrnforge/react/badge';
import { Button } from '@vyrnforge/react/button';
import { Avatar } from '@vyrnforge/react/avatar';
import { Flow } from '@vyrnforge/react/layout';
import '@vyrnforge/web/styles/badge.css';
import '@vyrnforge/web/styles/button.css';
import '@vyrnforge/web/styles/avatar.css';
import '@vyrnforge/web/styles/layout.css';

<Flow direction="inline" wrap="wrap" gap="lg" align="center">
  <Badge badgeContent={4} tone="accent">
    <Button type="button" variant="secondary" aria-label="Inbox, 4 unread messages">
      Inbox
    </Button>
  </Badge>
  <Badge variant="dot" tone="danger">
    <Button type="button" variant="secondary" aria-label="Alerts, new notifications">
      Alerts
    </Button>
  </Badge>
  <Badge badgeContent={120} max={99} overlap="circular">
    <Avatar name="Ada Lovelace, 120 updates" />
  </Badge>
</Flow>
```

The Avatar example is **generic composition**, not an Avatar-specific Badge integration API. Badge never imports, inspects or modifies Avatar. The consumer must ensure the wrapped element's accessible name conveys any meaningful badge status. The indicator itself is always hidden from assistive technology to prevent duplicate readings and is not a live region. The consumer owns alert/notification policy, counting, localization and announcements.

**Variants**: `standard` (count or short text) and `dot`. **Tones**: neutral/accent/danger using existing semantic tokens. **Sizes**: sm/md/lg, with token-derived compact count and scaled dot indicators; the wrapped target is never resized. **Position**: top/bottom × logical start/end (RTL-aware), rectangular/circular overlap. **Visibility**: `invisible`, numeric zero hidden by default or shown with `showZero`; `max` caps positive numeric display with `+` (default 99). No success/warning tones until accessible token pairs exist.

## Breaking migration from Badge v1 (#1476)

This is a deliberate rebuild breaking change: old `<Badge>Draft</Badge>` / `<Badge>12</Badge>` standalone pills are not anchored badges. Use VyrnForge `Text` for plain metadata, or design a separate **Chip** product later when independently scoped. Do **not** silently turn Badge into Chip.

- Old `<Badge>12</Badge>` → `<Badge badgeContent={12}><Button type="button" aria-label="Inbox, 12 unread messages">Inbox</Button></Badge>`
- Old `<Badge appearance="dot" label="Online" />` → `<Badge variant="dot"><Avatar name="User, online" /></Badge>`
- `appearance`, `shape`, `decorative`, `label` and subtle/outline `variant` are removed from Badge.
- `BadgeShape` is removed; `BadgeOverlap` and `BadgeAnchorOrigin` describe the new positioning contract.
- The indicator is visual-only: any accessible announcement belongs to the owning element or a dedicated notification mechanism, **not** `Badge`.

Badge v2 source merged in PR #1480 with automated CI evidence. Human visual/assistive-technology acceptance and package publication remain separate gates. Avatar-with-Badge remains a separate future composition decision.
