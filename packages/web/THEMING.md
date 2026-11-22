# VyrnForge theme authoring

VyrnForge uses **one shared Web CSS token and theme contract**. The optional
`@vyrnforge/web/theme` entrypoint composes named palette scales and existing
semantic color roles into CSS. It does not implement theme registration,
state management, automatic CSS injection, React context or a mandatory provider.

## Define a palette-backed theme

```ts
import { createTheme, renderThemeCss } from '@vyrnforge/web/theme';

const oceanLight = createTheme({
  name: 'ocean-light',
  appearance: 'light',
  palette: {
    ocean: {
      50: '#ecfeff', 100: '#cffafe', 200: '#a5f3fc',
      600: '#0891b2', 700: '#0e7490', 800: '#155e75',
    },
  },
  colors: {
    'accent-background': '{ocean.600}',
    'accent-background-hover': '{ocean.700}',
    'accent-background-pressed': '{ocean.800}',
    'accent-foreground': '#ffffff',
    'accent-subtle': '{ocean.50}',
    'accent-subtle-hover': '{ocean.100}',
  },
  tokens: { '--vf-radius-surface': '0.75rem' },
});

const css = renderThemeCss(oceanLight);
// Write css to a static application stylesheet during your build.
```

Load `@vyrnforge/web/styles.css` before that generated stylesheet, then
select the theme with a DOM scope:

```html
<section data-vf-theme="ocean-light">
  <!-- Any Web, React, Vue, Angular or Elements consumer -->
</section>
```

The generated stylesheet uses `[data-vf-theme]` within the existing
`vyrnforge.themes` cascade layer. It is SSR-safe and portable; the
application owns delivering the resulting CSS and persisting user preferences.

## Extend without copying an entire theme

```ts
const rounded = createTheme({
  name: 'ocean-rounded',
  base: oceanLight,
  tokens: { '--vf-control-radius': '0.75rem' },
});

const stylesheet = [oceanLight, rounded].map(renderThemeCss).join('\n');
```

`base` inherits resolved semantic values, authoring palette families, and
public token overrides, without mutating the parent. A derived theme must
use the same light/dark appearance as its base. Define separate light and
dark themes when each needs distinct accent and contrast relationships.

## Contract and boundaries

- `palette` holds authoring-only raw shades, e.g. `ocean.600`. The `{ocean.600}`
  reference resolves at authoring time; numeric shades are not public runtime
  CSS variables or mandatory component palette names.
- `colors` accepts the generated union of currently documented semantic
  Web roles (e.g. `accent-background`, `surface`, `text-muted`, `focus-ring`).
- `tokens` accepts only currently documented public runtime `--vf-*` tokens,
  including spacing, typography, shadow, control size, radius and motion.
- Unspecified semantic colors are filled from the complete built-in appearance
  baseline. Nested custom themes therefore do not accidentally inherit the
  surrounding region's light/dark colors.
- The input is validated for theme names, token names, palette references and
  unsafe declaration characters; invalid CSS declarations are rejected.
- `renderThemeCss` is a pure function. It neither injects style tags nor
  applies the theme. CSS is still the runtime theme authority.

Theme creation **does not establish contrast compliance**. Verify foreground
and background contrast, hover/pressed/disabled states, focus rings,
forced colors and component compositions in both appearances. A raw shade
does not imply accessible foreground or interactive state colors.

RTL direction, localization, reduced motion and density remain independent
from theme identities, following the existing VyrnForge foundation contracts.
