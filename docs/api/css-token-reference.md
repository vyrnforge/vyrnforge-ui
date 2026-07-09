# CSS Token Reference

Dravyn UI uses CSS variables as the public styling contract.

Use shared `--dv-*` tokens for app-wide theme customization. Use grid-specific `--udg-*` variables only for data-grid overrides.

## Shared dv Tokens

| Token | Purpose |
| --- | --- |
| `--dv-bg` | App/page background. |
| `--dv-surface` | Default component surface. |
| `--dv-surface-subtle` | Subtle surface or low-emphasis background. |
| `--dv-surface-raised` | Raised surface. |
| `--dv-text` | Default text. |
| `--dv-text-muted` | Secondary text. |
| `--dv-text-strong` | Strong/high-emphasis text. |
| `--dv-border` | Default border. |
| `--dv-border-strong` | Stronger border. |
| `--dv-primary` | Primary brand/action color. |
| `--dv-primary-hover` | Primary hover color. |
| `--dv-primary-soft` | Soft primary background. |
| `--dv-danger` | Danger status color. |
| `--dv-danger-soft` | Soft danger background. |
| `--dv-warning` | Warning status color. |
| `--dv-warning-soft` | Soft warning background. |
| `--dv-success` | Success status color. |
| `--dv-success-soft` | Soft success background. |
| `--dv-info` | Info status color. |
| `--dv-info-soft` | Soft info background. |
| `--dv-focus-ring` | Focus outline/ring color. |
| `--dv-radius-sm` | Small radius. |
| `--dv-radius-md` | Medium radius. |
| `--dv-radius-lg` | Large radius. |
| `--dv-shadow-sm` | Small shadow. |
| `--dv-shadow-md` | Medium shadow. |
| `--dv-font-family` | Default font stack. |
| `--dv-control-height` | Standard control height by density. |
| `--dv-row-height` | Standard row height by density. |

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

Grid variables should fallback to `--dv-*` tokens where practical so shared themes affect the grid.

## App-Wide Override

```css
.my-app {
  --dv-primary: #003b71;
  --dv-radius-md: 10px;
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

- Prefer semantic `--dv-*` tokens over hard-coded colors.
- Use `--udg-*` only for grid-specific behavior or visuals.
- Keep overrides scoped to the app or feature area.
- Do not edit package CSS directly.
