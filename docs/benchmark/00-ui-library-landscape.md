# UI Library Landscape

This benchmark compares Dravyn UI with common React UI libraries, CSS toolkits, headless primitives, registry-based component systems, and data-grid libraries.

Source baseline: public project documentation reviewed on 2026-07-09.

## Reference Sources

- MUI Material UI: https://mui.com/material-ui/getting-started/
- Ant Design: https://ant.design/docs/react/introduce/
- Chakra UI: https://chakra-ui.com/docs/
- Mantine: https://mantine.dev/getting-started/
- Bootstrap: https://getbootstrap.com/docs/5.3/getting-started/introduction/
- Tailwind Plus: https://tailwindcss.com/plus
- Radix UI Primitives: https://www.radix-ui.com/primitives/docs/overview/introduction
- React Aria: https://react-aria.adobe.com/
- Headless UI: https://headlessui.com/
- shadcn/ui: https://ui.shadcn.com/docs
- TanStack Table: https://tanstack.com/table/latest
- AG Grid: https://www.ag-grid.com/react-data-grid/
- MUI X Data Grid: https://mui.com/x/react-data-grid/

## Categories

| Category | Libraries | Primary purpose | Dravyn relationship |
| --- | --- | --- | --- |
| Full React UI libraries | MUI, Ant Design, Chakra UI, Mantine | Broad component coverage with theming and application primitives | Dravyn should learn coverage discipline, docs, accessibility patterns, and production defaults. |
| CSS/frontend toolkits | Bootstrap, Tailwind Plus | Styling systems, templates, utilities, prebuilt blocks | Dravyn should learn predictable layout and rapid app assembly, but avoid utility-first dependency lock-in. |
| Headless/accessibility primitives | Radix UI, React Aria, Headless UI | Behavior and accessibility primitives without full visual ownership | Dravyn should learn interaction quality, focus behavior, and ARIA rigor while keeping native-first implementation. |
| Copy-paste/component registry | shadcn/ui | Open component code distributed into the app | Dravyn should learn composability and transparent source, but remain a versioned package library. |
| Table/data-grid libraries | TanStack Table, AG Grid, MUI X Data Grid | Table engines or full enterprise data grids | Dravyn should learn controlled state, row models, and enterprise grid UX while keeping a smaller native-first scope. |

## Landscape Matrix

| Library/category | Primary purpose | Styling model | Dependency model | Theming model | Accessibility approach | Component coverage | Data-grid capability | Enterprise suitability | Customization model |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Dravyn UI | Enterprise UI foundation for internal tools, admin portals, customer portals, data-heavy apps, workflow systems | CSS variables, package CSS, native elements | Dependency-minimal Dravyn packages | Shared `--dv-*` tokens, grid `--udg-*` mappings, density tokens | Native controls first, explicit ARIA for overlays/grid, keyboard support by default | Growing component primitives plus specialized grid | Specialized enterprise grid owned by `@dravyn/ui-data-grid` | Strong target fit for dense business apps | Controlled/uncontrolled props, CSS variables, adapter contracts |
| MUI | Comprehensive React component library implementing Material Design | Styled component system and theme APIs | React library ecosystem with MUI packages | Central theme object, design tokens, component overrides | Mature accessibility work across components | Very broad | MUI X provides full data grid | Strong, especially when Material Design is acceptable | Theme overrides, slots, props, component composition |
| Ant Design | Enterprise-class React UI library | CSS-in-JS/token-driven Ant styles | React package with ecosystem add-ons | Design tokens, algorithms, ConfigProvider | Broad enterprise component patterns | Very broad | Table is strong; Pro ecosystem adds app patterns | Very strong for enterprise admin apps | Tokens, component props, Pro Components |
| Chakra UI | Accessible component library with style props | Runtime style props and recipe/system layer | React package with Ark/Panda ecosystem influence | Theme tokens and color palettes | Accessibility-focused component APIs | Broad application primitives | No specialized enterprise grid | Good for app UI, less grid-focused | Props, recipes, theme extension |
| Mantine | React component and hooks library | CSS modules/classes plus theme APIs | React package with many hooks/components | MantineProvider theme, CSS variables/classes | Good default accessibility for many components | Very broad | No specialized enterprise grid | Good for admin/product UI | Props, styles API, theme override |
| Bootstrap | Frontend toolkit for CSS, layout, utilities, JS plugins | Global CSS, Sass, CSS variables | CSS/JS toolkit, not React-specific | Sass variables, CSS variables, color modes | Accessibility guidance; implementation depends on markup | Broad generic web components | Basic responsive tables only | Good for fast conventional apps | Classes, Sass, variables |
| Tailwind Plus | Paid blocks/templates built with Tailwind CSS | Utility classes and Tailwind component examples | Tailwind CSS plus copied code/templates | Tailwind config/classes | Depends on chosen component implementation | Large block/template library | Examples, not a grid engine | Good for polished app shells and marketing/app UI | Copy/adapt blocks and utility classes |
| Radix UI | Low-level accessible primitives | Unstyled primitives | Many small primitive packages | Bring your own theme/styling | WAI-ARIA patterns, focus management, keyboard behavior | Focused primitives, not full app kit | No data grid | Strong design-system foundation | Compose primitive parts and style with any system |
| React Aria | Accessible components and hooks | Unstyled/high-control APIs | Adobe React Aria packages | Bring your own styling; React Spectrum exists separately | Deep cross-device and assistive tech focus | Broad interaction primitives | Table/list primitives, not finished enterprise grid | Strong for accessibility-heavy apps | Hooks, components, contexts |
| Headless UI | Unstyled accessible components for React/Vue | Unstyled, Tailwind-friendly | Headless package from Tailwind Labs | Bring your own Tailwind/classes | Accessible component behavior | Focused overlay/form/navigation primitives | No data grid | Useful for app primitives | Render props and composition |
| shadcn/ui | Component registry and code distribution model | Tailwind-based copied component code | Components copied into app, often Radix-based | CSS variables plus Tailwind conventions | Inherits Radix/implementation choices | Broad registry | Data table examples often use TanStack Table | Good for teams wanting owned code | Edit the component code directly |
| TanStack Table | Headless table engine | None; bring markup/styles | Headless engine package | None; app-owned | Depends on app markup, though patterns can be accessible | Table logic only | Very strong engine; no UI | Strong when teams want custom grid UI | Controlled state, row models, opt-in features |
| AG Grid | Full-featured React data grid | Grid themes and CSS | Dedicated grid packages; Community/Enterprise editions | Theme parameters/classes | Mature grid accessibility patterns | Data grid only | Extremely strong | Very strong for grid-heavy enterprise products | Grid options, modules, callbacks, themes |
| MUI X Data Grid | Batteries-included React data grid | MUI styled/themed UI | MUI X packages, paid tiers for advanced features | MUI theme integration | Styled accessible grid UI | Data grid only | Strong | Strong if already on MUI | Slots, theme overrides, API refs |

## Learn From / Differ From

| Library/category | Dravyn should learn | Dravyn should intentionally differ |
| --- | --- | --- |
| MUI | Documentation depth, prop consistency, theme override taxonomy, slot patterns | Do not inherit Material Design as the default visual language. Keep native-first CSS variable styling. |
| Ant Design | Enterprise density, table/admin workflows, design-token rigor, clear app patterns | Avoid large ecosystem coupling and heavy runtime assumptions. Keep Dravyn smaller and more application-owned. |
| Chakra UI | Accessible defaults, simple composition, ergonomic primitives | Avoid style-prop-first architecture if it adds runtime styling cost and fragments CSS ownership. |
| Mantine | Broad practical component coverage, hooks organization, examples | Avoid building too many niche components before core enterprise workflows are stable. |
| Bootstrap | Stable class conventions, layout utilities, low setup friction | Do not become global CSS toolkit first. Dravyn should remain React + TypeScript component-centered. |
| Tailwind Plus | High-quality app layouts and workflow blocks | Do not require Tailwind or utility-first authoring in consuming apps. |
| Radix UI | ARIA/focus/menu/dialog quality and part composition | Do not add Radix as a dependency by default; reproduce only the needed native-first behavior. |
| React Aria | Cross-device accessibility, keyboard models, internationalization seriousness | Do not make the base package too abstract or hook-heavy before app primitives are stable. |
| Headless UI | Simple headless overlay APIs and Tailwind-friendly patterns | Do not assume Tailwind or unstyled-only consumption. Dravyn ships usable enterprise styling. |
| shadcn/ui | Transparent code, registry thinking, component ownership clarity | Do not switch to copy-paste distribution as the primary model. Dravyn should stay versioned and upgradeable. |
| TanStack Table | Controlled state, row models, headless data transforms | Do not wrap TanStack or outsource grid architecture unless a future phase explicitly chooses it. |
| AG Grid | Enterprise grid feature taxonomy and performance expectations | Do not chase full spreadsheet/BI scope or Enterprise licensing model. |
| MUI X Data Grid | Good default grid UI, slots, grid docs | Do not tie grid design to MUI theming or large component stack. |
