# CSS Token Reference

VyrnForge UI uses CSS variables as the public styling contract.

Use shared `--vf-*` tokens for app-wide theme customization. Use grid-specific `--udg-*` variables only for data-grid overrides.

Package CSS may be split internally, but token ownership does not change: `@vyrnforge/ui-core` owns shared `--vf-*` tokens and `@vyrnforge/ui-data-grid` owns grid-specific `--udg-*` variables.

## Shared dv Tokens

| Token | Purpose |
| --- | --- |
| `--vf-bg` | App/page background. |
| `--vf-surface` | Default component surface. |
| `--vf-surface-subtle` | Subtle surface or low-emphasis background. |
| `--vf-surface-raised` | Raised surface. |
| `--vf-text` | Default text. |
| `--vf-text-muted` | Secondary text. |
| `--vf-text-strong` | Strong/high-emphasis text. |
| `--vf-border` | Default border. |
| `--vf-border-strong` | Stronger border. |
| `--vf-primary` | Primary brand/action color. |
| `--vf-primary-hover` | Primary hover color. |
| `--vf-primary-soft` | Soft primary background. |
| `--vf-danger` | Danger status color. |
| `--vf-danger-soft` | Soft danger background. |
| `--vf-warning` | Warning status color. |
| `--vf-warning-soft` | Soft warning background. |
| `--vf-success` | Success status color. |
| `--vf-success-soft` | Soft success background. |
| `--vf-info` | Info status color. |
| `--vf-info-soft` | Soft info background. |
| `--vf-focus-ring` | Focus outline/ring color. |
| `--vf-radius-sm` | Small radius. |
| `--vf-radius-md` | Medium radius. |
| `--vf-radius-lg` | Large radius. |
| `--vf-shadow-sm` | Small shadow. |
| `--vf-shadow-md` | Medium shadow. |
| `--vf-font-family` | Default font stack. |
| `--vf-control-height` | Standard control height by density. |
| `--vf-row-height` | Standard row height by density. |

## Grid udg Tokens

`--udg-*` variables are grid-specific. They should be overridden only for grid layout and visual behavior.

Stable public grid variables include:

| Token | Purpose |
| --- | --- |
| `--udg-bg` | Grid background. |
| `--udg-surface` | Grid surface. |
| `--udg-header-bg` | Header background. |
| `--udg-row-bg` | Row background. |
| `--udg-row-hover-bg` | Row hover background. |
| `--udg-row-selected-bg` | Selected row background. |
| `--udg-text` | Grid text. |
| `--udg-text-muted` | Muted grid text. |
| `--udg-border` | Grid border. |
| `--udg-primary` | Grid primary color. |
| `--udg-focus-ring` | Grid focus ring. |
| `--udg-radius` | Grid radius. |
| `--udg-row-height` | Grid row height. |
| `--udg-header-height` | Grid header height. |
| `--udg-control-height` | Grid toolbar/control height. |

Grid variables should fallback to `--vf-*` tokens where practical so shared themes affect the grid.

## App-Wide Override

```css
.my-app {
  --vf-primary: #003b71;
  --vf-radius-md: 10px;
}
```

## Grid-Specific Override

```css
.my-app .udg {
  --udg-row-height: 42px;
  --udg-header-bg: #f8fafc;
}
```

## Rules

- Prefer semantic `--vf-*` tokens over hard-coded colors.
- Use `--udg-*` only for grid-specific behavior or visuals.
- Keep overrides scoped to the app or feature area.
- Do not edit package CSS directly.
