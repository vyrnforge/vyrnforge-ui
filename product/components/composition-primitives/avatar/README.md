# Avatar and AvatarGroup — reusable identity presentation

Avatar is one non-interactive composition capability with image, letter and icon appearances. AvatarGroup composes the same capability into a native labeled identity list with an optional visible limit and +N overflow indicator. These are two exports from **one composition product owner**, not independent ImageAvatar, LetterAvatar, IconAvatar, AvatarFallback or TotalAvatar products.

React entrypoint: `@vyrnforge/react/avatar` — exports `Avatar`, `AvatarGroup` and their public types.
Canonical Web stylesheet: `@vyrnforge/web/styles/avatar.css`. Use `@vyrnforge/react/icon` plus `@vyrnforge/web/styles/icon.css` when supplying icon artwork; Avatar never embeds a competing SVG renderer or catalog.

```tsx
import { Avatar, AvatarGroup } from '@vyrnforge/react/avatar';
import { Icon } from '@vyrnforge/react/icon';
import { userIcon } from '@vyrnforge/icons/user';
import '@vyrnforge/web/styles/avatar.css';

<Avatar name="Ada Lovelace" src="/images/ada.webp" shape="rounded" />;
<Avatar name="Alex Chen" initials="AC" appearance="letter" shape="square" />;
<Avatar name="Anonymous member" appearance="icon" icon={<Icon icon={userIcon} />} />;

<AvatarGroup label="Review team" limit={2} total={7} spacing="overlap"
  formatOverflow={(count) => count + ' more reviewers'}>
  <Avatar name="Ada Lovelace" />
  <Avatar name="Alex Chen" />
  <Avatar name="Maria García" initials="MG" />
</AvatarGroup>
```

The earlier `Avatar name/src/initials/size/decorative` API remains valid. Omitted `appearance` continues to choose the image if a source exists and letters otherwise, except it chooses the supplied icon if there is no image. Explicit `appearance="letter"` ignores image sources; `appearance="icon"` requires an authored icon for visual icon content and safely falls back to letters if omitted. `fallback="icon"` can select a supplied icon on image failure, otherwise letters remain the default. Browser image errors do not change the host's single accessible identity label; changing source or responsive candidates retries.

Rounded means circular; square means zero corner radius. Existing `sm/md/lg` sizes reuse canonical control-height tokens. Group `size` and `shape` supply defaults only for children that have not set their own. `limit` caps rendered child identities; `total` counts members known outside the provided list and is clamped to at least the child count. The non-interactive +N display represents `total - visibleCount`. `formatOverflow` allows a localized accessible description; without one the accessible name remains the visible literal +N without inventing English UI text. `spacing="overlap"` is default; `none/sm/md/lg` use zero or canonical positive gaps. Logical inline margins preserve RTL.

Native Web uses the same `data-vf-avatar`, `data-vf-avatar-icon`, `data-vf-avatar-group`, `data-vf-avatar-group-item`, and `data-vf-avatar-overflow` CSS hooks on native spans, SVG/img, `ul/li`; the consumer owns native image-error handling and any dynamic group truncation/counting. React supplies those conveniences without a mandatory Core or Web controller.

**Boundaries:** no avatar-upload, remote asset loading, image preprocessing, identity verification, interactive selection, presence/status badges, or application user/account services. Do not add Badge styling or overlay positioning here yet; compose it later after Badge's own contract and component implementation are accepted. Human visual/AT acceptance and publication remain separate from CI.
