# Image

Use native images with VyrnForge's shared responsive styling. Image is a lightweight presentation treatment for ordinary photographs and illustrations; the browser and your markup remain responsible for image meaning, sources, and loading.

## When to use

Use `data-vf-image` when an ordinary `img` needs the shared display normalization, surface radius, and sizing that fits its available inline space. Keep the image as a real HTML element.

## When not to use

Do not use Image as a substitute for an Avatar, an interactive media viewer, a lightbox, a gallery, or an image editor. The Image treatment does not provide application-specific error fallback, asset fetching, or crop/zoom policy.

## Quick start

Load `@vyrnforge/web/styles/image.css` through your application's stylesheet pipeline and place `data-vf-image` directly on `img`. The checked-in example below uses a self-contained image so it renders without an external image service.

## Responsive images

Image applies `max-inline-size: 100%` and automatic block sizing: it can shrink in a narrow container without distorting the original aspect ratio. Author `width` and `height` when the intrinsic dimensions are known so the browser can reserve space.

Use native `srcset`, `sizes`, and `picture` when your application needs responsive source selection or art direction. Image does not decide which asset to fetch. Use native `loading`, `decoding`, `fetchpriority`, and other image attributes according to your content and performance needs, rather than using the same policy for every image.

## Informative and decorative content

Give an informative image a concise `alt` that conveys its purpose in context. For an image that adds no information beyond nearby content, author `alt=""`; there is no need for a custom role or `aria-hidden` on the image. Never use a filename or generic "image" label as alternative text.

## Captions and context

When an image needs a visible caption, compose native `figure` and `figcaption` around the `img`. Image does not add a wrapper or a caption API. Avoid making alternative text simply repeat the adjacent caption.

## Accessibility

Image does not change native `img` semantics, focusability, keyboard interaction, or accessible naming. Alternative text belongs to the author; meaningful and decorative images have different naming requirements. Ensure the information an image communicates is available to users who cannot see it.

## Native Web

The public styling entrypoint is `@vyrnforge/web/styles/image.css`. The only VyrnForge markup hook is `data-vf-image` on a native `img`. Native Web needs no Image runtime. React consumers can also use the thin `@vyrnforge/react/image` convenience component, which renders the same native `img` and applies the same CSS hook without changing browser semantics.

## Boundaries

Image does not own network failures, placeholders, caching, lazy-loading policy, captions, interactive controls, or asset transformation. Keep those decisions with native HTML, the consuming application, or an independently justified higher-level media capability.
