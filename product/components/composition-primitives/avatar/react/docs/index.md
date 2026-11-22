# React Avatar

Use `Avatar` for one image, letter or icon identity and `AvatarGroup` for a labeled collection with configurable spacing and a +N visible remainder. Both reuse the same Native Web stylesheet.

## React setup

```tsx
import { Avatar, AvatarGroup } from '@vyrnforge/react/avatar';
import { Icon } from '@vyrnforge/react/icon';
import { userIcon } from '@vyrnforge/icons/user';
import '@vyrnforge/web/styles/avatar.css';
import '@vyrnforge/web/styles/icon.css';

<Avatar name="Ada Lovelace" src="/images/ada.webp" />
<Avatar name="Alex Chen" appearance="letter" initials="AC" shape="square" size="lg" />
<Avatar name="Anonymous member" appearance="icon" icon={<Icon icon={userIcon} />} />

<AvatarGroup label="Review team" limit={2} total={7} spacing="overlap"
  formatOverflow={(count) => count + ' more reviewers'}>
  <Avatar name="Ada Lovelace" />
  <Avatar name="Alex Chen" />
  <Avatar name="Maria García" />
</AvatarGroup>
```

Use `@vyrnforge/react/avatar` for the components and `@vyrnforge/react/icon` for artwork, rather than implementing icon SVG or grouping CSS locally.

## React authoring

Required `name` supplies one accessible identity. `appearance` may be `image | letter | icon`; omission auto-selects image for `src`/`srcSet`, otherwise icon if `icon` exists, otherwise letters. Provide a decorative `Icon` or `SvgIcon` through `icon`; Avatar does not import a particular glyph. `shape` is `rounded | square`; `size` remains `sm | md | lg`. `initials` customizes the letter fallback for localization. `fallback="icon"` selects supplied icon artwork after an image error; without artwork it safely uses letters. Native `loading`, `decoding`, `srcSet` and `sizes` forward to the image. The Avatar ref resolves to its `HTMLSpanElement`, and ordinary noninteractive span props pass through.

`AvatarGroup` accepts direct Avatar children with required `label`, optional `limit` and `total`, `spacing="overlap" | "none" | "sm" | "md" | "lg"`, group default `size`/`shape`, and optional `formatOverflow(count)` for localizable surplus text. A child's explicit size/shape overrides the group default. `limit` counts visible supplied Avatars; `total` may include members not passed in the child list. The group forwards an `HTMLUListElement` ref and native list props.

## React accessibility

The Avatar span has one image-like role/name while its initials, Icon and native image are decorative. `decorative` suppresses repeated names next to visible text. The group is a labeled native list with individually named avatar entries plus an optional noninteractive +N entry. Provide `formatOverflow` for a meaningful localizable surplus description; without it the +N literal remains readable. Image errors and overflow do not change visible member names, and no hidden items are mounted or focusable. Any click interaction must belong to an owning Link/Button; Badge is a separate future composition.

## React state and server rendering

SSR produces native spans, optional img/SVG and ul/li list markup without browser APIs. Hydration retains source identities and group ordering; client-side native image errors switch to the authored fallback. Changing an image source or responsive candidates permits retry. Group limit/total changes re-render the visible subset and surplus count deterministically. AvatarGroup owns only presentation and counts, not remote member fetching, hidden-member navigation, identity permission policy, notification badges, or interactive expansion.
