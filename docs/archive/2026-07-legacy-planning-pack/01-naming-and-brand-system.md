> Archived: This document is historical and no longer canonical.
> Replacement: ../../governance/03-naming-and-terminology.md

# 01 — Naming and Dragon-Themed Brand System

## Chosen project name

**VyrnForge UI**

## Why VyrnForge

VyrnForge is forge-inspired and more suitable for enterprise software than names like DragonGrid or DragonUI.

It has a strong technical feel without becoming overly fantasy-themed.

## Naming rules

Use the dragon theme subtly.

Prefer names that feel:

* strong
* concise
* technical
* professional
* reusable

Avoid names that feel:

* game-like
* childish
* too literal
* hard to spell
* too long

## Repository name

```txt
vyrnforge-ui
```

## Package namespace

```txt
@dravyn
```

## Package names

```txt
@dravyn/ui-core
@dravyn/ui-components
@dravyn/ui-data-grid
```

Optional future packages:

```txt
@dravyn/ui-icons
@dravyn/ui-charts
@dravyn/ui-workflows
@dravyn/ui-reporting
```

## Component naming

Component names should remain straightforward and not overly themed.

Use:

```txt
UniversalDataGrid
Button
IconButton
Typography
TextInput
Popover
Menu
Drawer
EmptyState
StatusBadge
```

Avoid:

```txt
DragonButton
WyrmTable
FlameInput
ScalePanel
```

The brand can be dragon-inspired, but component names should stay clear for engineers.

## Theme preset naming

Theme names may use subtle dragon-inspired terms.

Recommended built-in themes:

```txt
light
 dark
 system
 enterprise
```

Optional named presets:

```txt
ember-light       warm professional light theme
obsidian-dark     calm dark slate theme
forge-enterprise  corporate enterprise theme
high-contrast     accessibility-focused high contrast theme
```

## CSS theme attributes

Recommended usage:

```tsx
<UniversalDataGrid theme="light" />
<UniversalDataGrid theme="dark" />
<UniversalDataGrid theme="enterprise" />
<UniversalDataGrid theme="obsidian-dark" />
```

Custom project theme example:

```css
.my-app .udg[data-theme="bank-jatim"] {
  --udg-primary: #003b71;
  --udg-primary-soft: #e7f0f8;
  --udg-radius-md: 10px;
}
```

## Visual metaphor

Dragon theming should influence the brand language, not the UI shape.

Use dragon-inspired concepts for internal naming only when helpful:

```txt
Core = foundation
Forge = theme/system builder
Scale = density/surface pattern
Ember = warm highlight
Obsidian = dark theme
```

Do not turn enterprise applications into fantasy dashboards.

## Alternative names considered

If VyrnForge UI is not preferred, acceptable alternatives are:

```txt
Draken UI
Wyvern UI
Dracore UI
ScaleForge UI
EmberCore UI
```

Recommended final choice remains:

```txt
VyrnForge UI
```
