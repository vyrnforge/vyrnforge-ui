# React semantic colors, design tokens and themes

VyrnForge **does not have a separate React palette or theme runtime**. The canonical color and design tokens are CSS custom properties from `@vyrnforge/web/styles/tokens.css`. React provides short typed aliases and an optional native DOM scope.

## Zero-configuration semantic colors

```tsx
import { Text, SvgIcon, Flow, colors, tokens } from '@vyrnforge/react';

<Text as="p" tone="primary">Accent/primary emphasis</Text>
<Text as="p" tone="secondary">Secondary text</Text>
<Text as="p" tone="danger">Destructive information</Text>

<SvgIcon tone="accent" label="Favorite">
  <path d="M12 2 15 9 22 12 15 15 12 22 9 15 2 12 9 9Z" fill="currentColor" />
</SvgIcon>

// For ordinary React style values:
<Flow style={{ color: colors.danger, padding: tokens.space.md }}>Important</Flow>
```

`tone` uses the canonical token values through CSS `var()`, so the exact same components follow light, dark, system, and custom theme scopes. The existing Button `variant="primary" | "secondary" | "ghost"` is a control treatment, **not the same thing as text tone**.

`primary` is an ergonomic alias of the existing `accent` role, and `secondary` is an alias of existing `muted` text. Neither introduces a second token. `danger` uses the public danger-border color as an emphasis/foreground color. Do not assume it is sufficient for a destructive filled Button: that requires independently validated state, hover, foreground and contrast contracts.

The `tokens` object forwards references for color, spacing, font-size, radius and shadow roles; values are CSS references, not snapshots of resolved theme values.

## Built-in themes and nested scopes

```tsx
import { ThemeScope, Text } from '@vyrnforge/react';

<ThemeScope theme="light">
  <Text as="p" tone="primary">Light scope</Text>
  <ThemeScope as="section" theme="dark">
    <Text as="p" tone="primary">Dark nested scope</Text>
  </ThemeScope>
</ThemeScope>
```

`theme="system"` opts into `prefers-color-scheme`. A `ThemeScope` without an explicit theme inherits its surrounding theme. It renders an ordinary semantic DOM host with `data-vf-theme`; it does **not** set up React Context, read the system theme from JavaScript, or install styles.

## Quick, local custom colors

```tsx
<ThemeScope theme="dark" colors={{
  primary: '#9ec4ff',
  onAccent: '#0b1f4d',
  danger: '#ff8a8a',
}}>
  <Text as="p" tone="primary">Brand primary</Text>
  <Text as="p" tone="danger">Brand danger</Text>
</ThemeScope>
```

Only override roles you need. Pair accent backgrounds with `onAccent` and check readable color contrast. `colors` uses **public semantic CSS properties** and applies to descendants via normal inheritance. Passing a normal React `style` prop may explicitly override the same CSS property.

## Durable custom themes for both appearances

Theme definitions belong in **application CSS** and reference public token names:

```css
/* Your app stylesheet, after VyrnForge layers. No registration API. */
[data-vf-theme="acme-light"] {
  color-scheme: light;
  --vf-color-accent-background: #1758c0;
  --vf-color-accent-foreground: #ffffff;
  --vf-color-danger-border: #b42318;
}

[data-vf-theme="acme-dark"] {
  color-scheme: dark;
  --vf-color-accent-background: #a6c8ff;
  --vf-color-accent-foreground: #10284f;
  --vf-color-danger-border: #ff908e;
}
```

```tsx
<ThemeScope theme="acme-light">...</ThemeScope>
<ThemeScope theme="acme-dark">...</ThemeScope>
```

For organization-wide brands, put the theme attributes at app or document scope rather than wrapping every component. For a theme that follows OS preferences, define appropriate `prefers-color-scheme` CSS rules in the consuming app. Custom theme names do not automatically set `color-scheme`: declare the correct one in your stylesheet.

VyrnForge's root React browser export delivers canonical Web styling through supported CSS-aware bundlers. When using an SSR import or a build that does not extract component styles, supply the public Web CSS yourself before hydration:

```ts
import '@vyrnforge/web/styles.css';
```

Avoid runtime hardcoded light/dark hex maps in React and avoid private `--_vf-*` variables. Custom brand colors need their own light/dark contrast, focus, state and forced-colors review; a typed prop cannot guarantee those decisions.
