# Reference app — reusable UI adoption inventory

## Current layout-recipe migration — decision #1418

This original 18 November source-inspection inventory predates the approved 19 November layout simplification. Its historical Stack/Inline/Cluster wording is **not** the active target. The current layout public contract is canonical `@vyrnforge/web/styles/layout.css` with `data-vf-flow` (configurable block/inline/wrap) and `data-vf-auto-grid` (intrinsic equal tracks), on semantic native hosts. React/Vue layout wrappers, Angular layout directives, Container and ControlGroup are removed as overlapping APIs. See [#1418](https://github.com/vyrnforge/vyrnforge-ui/issues/1418) and the [canonical Composition Contract](https://docs.google.com/document/d/1z5wOQFQ4aPD1pCTU48wGgUp8njpSo7Y_a40WKYrpP_o/edit). Current implementation remains subject to exact-head CI, independent QA and visual review.


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

## DOC-04 — React reference pilot source/reuse review (19 November 2026)

The first genuine React documentation application is built from the existing Product Graph framework-neutral model and public React port. Candidate [#1414](https://github.com/vyrnforge/vyrnforge-ui/pull/1414) exposes React overview, Button guide and Button API routes only, with SSR and hydration; product-owned shared Button guidance, React adaptation, shared accessibility standards projection and the actual checked-in TSX example remain the content source. No parallel component inventory is created. The React app consumes the public React `AppShell`, `SideNav`, `Button`, `SearchField` and `NativeSelect` rather than maintaining surrogate port component implementations. Both renderers load public Web CSS via the same export resolver.

Documentation-specific search index/results, React hydration entrypoint, local theme persistence, responsive Menu coordination, route mapping and sandboxed example framing remain app-owned. The framework-neutral compiler has no React runtime dependency. A React pilot is not a complete React Reference catalog or proof of production SSR, all-framework parity or assistive-technology sign-off. The selected React guide/API coverage is narrower than all current Native component page families; #1403/#1401/#774 acceptance remains open.

The stale #1405 mobile TOC was closed unmerged and replaced by latest-main draft #1413 with green CI, still awaiting actual-size UX/AT visual approval. The merged React Button preflight #1407 is integrated source history, not an open candidate.

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

## DOC-CSS — React documentation styling ownership (23 November 2026)

**Source audit at `main@986d0544dd1c7e2dac495c32314445bc375926ac`.** The documentation application copies `apps/docs/native.css` to `dist/docs/assets/docs.css` and loads it into both Native Web and React **documentation shell pages**. This is intentional and application-owned (article reading measures, search/results, TOC layout, responsive docs chrome, icon studio). `docs.css` is **not** a public `@vyrnforge/react` or `@vyrnforge/web` package entrypoint. Standalone React example iframe documents are separate pages: they load public `@vyrnforge/web` CSS and their extracted product-owned example styles, **not** docs chrome CSS.

**Boundary repair:** Docs had duplicated canonical SearchField clear-button appearance (including disabled and focus styling). Move these reusable states to the product-owned `search-field/web/search-field.css`, remove the duplicated docs selectors, and let Native/React documentation consume the same public style. Keep only app-owned layout/search-result styling in docs CSS. React Icon Explorer tile customization is deliberately app-specific and now selects its own `data-vf-docs-icon-card` hook rather than a generic public `[data-vf-button]` selector. Reading-only Code sizing is scoped to the docs article.

**Guard:** React documentation build rejects any example HTML containing `docs.css`; its example asset verification no longer treats docs chrome CSS as a prerequisite. Documentation browser tests verify shell versus standalone example stylesheet links, and React browser-bundle tests assert no `apps/docs` CSS or `.vf-docs-` presentation rules enter public React consumer bundles. SearchField browser tests check focus and disabled styling in the isolated React fixture without docs CSS.

**Limit:** This is a bounded ownership correction, not a complete removal of docs-app CSS or a claim that every docs-specific preview/studio style has been generalized. App-owned layout rules remain justified. Visual parity and exact-head CI are acceptance gates, not implied by source inspection. No framework-specific component CSS system is being introduced.
