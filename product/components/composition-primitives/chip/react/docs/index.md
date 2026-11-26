# React Chip

## React setup

Load the shared Chip stylesheet once.

```tsx
import { Chip } from '@vyrnforge/react/chip';
import '@vyrnforge/web/styles/chip.css';
```

## Composition with existing VyrnForge components

Use the existing Flow layout for wrapped rows; use Icon and Avatar in decorative leading or trailing slots. Chip composes Button, ToggleButton and Link internally. An optional removal icon can be supplied with the existing Icon catalog; the default typographic close mark has no independent accessible name. Use TagGroupRoot and TagGroupItem for managed removable collections and their existing focus restoration. No raw styling attributes are required.

## React state and server rendering

Static: `<Chip>Draft</Chip>`. Action: pass `onClick`. Navigation: pass `href` and optionally `target`, `rel` or `linkRef`; do not combine navigation with `onClick` or `selectable`. Selection: pass `selectable` and either `defaultSelected` or `selected` plus `onSelectedChange`. Removal: pass `onRemove` and a localized `removeLabel`, and update the consumer's collection only when accepted. A stable forwarded span ref identifies the Chip; `actionRef`, `linkRef` and `removeRef` target the actual native controls. Selection, action or navigation can each be composed with independent dismissal. Use Motion for optional entry decoration or feedback in the remaining content, never retain a removed interactive chip for an exit animation. Examples use real public React APIs and shared CSS. The playground exposes label, variant, tone, size, mode, adornment, removal icon, disabled, selection and wrapping, with selectable generated usage and reset. Generated snippets explicitly identify application-owned handlers/state, and the full runnable playground source is separately available.
