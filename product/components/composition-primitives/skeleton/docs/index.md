# Skeleton

Reserve predictable content geometry while a region is loading. Skeleton is decorative, not a spinner or a status announcement.

## When to use

Use a line for text, a block for media and a circle for avatars. Compose multiple Skeleton instances with Flow or AutoGrid. Do not replace accessible content with an announcement for every placeholder.

## Native Web

Load `@vyrnforge/web/styles/skeleton.css`. Use `data-vf-skeleton` with `aria-hidden="true"`, optional `data-vf-skeleton-shape="line|block|circle"`, and `data-vf-skeleton-animation="wave|pulse|none"`.

Line is typography-relative, block has a default 3rem height, circle has a default 2.5rem inline size and square ratio. Override logical dimensions using CSS; provide known content dimensions to avoid layout shifts.

## Customization

Set `--vf-skeleton-color`, `--vf-skeleton-highlight`, `--vf-skeleton-radius`, and `--vf-skeleton-duration` through the shared cascade. Use CSS logical width/height for geometry. Reduced motion stops wave and pulse; forced colors keep placeholders visible.

## Accessibility

Mark the affected content region busy when appropriate, and place authored status text outside a busy region. Do not put interactive content in a Skeleton.
