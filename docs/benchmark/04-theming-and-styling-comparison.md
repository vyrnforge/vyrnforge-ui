# Theming And Styling Comparison

Dravyn's styling position is CSS-variable-first, package CSS based, and native-first. It should support strong enterprise theming without requiring consuming apps to adopt a CSS framework or runtime styling system.

## Styling Models

| Library/category | Styling model | Theming model | Dravyn lesson | Dravyn difference |
| --- | --- | --- | --- | --- |
| Dravyn UI | Package CSS, CSS variables, native class names | `--dv-*` shared tokens, `--udg-*` grid vars, light/dark/system/enterprise, density | Keep tokens readable and overrideable | This is the target model |
| MUI | Styled engine, system props, theme object | Central theme, component overrides, variants | Strong override taxonomy and slot customization | Avoid runtime styling dependency as the default |
| Ant Design | Token-driven component styles | ConfigProvider, design tokens, algorithms | Enterprise token completeness and component tokens | Avoid Ant visual identity and ecosystem lock-in |
| Chakra UI | Style props, recipes/system layer | Theme tokens and color palettes | Ergonomic token usage and accessible variants | Avoid making style props the main authoring model |
| Mantine | CSS modules/classes, CSS variables, theme provider | MantineProvider theme and styles API | Practical styles API and broad theme docs | Avoid broad component sprawl before enterprise essentials |
| Bootstrap | Global CSS classes, Sass, CSS variables | Sass variables, CSS vars, color modes | Stable class conventions and utility predictability | Avoid becoming a global CSS framework |
| Tailwind Plus | Tailwind utility classes and copied templates | Tailwind config and class conventions | High-quality app compositions | Do not require Tailwind or utility-first markup |
| Radix UI | Unstyled primitives | Bring any styling solution | Component part anatomy | Dravyn ships styled defaults |
| React Aria | Unstyled components/hooks with flexible APIs | Bring styling; React Spectrum is separate | Accessibility can be styling-independent | Dravyn should not expose only low-level hooks |
| Headless UI | Unstyled, Tailwind-friendly | Bring styling | Simple headless APIs | Dravyn should not assume Tailwind |
| shadcn/ui | Copied Tailwind components, CSS variables | App-owned CSS variables and Tailwind config | Editable code and readable tokens | Dravyn should remain package-upgradeable |
| TanStack Table | No styling | App-owned | Logic/UI separation | Dravyn owns grid UI defaults |
| AG Grid | Grid themes and theme parameters | Grid theme system | Dedicated grid theming depth | Dravyn grid theme should map to shared `dv-*` tokens |
| MUI X Data Grid | MUI themed/styled grid | MUI theme integration | Grid slot/theming consistency | Dravyn should stay MUI-independent |

## Dravyn Theme Layers

| Layer | Prefix | Owner | Purpose |
| --- | --- | --- | --- |
| Shared foundation | `--dv-*` | `@dravyn/ui-core` | App-wide colors, typography, spacing, radius, shadows, focus, density |
| Component styles | `dv-*` classes | `@dravyn/ui-components` | Reusable primitive visuals using shared tokens |
| Grid-specific variables | `--udg-*` | `@dravyn/ui-data-grid` | Grid layout, row/header sizing, grid-specific surfaces and states |
| Grid classes | `udg-*` classes | `@dravyn/ui-data-grid` | Grid-specific structure and interactions |

## Recommended Import Order

```tsx
import "@dravyn/ui-core/styles/index.css";
import "@dravyn/ui-components/styles/index.css";
import "@dravyn/ui-data-grid/styles/index.css";
```

The grid must still work when only grid CSS is imported, using fallback values. When `ui-core` CSS is present, grid variables should align to shared `--dv-*` tokens.

## Customization Strategy

| Need | Preferred Dravyn approach |
| --- | --- |
| Brand color/radius/typography | Override scoped `--dv-*` tokens |
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
- Do not require Tailwind, Sass, CSS-in-JS, styled-components, Emotion, MUI, or Ant to theme Dravyn.
- Do not expose every internal CSS selector as API. Prefer documented tokens and component props.

## Gap Analysis

| Gap | Recommendation |
| --- | --- |
| Component-level theme docs | Add examples for scoped `--dv-*` overrides and density changes. |
| Grid variable catalog | Document stable `--udg-*` variables separately from internal classes. |
| Dark/enterprise QA | Keep visual regression checklist for components and grid together. |
| Slot customization | Add only where repeated product needs prove it, not as a blanket architecture. |
