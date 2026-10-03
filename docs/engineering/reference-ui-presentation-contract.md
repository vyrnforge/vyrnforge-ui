# VyrnForge Reference UI presentation contract

Status: frozen implementation contract for #763 / parent #762.

This contract governs the reader-facing presentation layer in `apps/docs`. It does not replace the generated Documentation Registry, Reference model, framework/version resolver, canonical component contracts, package/token/pattern metadata, executable-example metadata, release metadata, or availability/readiness evidence.

## Current-state inventory

| Public page type | Current host/render path | Current presentation | Retain | Replace |
| --- | --- | --- | --- | --- |
| Overview and guide | `DocsShell -> GuideShell -> DocsPage -> GuidePage` | Separate guide-only product header, navigation, hero and prose system | Generated route/context resolution; `GuidePage` source-driven content patterns worth generalizing | `GuideShell` as a top-level product; guide-only header/nav/context chrome |
| Markdown/prose, foundation, release | `DocsShell -> AppShell/DocsNav -> DocsPage -> DocumentationPageTemplate -> MarkdownView` | Legacy page intro plus bordered Markdown surface | `MarkdownView` parsing/source ownership until replaced deliberately; canonical source paths | `.vf-docs-page__intro` framing and bordered `.vf-docs-markdown` container |
| Component catalog/detail | `DocsPage -> ComponentReferencePage` | `.vf-docs-reference` sections plus Card-heavy detail grids; generated framework API | Generated component/reference facts, member anchors, framework/version binding, related-pattern links | Generic reference Card stack; page-local framing that duplicates shell/layout responsibility |
| Package catalog/detail | `DocsPage -> PackageReferencePage` | Card grid/detail presentation | Generated package records, entrypoints, dependency rules, stable record routes | Generic package Card dashboard treatment |
| Token/pattern discovery/detail | `DocsPage -> DiscoveryReferencePage` | Mixed discovery rows and Cards | Canonical token/pattern metadata and record routes | Generic Card grids and page framing |
| Executable examples | `DocsPage -> ExecutableExamplesPage` | Reference layout wrapping Cards and code blocks | Generated executable-example registry, selected framework/version resolution, evidence | Generic reference Cards; legacy preview/code visual framing |
| Migrated examples / patterns / grid examples | `DocsPage -> MigratedExamplePage` | `vf-docs-example-stage` plus legacy/reference wrappers and retained `vf-playground-*` authored example styles | Example implementation modules and VyrnForge component usage inside examples | Standalone-Playground-era product presentation classes; legacy docs preview chrome |
| Data Grid / advanced module | Registry-driven markdown and example routes in the same `DocsPage` switch | Legacy docs shell/layout; grid examples reuse migrated example wrapper | Canonical grid metadata, package source, generated availability truth | Any grid-specific docs shell; wide-content handling moves into shared Reference layouts |
| Unavailable/empty/error/deep-link states | Primarily `DocsPage` fallback inside `DocumentationPageTemplate`; nav zero-result paragraph | Generic text inside legacy page framing | Resolver status/alternatives and canonical deep-link semantics | Raw/generic fallback presentation; silent or visually ambiguous state handling |

### Shell/chrome split to remove

`DocsShell.tsx` currently branches on `activeRoute.template === "guide"`. Guide routes render through `GuideShell`; all other routes render through `AppShell + TopNav + DocsNav`. This split is the primary presentation seam to eliminate.

`DocsNav.tsx` already derives sections and search/member results from `publicDocsSections`, `docsRoutes`, and `documentationSearchRecords`. That generated-data dependency is canonical and must be preserved while its visual/interaction treatment moves into the unified shell.

### Existing VyrnForge primitives already suitable for reuse

The docs app already consumes VyrnForge `AppShell`, `TopNav`, `SideNav`, `SearchInput`, `Select`, `Button`, `PageHeader`, `Heading`, `Text`, `Badge`, `CodeText`, `Inline`, and `Stack`. The component library also exposes shared navigation, feedback/state, typography, overlay, page, panel, breadcrumbs, and property-table primitives.

No new generic docs-only component is authorized merely to replace one of those primitives. New code in `apps/docs` may own Reference-specific composition and layout. A reusable cross-product behavior or primitive gap must be evaluated in VyrnForge first.

## Canonical target architecture

```text
generated Documentation Registry + Reference model
                  |
                  v
            ReferenceShell
      +-----------+------------+
      | header / global nav    |
      | search / context       |
      | mobile navigation      |
      | theme                  |
      | route context          |
      +-----------+------------+
                  |
          ReferencePageLayout
     +------------+-------------+
     | reading | reference      |
     | catalog | example | wide |
     +------------+-------------+
                  |
 guide / prose / component / package / token /
 pattern / examples / advanced module / release / states
```

React remains the host implementation only. Generated/canonical data remains framework-neutral and authoritative.

## ReferenceShell responsibilities

The one public shell owns:

- VyrnForge Reference product identity;
- global/product header;
- registry-driven primary and section navigation;
- integrated registry-driven search;
- framework selector;
- documentation-version selector;
- theme control;
- desktop/tablet/mobile navigation behavior;
- skip/main-content targeting and route-change focus handoff;
- route context and deep-link preservation;
- a single main content landmark;
- controlled page-width/layout variants;
- breadcrumbs/local context where the page type requires them.

It must not own component/package/token/pattern facts, API tables, example facts, framework-specific business logic, or a hand-maintained route/search catalog.

## Page-layout variants

The shared layout contract has five presentation modes.

### Reading

For guide, getting-started, foundation, release, migration and other prose. Target readable measure is approximately 72-80 characters for prose, with optional sticky/local table of contents when the source has useful headings. Heading deep links, lists, tables, quotes/callouts and code must be source-driven rather than duplicated in TSX.

### Reference

For component and package details. The layout supports a wider primary column than prose, optional sticky local navigation, stable member anchors, and horizontally scrollable API/table regions without horizontal page overflow.

### Catalog

For component/package/token/pattern indexes and discovery. Prefer dense rows, grouped lists and compact metadata. Cards are allowed only when the record is semantically card-shaped; they are not the default section wrapper.

### Example

For executable and migrated examples. Preview, source/code, framework/version evidence and source path/context are one integrated Reference experience. No separate Playground product or registry.

### Wide

For Data Grid and advanced technical modules. The shell remains identical; only content width/overflow behavior changes. Wide tables/stages may scroll locally and may not force page-level horizontal overflow.

## Navigation and context contract

- Information architecture labels remain generated from canonical documentation sections: Getting Started, Components, Foundations, Patterns, Data & Grid, API / Packages, Releases / Migration.
- Search continues to consume `documentationSearchRecords`; no duplicate index.
- API-member search remains filtered by selected framework/version readiness.
- Native HTML / Custom Elements, React, Angular and Vue receive the same navigation semantics.
- Framework/version switching preserves document identity and member/deep-link identity when valid.
- Unavailable combinations render an explicit state with canonical alternatives. Never silently substitute another framework/version.
- Desktop may expose persistent section navigation. Tablet/mobile uses an intentional disclosure/drawer pattern rather than merely hiding the desktop sidebar.

## Responsive intent

Breakpoints are behavioral, not API contracts and should use existing tokens/media conventions where available.

- **Large desktop (~1280px and above):** persistent product header + section navigation; optional local TOC; reference/wide content may expand.
- **Normal desktop (~1024-1279px):** persistent primary navigation; local TOC may narrow/collapse before main nav does.
- **Tablet (~768-1023px):** global nav becomes compact; section navigation is on-demand; page layouts become one primary column unless the secondary rail remains clearly usable.
- **Narrow mobile (below ~768px):** header/context controls wrap or move into mobile navigation; touch targets remain usable; tables/code/technical regions scroll locally.
- **High zoom / effective narrow viewport:** follows narrow-layout behavior even on desktop hardware; sticky elements must not create traps or hide headings.

No page may horizontally overflow except intentional local scrolling regions such as code, API tables or explicitly wide technical content.

## Accessibility contract

Every implementation track must preserve or add:

- one clear `main` landmark and meaningful header/nav landmarks;
- one logical page title and hierarchical headings;
- keyboard-operable navigation, context controls, search and mobile disclosure;
- visible token-driven focus;
- route-change focus to the new page title/main region without stealing focus during ordinary in-page interaction;
- stable heading/member anchors and adequate scroll margin under sticky chrome;
- accessible labels for framework/version/theme/search controls;
- touch targets suitable for narrow/mobile layouts;
- reduced-motion behavior for transitions;
- contrast that works in light and dark themes;
- no sticky or nested scrolling trap at high zoom;
- proper table headers and local overflow wrappers;
- code regions that remain keyboard-scrollable when overflowed;
- titled/labelled preview iframes/stages where applicable.

Visual inspection alone is not sufficient evidence for #771.

## Design/token contract

Docs presentation uses VyrnForge semantic tokens and CSS custom properties. Prefer semantic tokens such as `--vf-surface-*`, `--vf-text-*`, `--vf-border-*`, `--vf-interactive-*`, `--vf-focus-*`, spacing, typography, radius and elevation tokens.

Legacy fallbacks in docs CSS are migration debt, not license to introduce more hard-coded color/shadow values. If a missing value is broadly reusable, evaluate a shared VyrnForge token/primitive extension first.

Light and dark themes are equal first-class modes. New surfaces must not assume a white page.

## Retain / replace map

### Retain as canonical architecture

- `docs/metadata/documentation-pages.json`;
- `docs/generated/documentation-registry.json`;
- `docs/generated/reference-model.json`;
- `docs/reference/documentationResolver.ts`;
- `docs/reference/referenceRuntime.ts`;
- `apps/docs/src/referenceRoutes.ts` as generated-data adapter;
- `apps/docs/src/docsContext.ts` context/version adapter;
- stable component API-member anchors and record routes;
- canonical reference/package/token/pattern/example/release metadata;
- example implementation modules and their application-specific demo styles where those styles describe the demonstrated application rather than Reference chrome.

### Replace or narrow

- `DocsShell` legacy branch architecture;
- `GuideShell` as a separate product shell;
- `DocsNav` as old sidebar chrome (its registry/search derivation is retained);
- `.vf-docs-shell`, old header/top-link chrome and obsolete sidebar-only layout rules;
- `.vf-docs-page__intro` legacy framing;
- bordered/card-style `.vf-docs-markdown` default container;
- generic `.vf-docs-reference-card` / `.vf-docs-package-card` section stacking;
- legacy `.vf-docs-preview*` presentation;
- standalone-Playground-era presentation classes when they act as docs chrome rather than example content;
- duplicated guide/reference shell CSS and transitional classes after all routes migrate.

Deletion occurs only after contract tests prove no public route still depends on the old presentation.

## Definition of legacy visual presentation

A route is still legacy if any of the following is true:

1. it selects a different top-level product shell because it is a guide, example, grid or other page type;
2. its global product navigation is the old `DocsNav` sidebar chrome rather than the unified Reference navigation behavior;
3. its title/body are primarily framed by `.vf-docs-page__intro` plus a bordered `.vf-docs-markdown` container;
4. most content sections are generic VyrnForge `Card` wrappers without card semantics;
5. preview/code UI uses the old `.vf-docs-preview*` presentation;
6. it requires a docs/product-specific registry or framework fact outside the generated/canonical sources;
7. a narrow/mobile route is only a collapsed desktop layout and lacks usable navigation/context controls.

Later tasks must remove these conditions rather than merely restyle them.

## Verification expectations for implementation tasks

Use repository canonical commands. At minimum, relevant PRs run:

- `npm run format:check`
- `npm run lint`
- `npm run lint:css`
- `npm run test:contracts`
- `npm run verify:reference`
- `npm run verify:docs-quality`
- `npm run build:docs`

Protected CI remains the merge gate. Final #774 also requires exact-main Pages artifact/deployment proof.
