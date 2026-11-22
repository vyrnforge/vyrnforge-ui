# Badge — anchored visual indicator

Badge attaches a compact **count/text or dot** indicator to a wrapped element. It is not a standalone Draft/New/Blocked label, Chip, TagGroup item, notification, status feed or action.

React public entrypoint: `@vyrnforge/react/badge`; shared styling: `@vyrnforge/web/styles/badge.css`.

```tsx
import { Badge } from '@vyrnforge/react/badge';
import '@vyrnforge/web/styles/badge.css';

<Badge badgeContent={4} tone="accent">
  <button type="button" aria-label="Inbox, 4 unread messages">Inbox</button>
</Badge>
<Badge variant="dot" tone="danger">
  <button type="button" aria-label="Notifications, new items">Notifications</button>
</Badge>
<Badge badgeContent={120} max={99} overlap="circular">
  <Avatar name="Ada Lovelace" />
</Badge>
```

The last example demonstrates composition only; Badge never imports, inspects or modifies Avatar. The consumer must ensure the wrapped element's accessible name conveys any meaningful badge status. The indicator itself is always hidden from assistive technology to prevent duplicate readings and is not a live region. The consumer owns alert/notification policy, counting, localization and announcements.

**Variants**: `standard` (count or short text) and `dot`. **Tones**: neutral/accent/danger using existing semantic tokens. **Sizes**: sm/md. **Position**: top/bottom × logical start/end (RTL-aware), rectangular/circular overlap. **Visibility**: `invisible`, numeric zero hidden by default or shown with `showZero`; `max` caps positive numeric display with `+` (default 99). No success/warning tones until accessible token pairs exist.

## Breaking migration from Badge v1 (#1476)

This is a deliberate rebuild breaking change: old `<Badge>Draft</Badge>` / `<Badge>12</Badge>` standalone pills are not anchored badges. Use normal `Text` for plain metadata, or design a separate **Chip** product later when independently scoped. Do **not** silently turn Badge into Chip.

- `<Badge>12</Badge>` → `<Badge badgeContent={12}><YourTarget /></Badge>`
- `<Badge appearance="dot" label="Online" />` → `<Badge variant="dot"><YourTarget aria-label="User, online" /></Badge>`
- `appearance`, `shape`, `decorative`, `label` and subtle/outline `variant` are removed from Badge.
- `BadgeShape` is removed; `BadgeOverlap` and `BadgeAnchorOrigin` describe the new positioning contract.
- The indicator is visual-only: any accessible announcement belongs to the owning element or a dedicated notification mechanism, **not** `Badge`.

Status: proposed implementation with package/API/browser evidence required before merge. Human visual/assistive-technology acceptance and publication are independent gates. Avatar-with-Badge API remains a separate later decision.
