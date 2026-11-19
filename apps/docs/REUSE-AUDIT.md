# Reference app — reusable UI adoption inventory

Status: source-inspected implementation inventory; **not** cross-page visual acceptance or library product approval.
Checkpoint: `main@c220009670b08d43b0f4ac1f6346cb1ba32678ea` (18 November 2026).
Scope: Native Web Reference renderer `apps/docs/`; product evidence is the actual public package and Product Graph, not merely the presence of a CSS file.

## Existing library-owned UI already consumed

| App region | Library surface in use | App-owned responsibility |
| --- | --- | --- |
| Page shell/header/nav/main/footer | Public `@vyrnforge/web` AppShell hooks | Docs page content, per-page routing, responsive Menu focus coordination |
| Main navigation | Public SideNav CSS hooks and semantics | Documentation taxonomy, route/current-page mapping |
| Header Menu and example Copy buttons | Public Button hooks | Toggle/copy action behavior and feedback |
| Search field | Public Input CSS | Content indexing, filtering, result routes, dismiss behavior |
| Theme chooser | Public Native Select CSS | Theme persistence and system-mode detection |
| Links, navigation, status references | Public Link styling | Actual destinations, in-page anchors, evidence references |
| Shared visual foundation | Public VyrnForge design tokens and themes | Docs-specific reading measure, page composition |

## Phase A1 — Existing library primitives now applied (this candidate)

- Load public `@vyrnforge/web/styles/text.css`, `styles/code.css`, and `styles/layout.css` on **every** Native Web page family through `tooling/docs/native-documentation.mjs`, not a duplicate local stylesheet.
- Adopt Text `overline` for eyebrows/example labels and `body-lg` for page introductions across page renderers; retain semantic native `p` and `div` containers.
- Render authored inline code via `data-vf-code`, and docs source/setup blocks through `pre[data-vf-code-block]`; keep meaningful `code` children, focusable overflow, and copy/source behavior.
- Apply public **Cluster, AutoGrid, Stack and Inline** layout hooks to page metadata/action groups, breadcrumbs, linked catalog cards, component group lists, preview regions and example lists. Keep the bespoke two-column reading/TOC grid and AppShell C1/C2 geometry where no public composition primitive expresses those constraints.
- Remove duplicated application-global code, overline typography and generic flex/grid composition; keep only genuinely docs-specific density, focus styling and reading layout.

## Phase A2 — SearchField adoption and Disclosure contract decision (19 November 2026)

**Source comparison:** `product/components/composite-widgets/compound-fields/search-field/accessibility.json` and public React `SearchFieldRoot/Input/Clear`; `search-field.css` and `compound-fields.css`; `product/components/composite-widgets/disclosure-view-switching/disclosure/accessibility.json` and public React `DisclosureRoot/Trigger/Panel`; current `apps/docs/build.mjs` and `client.js`.

- **SearchField is adopted for the docs header query:** one native `<search>` landmark with the public `data-vf-search-field-root` hook, native input carrying `data-vf-search-field-input` and existing Input styling, and native clear button carrying `data-vf-search-field-clear` with a localized/visible accessible name. The docs uses the public `styles/search-field.css` export, not a new CSS widget. App behavior keeps the clear disabled until a query exists, updates results, and restores input focus after accepted clear; it respects disabled/read-only state and preserves Escape-to-close. A polite result-count status provides a basic search-results announcement. *No APG combobox role, fake autocomplete keyboard navigation, or library-owned query index is introduced.*
- **Disclosure is reviewed but not forced onto native `details/summary`:** public Disclosure is a button trigger with `aria-expanded`/`aria-controls`, an independently hidden panel and managed open state. Product metadata explicitly permits native `details/summary` when sufficient and records `review-required` for custom disclosure. The docs' WCAG evidence and source block disclosures already use semantic native details with no JavaScript required. Retaining native behavior is the deliberate compatible choice; adding `data-vf-disclosure-trigger` to `summary` would misrepresent the public contract, and replacing native details with scripted button/panel would add an avoidable dependency. Reconsider only if a reusable native-details styling variant is independently defined and tested.
- **Search results stay documentation-owned:** content indexing, result cap, empty state, result links, close-on-pointer/Escape and route selection are app-level concerns. The `SearchField` library owns no results list, autocomplete policy, framework selector, or URL routing.
- **Mobile TOC (#1405) remains a separate design decision:** its 8rem/20vh nested-scroll proposal is based on `main@34961b4`, is marked draft/unmerged, and does not include later accessibility-header/layout changes. Keep its keyboard and 400%-reflow evidence as a baseline; reconcile with latest docs page-family layout and obtain product visual sign-off before implementing or merging a TOC behavior change.

**Validation for this candidate:** Playwright verifies the common SearchField public entrypoint across generated page families; native searchbox and clear semantics, status/empty results, clear keyboard activation and focus restoration; no arbitrary `aria-expanded`/combobox; 320px/400% responsive reflow; no-JavaScript input fallback; and existing docs keyboard, axe, forced-colors and route tests. Exact-head CI and visual/AT acceptance remain distinct.

## Existing public foundations needing bounded review (not missing components)

| Candidate | Existing library truth | Decision/test needed |
| --- | --- | --- |
| Specialized reading/TOC grid | Public Layout now adopted for generic Stack/Cluster/AutoGrid/Inline | Named two-column article + TOC grid and AppShell C1/C2 geometry remain docs-specific; never force generic AutoGrid onto a deliberate track layout |
| SearchField | Public `styles/search-field.css` with native search/input/clear hooks adopted in Phase A2 | Results/index and routing remain app-owned; confirm full browser/AT evidence before accepting |
| Disclosure | Public button/controlled-panel contract inspected | Native `details/summary` retained deliberately; not a missing library component or an interchangeable public Disclosure use |
| Icon | Public Icon component/styles | No new icon needed merely to replace ornamental glyphs |
| Toast/Popover | Public component CSS and framework ports | Clipboard status and search-results region may remain simpler native/docs composition |

## Named reusable gaps / proposed product review, **not** automatic work approval

- **Breadcrumbs:** semantic docs breadcrumb nav is currently composed using Link; no named `Breadcrumbs` public product unit in the inspected Product Graph taxonomy. Consider a reusable framework-neutral navigation contract only if other consuming applications need it.
- **Card/Surface:** documentation catalog link-cards use links and docs CSS. No general `Card`/`Surface` unit is in the inspected catalog; `PreviewCard` is not automatically a general Card substitute.
- **Badge/StatusLabel:** docs metadata chips use spans and tokens. No named general `Badge` unit in the inspected catalog; `TagGroup` is not necessarily a semantic status-label primitive.
- **Table of contents:** documentation heading-anchor navigation has no named `TableOfContents` unit. This is plausibly docs-owned composition over semantic links/SideNav; do not create a library component solely to remove docs CSS.
- **Live example/source viewer:** docs-specific preview, verified source, and Copy HTML composition has no dedicated product unit. Reuse Code, Button, native disclosure, and optionally other existing primitives before proposing anything broader.

## Keep within the consuming application

Search indexing/query/routing, version/framework context selection, source-copy orchestration, documentation accessibility content models, page metadata, example-specific form feedback, theme preference persistence, and local TOC anchor generation. These are **not** evidence of missing reusable UI components.

## Page-family gate and follow-on work

Covered by shared Native layout: landing, component/pattern catalogs, styling/token foundations, component/pattern guides, and individual component/pattern API reference. This candidate focuses on **existing public Text/Code adoption** across those families. It does not imply all pages have complete authored examples or that React/Angular/Vue/Elements documentation renderers exist.

Next: inspect Layout, SearchField and Disclosure semantics and visual fit as separate bounded work; reconcile draft #1405 mobile TOC and #1407 React-docs preflight; decide potential Breadcrumbs/Card/Badge contracts with Architecture and Product Analysis before coding. Check responsive 320/375/768, 200%/400%, RTL, forced colors, keyboard, axe, no-JS, public package/artifact, and independent visual acceptance. Protected production deployment remains controlled by #774.

Sources: `apps/docs/build.mjs`, `apps/docs/client.js`, `apps/docs/native.css`, `tooling/docs/native-documentation.mjs`, `packages/web/package.json`, `documentation/site/component-taxonomy.json`, component Web styles, canonical VyrnForge Documentation Product Architecture and Foundation Charter.
