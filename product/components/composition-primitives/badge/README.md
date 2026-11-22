# Badge — concise noninteractive label and indicator

Badge is one composition-owned, noninteractive text/count/dot capability. It does not duplicate Text, TagGroup, Toast, presence logic, numeric count policy or interactive chips. Consumers author localized meaning; neither color nor dot paint may carry meaning on its own.

React entrypoint: `@vyrnforge/react/badge`, with `Badge` and public types. Shared stylesheet: `@vyrnforge/web/styles/badge.css`. No controller or application state.

```tsx
import { Badge } from '@vyrnforge/react/badge';
import '@vyrnforge/web/styles/badge.css';

<Badge>Draft</Badge>
<Badge tone="accent" size="sm">New</Badge>
<Badge tone="danger" variant="outline">Blocked</Badge>
<Badge>12</Badge>
<Badge appearance="dot" label="Sync in progress" tone="accent" />
<Badge appearance="dot" decorative />
```

Only neutral, accent, and danger tones are supported by current semantic token roles. Status-specific success/warning colors are deferred until paired accessible palette tokens exist. Shape is rounded or pill; compact sizes are sm/md; variant is subtle or outline. Count formatting, escalation, action wrapping and overlays are consumer-owned. Avatar-with-Badge is a separate future decision.

Status: source implementation proposal. Package build, exact-head CI, independent visual and assistive-technology review, and publication are separate gates.
