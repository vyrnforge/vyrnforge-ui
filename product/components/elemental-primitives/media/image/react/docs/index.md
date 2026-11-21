# React Image

Import `Image` from `@vyrnforge/react/image` to author a native image with VyrnForge's shared responsive presentation. The component renders a single `img` and adds no loading system or extra DOM wrapper.

## React setup

```tsx
import { Image } from '@vyrnforge/react/image';
import '@vyrnforge/web/styles/image.css';

<Image src="/assets/landscape.webp" alt="A tree beside a quiet lake" width={640} height={320} />
```

Load the shared stylesheet through the application's normal CSS pipeline. React does not import the stylesheet implicitly.

## React attributes and refs

`ImageProps` is based on native React `img` props, without children. Pass `src`, `alt`, `srcSet`, `sizes`, `width`, `height`, `loading`, `decoding`, `fetchPriority`, `onLoad`, `onError`, ordinary ARIA/data attributes, and a React ref as appropriate. The Image component forwards the ref to the native `HTMLImageElement`.

Write `alt=""` for decorative images. Use `figure` and `figcaption` directly in JSX when a visible caption is needed. React's `picture` composition is also supported through ordinary native elements. Image does not infer alternative text, control network requests, manage failure fallbacks, or implement application-specific image optimization.

## SSR and hydration

The server output is ordinary `img` markup with the `data-vf-image` styling hook. No browser globals, effects, or hydration-specific image state are required. Keep image sources and attributes consistent between server and client.

## Styling

`@vyrnforge/web/styles/image.css` remains the canonical visual implementation; React applies `data-vf-image` to the same native element. There are no React-only sizes, crop variants, token definitions, or style overrides.
