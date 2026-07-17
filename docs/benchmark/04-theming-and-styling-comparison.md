# Theming And Styling Comparison

VyrnForge's styling position is CSS-variable-first, package CSS based, and native-first. It should support strong enterprise theming without requiring consuming apps to adopt a CSS framework or runtime styling system.

## Styling Models

| Library/category | Styling model | Theming model | VyrnForge lesson | VyrnForge difference |
| --- | --- | --- | --- | --- |
| VyrnForge UI | Package CSS, CSS variables, native class names | `--vf-*` shared tokens, `--udg-*` grid vars, light/dark/system/enterprise, density | Keep tokens readable and overrideable | This is the target model |
| MUI | Styled engine, system props, theme object | Central theme, component overrides, variants | Strong override taxonomy and slot customization | Avoid runtime styling dependency as the default |
| Ant Design | Token-driven component styles | ConfigProvider, design tokens, algorithms | Enterprise token completeness and component tokens | Avoid Ant visual identity and ecosystem lock-in |
| Chakra UI | Style props, recipes/system layer | Theme tokens and color palettes | Ergonomic token usage and accessible variants | Avoid making style props the main authoring model |
| Mantine | CSS modules/classes, CSS variables, theme provider | MantineProvider theme and styles API | Practical styles API and broad theme docs | Avoid broad component sprawl before enterprise essentials |
| Bootstrap | Global CSS classes, Sass, CSS variables | Sass variables, CSS vars, color modes | Stable class conventions and utility predictability | Avoid becoming a global CSS framework |
| Tailwind Plus | Tailwind utility classes and copied templates | Tailwind config and class conventions | High-quality app compositions | Do not require Tailwind or utility-first markup |
| Radix UI | Unstyled primitives | Bring any styling solution | Component part anatomy | VyrnForge ships styled defaults |
| React Aria | Unstyled components/hooks with flexible APIs | Bring styling; React Spectrum is separate | Accessibility can be styling-independent | VyrnForge should not expose only low-level hooks |
| Headless UI | Unstyled, Tailwind-friendly | Bring styling | Simple headless APIs | VyrnForge should not assume Tailwind |
| shadcn/ui | Copied Tailwind components, CSS variables | App-owned CSS variables and Tailwind config | Editable code and readable tokens | VyrnForge should remain package-upgradeable |
| TanStack Table | No styling | App-owned | Logic/UI separation | VyrnForge owns grid UI defaults |
| AG Grid | Grid themes and theme parameters | Grid theme system | Dedicated grid theming depth | VyrnForge grid theme should map to shared `vf-*` tokens |
| MUI X Data Grid | MUI themed/styled grid | MUI theme integration | Grid slot/theming consistency | VyrnForge should stay MUI-independent |

## VyrnForge Theme Layers

| Layer | Prefix | Owner | Purpose |
| --- | --- | --- | --- |
| Shared foundation | `--vf-*` | `@vyrnforge/ui-core` | App-wide colors, typography, spacing, radius, shadows, focus, density |
| Component styles | `vf-*` classes | `@vyrnforge/ui-components` | Reusable primitive visuals using shared tokens |
| Grid-specific variables | `--udg-*` | `@vyrnforge/ui-data-grid` | Grid layout, row/header sizing, grid-specific surfaces and states |
| Grid classes | `udg-*` classes | `@vyrnforge/ui-data-grid` | Grid-specific structure and interactions |

## Recommended Import Order

```tsx
import "@vyrnforge/ui-core/styles/index.css";
import "@vyrnforge/ui-components/styles/index.css";
import "@vyrnforge/ui-data-grid/styles/index.css";
```

The grid must still work when only grid CSS is imported, using fallback values. When `ui-core` CSS is present, grid variables should align to shared `--vf-*` tokens.

## Customization Strategy

| Need | Preferred VyrnForge approach |
| --- | --- |
| Brand color/radius/typography | Override scoped `--vf-*` tokens |
| App-wide density | Override density tokens or use component density APIs |
| Grid-only row/header sizing | Override scoped `--udg-*` variables |
| Per-instance grid theme | Use grid theme props/CSS variable style object |
| One-off layout adjustment | Use component props or scoped className |
| Deep behavior change | Controlled props, adapter contract, or app composition |

## Styling Rules

- Keep visual styling in CSS when static.
- Use TSX for structure, state classes, accessibility, and dynamic variables.
- Keep tokens stable and readable.
- Prefer semantic tokens over raw primitive use inside components.
- Preserve `--udg-*` backward compatibility.
- Do not require Tailwind, Sass, CSS-in-JS, styled-components, Emotion, MUI, or Ant to theme VyrnForge.
- Do not expose every internal CSS selector as API. Prefer documented tokens and component props.

## Gap Analysis

| Gap | Recommendation |
| --- | --- |
| Component-level theme docs | Add examples for scoped `--vf-*` overrides and density changes. |
| Grid variable catalog | Document stable `--udg-*` variables separately from internal classes. |
| Dark/enterprise QA | Keep visual regression checklist for components and grid together. |
| Slot customization | Add only where repeated product needs prove it, not as a blanket architecture. |
