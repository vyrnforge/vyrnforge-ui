# React Avatar

One component covers initials, an optional photo and automatic image-error fallback. It uses canonical Web CSS and native image behavior.

## React setup

```tsx
import { Avatar } from '@vyrnforge/react/avatar';
import '@vyrnforge/web/styles/avatar.css';

<Avatar name="Ada Lovelace" />
<Avatar name="Ada Lovelace" src="/images/ada.webp" />
<Avatar name="Maria García" initials="MG" size="lg" />
```

No provider, state store, image loader, or separate `AvatarFallback` component is required.

## React authoring

`name` is required and becomes the single accessible image-like label. `initials` overrides the default first/last-name abbreviation; use it for localized names or chosen short forms. `src` is an optional native image URL. React listens for its image-error event and removes the failed image, revealing initials. Changing `src` retries the new image. `size` accepts `sm | md | lg`; `loading`, `decoding`, `srcSet`, and `sizes` are forwarded to the native image. The component forwards an `HTMLSpanElement` ref and ordinary span attributes to its host.

## React accessibility

Avatar is an accessible image-like identity by default with a single authored label. The internal photo is decorative (`alt=""`) and initials are presentational (`aria-hidden="true"`). Use `decorative` when an adjacent visible text name makes a repeated image announcement unnecessary. Do not add click handlers expecting Avatar to act as a control: wrap it in a semantic Button or Link. Image load failure changes only presentation, not the accessible name.

## React state and server rendering

SSR produces native span, fallback initials and optional native image. During hydration the existing DOM is reused; no browser-only code runs on the server. React handles subsequent image errors with local component state. If the source changes, the new source is attempted without retaining a prior source's failure. URLs, network policies, privacy constraints and content ownership stay with the application.
