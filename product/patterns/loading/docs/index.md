# Loading

Loading communicates that work is in progress while keeping operation ownership with the application.

## Choose a presentation

Use `data-vf-loading-indicator` with `data-vf-loading-variant="spinner" | "dots" | "bars" | "pulse"` for compact indeterminate feedback.

Use the independent Skeleton primitive for predictable content geometry (`@vyrnforge/web/styles/skeleton.css`). The former LoadingPlaceholder hooks remain migration surfaces.

Use the independent Progress primitive (`<progress data-vf-progress>`, `@vyrnforge/web/styles/progress.css`) when progress itself is meaningful. Supply `value` only when it represents truthful determinate progress; omit it for indeterminate progress.

Use `data-vf-loading-custom` for authored SVG, Icon, branded artwork, composed primitives, illustrations, or other loading visuals that do not belong in a closed library variant list.

## Native Web

Load `@vyrnforge/web/styles/loading.css`.

An optional `data-vf-loading` scope supplies shared Loading variables and a visual size axis:

- `data-vf-loading-size="sm"`
- `data-vf-loading-size="md"` (default)
- `data-vf-loading-size="lg"`

Built-in presentation hooks may also be used without an extra wrapper when that produces cleaner native markup.

## Customization

Loading's visual API is deliberately open through CSS custom properties. Preset variants select a visual recipe; they do not lock its color, size, stroke, speed, radius, or brand treatment.

Shared variables:

- `--vf-loading-color` — shared presentation color; defaults to the accent color.
- `--vf-loading-track-color` — shared track/background color.
- `--vf-loading-indicator-size` — compact indicator size.
- `--vf-loading-indicator-thickness` — spinner stroke thickness.
- `--vf-loading-indicator-duration` — shared compact-indicator motion override.

Indicator-specific overrides:

- `--vf-loading-spinner-color`
- `--vf-loading-spinner-track-color`
- `--vf-loading-spinner-duration`
- `--vf-loading-dots-color`
- `--vf-loading-dots-duration`
- `--vf-loading-bars-color`
- `--vf-loading-bars-duration`
- `--vf-loading-pulse-color`
- `--vf-loading-pulse-duration`

Structured-placeholder overrides:

- `--vf-loading-placeholder-color`
- `--vf-loading-placeholder-highlight`
- `--vf-loading-placeholder-radius`
- `--vf-loading-placeholder-line-radius`
- `--vf-loading-placeholder-duration`

Progress overrides:

- `--vf-loading-progress-color`
- `--vf-loading-progress-track-color`
- `--vf-loading-progress-size`
- `--vf-loading-progress-radius`

Custom-content override:

- `--vf-loading-custom-color`

Set shared variables on a `data-vf-loading` scope to theme a whole loading composition, or set a presentation-specific variable directly on one indicator, placeholder, progress element, or custom artwork host.

For example:

```html
<span
  data-vf-loading
  style="
    --vf-loading-spinner-color: rebeccapurple;
    --vf-loading-spinner-track-color: lavender;
    --vf-loading-indicator-size: 2rem;
    --vf-loading-indicator-thickness: 0.18em;
  "
>
  <span
    data-vf-loading-indicator
    data-vf-loading-variant="spinner"
    aria-hidden="true"
  ></span>
</span>
```

Any valid CSS color can be used. Prefer VyrnForge tokens when the loading presentation should follow the active theme. Color remains presentational; do not use a loader color alone to communicate success, warning, danger, or another semantic state.

Custom content is the primary extension point. Do not add a new built-in variant merely to support product-specific artwork.

## Structured placeholders

Placeholder paint does not own layout. Compose existing VyrnForge responsibilities:

- Stack / Inline / Grid / Cluster for arrangement;
- AspectRatio for known ratios;
- semantic HTML plus owning CSS/shared surface tokens for visual containment;
- Text or native text for status copy.

The previous consolidation is superseded. Prefer the independent Skeleton and Progress APIs. Old Loading hooks remain temporarily supported for migration:

- `data-vf-loading-placeholder` → `data-vf-skeleton`
- `data-vf-loading-placeholder-shape` → `data-vf-skeleton-shape`
- `@vyrnforge/react/loading` legacy LoadingPlaceholder / LoadingProgress → `@vyrnforge/react/skeleton` / `@vyrnforge/react/progress`

## Accessibility

Loading CSS does not create async semantics.

Author `aria-busy` on the affected region when appropriate and provide an authored status message when users need one. Decorative indicators/placeholders should be `aria-hidden="true"` when equivalent semantic status is provided elsewhere.

Native `<progress>` keeps native progress semantics and needs an accessible label/relationship when its meaning is not otherwise clear.

Custom loading artwork must either provide correct semantics itself or be hidden from assistive technology when equivalent status/progress information exists separately.

Reduced-motion removes non-essential continuous movement while keeping every built-in presentation visible. Forced-colors retains a visible indicator/placeholder/progress treatment.

## Framework boundary

The canonical implementation is Native Web CSS because the family is presentation- and native-semantics-oriented. The React-first adapter projects the same presentation hooks without owning any application async state. Skeleton and Progress have separate component owners; Loading remains the indeterminate presentation and broader pattern guidance. Other framework wrappers are not required merely for symmetry.

### React

Import `Loading`, `LoadingIndicator` and `LoadingCustom` from `@vyrnforge/react/loading`. Use Skeleton and Progress from their own entrypoints in new compositions. The browser entrypoint uses the same Web stylesheet; SSR-safe imports do not load CSS. Supply the public Web stylesheet explicitly if your bundler does not select browser exports.

`Loading` is an optional div scope with size sm/md/lg and authored children. Place aria-busy on the affected region and author a status outside it if the status must be announced while the region is busy. Indicator and Placeholder are decorative; the native progress element must have an accessible name, and omission of value preserves indeterminate semantics. Custom children remain first-class.

```tsx
import { Loading, LoadingIndicator } from '@vyrnforge/react/loading';
import { Progress } from '@vyrnforge/react/progress';

<>
  <Loading aria-busy={true} size="sm">
    <LoadingIndicator />
  </Loading>
  <p role="status">Loading account summary</p>
  <Progress aria-label="Uploading file" value={48} max={100} />
</>
```

