# Avatar — image and initials identity presentation

Avatar is a single, non-interactive **composition primitive** for representing a person or entity using a circular image or short textual initials. It owns image-error fallback internally in React and shares one canonical Web stylesheet with native HTML. There is deliberately **no standalone AvatarFallback** elemental product.

React public entrypoint: `@vyrnforge/react/avatar`. Canonical CSS: `@vyrnforge/web/styles/avatar.css`.

```tsx
import { Avatar } from '@vyrnforge/react/avatar';
import '@vyrnforge/web/styles/avatar.css';

<Avatar name="Ada Lovelace" />
<Avatar name="Ada Lovelace" src="/images/ada.webp" />
<Avatar name="Maria García" initials="MG" size="lg" />
<Avatar name="Ada Lovelace" decorative />
```

The required `name` is the authored accessible identity and the simple two-initial derivation source. `initials` overrides the derived abbreviation for localized names or chosen identity. When `src` fails to load, React removes the failed native image element and shows the already-present initials. Changing `src` retries the new source. SSR emits native accessible markup with a fallback under the image, and hydration retains it. The photo is `alt=""` because the labeled Avatar host already carries the accessible identity once. Mark decorative when a visible adjacent label already identifies the user and avatar description would be redundant.

Native Web uses the same CSS hooks and native span/img elements; a native consumer owns its own `error` listener to hide/remove failed images because CSS cannot reliably detect network failure. This does **not** introduce a mandatory Web or Core avatar runtime.

Image still owns generic native-image presentation; Avatar alone owns its circular identity crop, initials presentation and fallback behavior. No account data, profile fetching, upload, editing, presence/status, grouping or interactive semantics are owned by Avatar.
