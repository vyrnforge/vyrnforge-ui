import {
  existsSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";

function read(path) {
  return readFileSync(path, "utf8");
}

function write(path, content) {
  writeFileSync(path, content, "utf8");
}

function replaceRequired(content, search, replacement, label) {
  if (!content.includes(search)) {
    throw new Error(`Missing expected content for ${label}`);
  }
  return content.replace(search, replacement);
}

function replaceAllRequired(content, search, replacement, label) {
  if (!content.includes(search)) {
    throw new Error(`Missing expected content for ${label}`);
  }
  return content.replaceAll(search, replacement);
}

const qualityGates = `# VyrnForge UI Quality Gates

This document defines the minimum evidence expected for VyrnForge UI component
and package changes. Canonical maturity definitions and promotion requirements
live in
[\`../governance/component-maturity-model.md\`](../governance/component-maturity-model.md).
Do not create a second maturity definition here.

## Severity

| Severity | Definition |
| --- | --- |
| P0 | Crash, data loss, unusable keyboard behavior, focus-trap failure, inaccessible primary interaction, or a component cannot be used. |
| P1 | Major API inconsistency, major layout or scroll defect, broken controlled state, incorrect form submission, or serious theme/responsive failure. |
| P2 | Incomplete behavior, visual inconsistency, missing secondary accessibility behavior, or incomplete documentation. |
| P3 | Polish, optional enhancement, or future optimization. |

## Component quality gates

| Gate | Requirement |
| --- | --- |
| API consistency | Public APIs follow established VyrnForge conventions and controlled/uncontrolled behavior is explicit. |
| Behavior correctness | Disabled and read-only states block mutation as documented, callbacks are predictable, and shared packages do not silently own application business state. |
| Accessibility | Labels, ARIA relationships, visible focus, keyboard operation, Escape behavior, and live-region or modal semantics are reviewed where applicable. |
| Visual quality | Supported themes and densities retain usable spacing, contrast, control geometry, and focus visibility. |
| Layout and scrolling | Components own predictable minimum sizes and overflow behavior and avoid clipped focus or duplicate scroll regions. |
| Theme and density | Shared visuals use the canonical semantic roles in \`docs/metadata/design-tokens.json\`; grid-only internals use \`--udg-*\`. |
| CSS ownership | \`ui-core\` owns shared tokens/utilities, \`ui-components\` owns \`vf-*\`, \`ui-data-grid\` owns \`udg-*\`, docs own \`vf-docs-*\`, playground owns \`vf-playground-*\`, regression fixtures own \`vf-fixture-*\`, and external consumer fixtures use \`vf-consumer-*\`. |
| CSS verification | \`npm run lint:css\` rejects invalid CSS, duplicate declarations, invalid custom-property names, and classes outside approved VyrnForge prefixes. |
| Documentation | Public surfaces have canonical metadata, appropriate guidance, examples where useful, and honest limitations. |
| Testing | Logic, DOM interaction, accessibility, browser, theme/density, compatibility, and consumer evidence are required according to category and maturity. |
| Production readiness | No unresolved P0/P1 defect and no maturity claim unsupported by the canonical evidence record. |

## Maturity source of truth

Allowed statuses and promotion requirements are owned by the component maturity
model and canonical component metadata. Current maturity verification includes:

\`\`\`bash
npm run verify:component-maturity
npm run verify:maturity-closure
\`\`\`

These checks prevent unsupported maturity claims from silently reappearing in
current metadata.

## DOM interaction and accessibility

Shared jsdom utilities live in \`tests/dom\`. Component and regression-fixture
tests import test-only helpers from that location; public package implementation
must not expose them.

DOM interaction tests, automated axe scans, and Chromium contracts are mandatory
where applicable. They provide repeatable structural, interaction, focus,
pointer, and layout evidence, but they do not prove complete WCAG conformance.
Manual assistive-technology execution is tracked by
\`docs/metadata/assistive-technology-reviews.json\`.

## Repository validation

Use the repository's current aggregate commands rather than reconstructing an
older sprint-specific gate:

\`\`\`bash
npm run check
npm run ci
\`\`\`

\`npm run check\` covers formatting, linting, static contracts, metadata,
package boundaries, documentation currency, type checking, and other blocking
repository verifiers. \`npm run ci\` adds the broader contract, coverage,
package, fixture, browser, packed-consumer, and application-build evidence used
by continuous integration.

The GitHub \`ci-gate\` is the required aggregate merge check. Missing,
cancelled, failed, or unexpectedly skipped mandatory work must fail the gate.

## Semantic token and visual evidence

Token-contract changes use the canonical token and adoption checks:

\`\`\`bash
npm run test:design-tokens
npm run verify:design-tokens
npm run test:token-adoption
npm run verify:token-adoption
npm run test:visual-regression
npm run verify:visual-regression
npm run test:visual
\`\`\`

The visual matrix combines deterministic computed-style expectations with PNG
review evidence. Its durable testing contract is documented in
[Visual Regression Testing](../testing/visual-regression.md).
`;
write("docs/quality/00-quality-gates.md", qualityGates);

const semanticTokenContract = `# Semantic Token Contract

The machine-readable source of truth is
\`docs/metadata/design-tokens.json\`; typed token and theme exports are owned by
\`@vyrnforge/ui-core\`.

## Purpose

Shared visual decisions belong to \`@vyrnforge/ui-core\` when they describe a
role reusable across components, the data grid, documentation, or consuming
applications. Components should not invent local values for shared surface,
text, interaction, status, density, typography, motion, or layering roles.

The contract is native-first, CSS-variable-based, dependency-minimal, and
store-agnostic.

## Ownership decision

| Decision | Owner | Prefix | Examples |
| --- | --- | --- | --- |
| Shared semantic role | \`@vyrnforge/ui-core\` | \`--vf-*\` | focus, surface, status, density, motion |
| Reusable component composition | \`@vyrnforge/ui-components\` | \`vf-*\` | button layout, field structure |
| Grid-only behavior | \`@vyrnforge/ui-data-grid\` | \`--udg-*\`, \`udg-*\` | grid row geometry, frozen columns |
| Application presentation | consuming application | app prefix | docs shell, product-specific branding |

Component-local custom properties remain valid for measured geometry, dynamic
positions, or private composition. They are not a substitute for shared
semantic decisions.

## Contract categories

| Category | Canonical roles |
| --- | --- |
| Surface | page, canvas, default, muted, overlay, sunken, scrim |
| Text | primary, secondary, tertiary, inverse, disabled, link |
| Border | subtle, default, emphasis, divider |
| Interactive | primary, hover, active, selected, neutral, disabled, focus |
| Status | success, warning, error, info, pending, neutral |
| Density | compact, balanced, spacious sizing and active aliases |
| Typography | display, page title, section title, label, body, caption, code, numeric |
| Motion | durations, easing, color/opacity/transform transitions |
| Layer | base, raised, sticky, dropdown, popover, tooltip, scrim, modal, toast, debug |

See \`../api/css-token-reference.md\` for the complete token list.

## Compatibility bridge

Compatibility variables such as \`--vf-bg\`, \`--vf-surface\`, \`--vf-text\`,
\`--vf-primary\`, and status aliases remain supported bridges where declared by
the canonical contract. New component work must use canonical role names.

Shared components consume semantic roles directly. The data grid keeps
package-owned \`--udg-*\` roles for grid-specific semantics and geometry, with
defaults mapped to the shared contract. Compatibility aliases must not become a
second source of theme values.

## Themes

Light, dark, enterprise, and system themes expose the same semantic roles.

- Light values are the root defaults.
- Dark overrides preserve role meaning rather than component-specific colors.
- Enterprise is a light business-oriented variant with stronger hierarchy.
- System uses light defaults and applies the complete dark role set when the
  operating system requests dark color scheme.

Theme presets exported from TypeScript contain every theme-scoped semantic
token so JavaScript theme application cannot provide a partial contract.

## Density

Canonical density names are:

- \`compact\`
- \`balanced\`
- \`spacious\`

\`standard\` remains a compatibility alias of \`balanced\`; \`comfortable\`
remains a compatibility alias of \`spacious\`. Components and grid CSS accept
supported canonical and compatibility names according to their public contracts.

The active density contract controls control height and padding, icon size, row
height, component gap, and body type size. \`--vf-hit-target-min\` is the shared
minimum pointer-target policy token; components must still account for context,
adjacent target spacing, and accessibility.

## Typography

Named roles replace ad hoc combinations of font size, weight, line height, and
letter spacing. Shared utility classes are available as \`vf-type-*\`, while
package components may consume role variables directly. Numeric presentation
uses tabular numerals through \`.vf-type-numeric\`.

## Motion

No essential state change may depend on animation. Automatic
\`prefers-reduced-motion: reduce\` and explicit \`data-motion="reduced"\` /
\`.vf-motion-reduced\` modes shorten non-essential durations and use linear
easing while preserving state visibility.

## Layers

Layer values are unique and strictly increasing:

| Role | Level |
| --- | ---: |
| Base | 0 |
| Raised | 10 |
| Sticky | 20 |
| Dropdown | 40 |
| Popover | 50 |
| Tooltip | 60 |
| Scrim | 70 |
| Modal | 80 |
| Toast | 90 |
| Debug | 9999 |

Compatibility z-index variables alias canonical levels. Dynamic overlay stack
offsets remain component-owned and must be added to the appropriate semantic
base layer.

## Package adoption boundary

- \`@vyrnforge/ui-components\` consumes canonical \`--vf-*\` roles for shared
  surfaces, text, borders, interaction, status, controls, typography, motion,
  focus, and layers.
- Component-local custom properties are limited to private geometry or dynamic
  state such as slider progress and measured overlay coordinates.
- \`@vyrnforge/ui-data-grid\` retains \`--udg-*\` only as grid-facing role and
  geometry contracts; their defaults map to canonical \`--vf-*\` roles.
- Light, dark, enterprise, and system grid themes inherit ui-core. Explicit
  package-specific themes remain narrow documented exceptions when the shared
  foundation does not yet own an equivalent contract.
- Typed data-grid presets derive from exported ui-core theme objects rather than
  duplicating theme color literals.

The historical \`--udg-surface-ra-sm\` spelling remains a compatibility alias
of \`--udg-surface-raised\`. New code must use the correctly named role.

## Verification

\`\`\`bash
npm run test:design-tokens
npm run verify:design-tokens
npm run test:token-adoption
npm run verify:token-adoption
npm run test:browser -- tests/browser/semantic-tokens.spec.ts
npm run test:visual-regression
npm run verify:visual-regression
npm run test:visual
\`\`\`

The verifiers reject missing categories, duplicate token names, incomplete theme
presets, broken compatibility bridges, invalid density aliases, invalid layer
order, missing reduced-motion fallbacks, hard-coded shared component colors,
duplicated grid theme maps, literal motion timings, and invalid grid-to-core
mappings.

Visual evidence is governed by
[Visual Regression Testing](../testing/visual-regression.md) and the canonical
\`docs/metadata/visual-regression-matrix.json\`.
`;
write("docs/architecture/08-semantic-token-contract.md", semanticTokenContract);

const visualRegression = `# Visual Regression Testing

## Purpose

VyrnForge visual regression testing verifies that representative component,
grid, theme, density, and overlay visuals continue to resolve from canonical
design tokens rather than drifting into package-local styling decisions.

The canonical matrix is \`docs/metadata/visual-regression-matrix.json\`. The
browser implementation is \`tests/browser/visual-regression.spec.ts\`.

## Evidence strategy

VyrnForge uses two complementary evidence layers:

1. **Computed-style token baselines** are the blocking regression contract.
   Each representative visual property must resolve from the documented
   \`--vf-*\` or \`--udg-*\` role declared by the matrix.
2. **PNG screenshots** are produced for every matrix case and uploaded for human
   review.

This avoids committing operating-system-specific raster baselines while still
producing inspectable images. Browser font rasterization and antialiasing may
differ across platforms; semantic computed-style comparison remains the
deterministic contract.

A passing screenshot alone is not sufficient. The browser test must also prove
that target surface, text, border, density, and layer properties resolve from
the expected semantic roles.

## Current matrix

| Suite | Fixture | Themes | Densities | Cases |
| --- | --- | --- | --- | ---: |
| Shared components | \`/fixtures/visual/components\` | light, dark | compact, standard, comfortable | 6 |
| UniversalDataGrid | \`/fixtures/data-grid/selection\` | light, dark | compact, standard, comfortable | 6 |
| Dialog overlay | \`/fixtures/dialog/focus\` | light, dark | standard | 2 |
| **Total** | | | | **14** |

The canonical JSON matrix owns the authoritative case definitions. This table is
a human-readable summary and must be updated with the matrix when its topology
changes.

## Commands

\`\`\`bash
npm run test:visual-regression
npm run verify:visual-regression
npm run test:visual
\`\`\`

\`npm run test:browser\` also includes the visual matrix. \`npm run check\`
includes the static visual contract verifier, while \`npm run ci\` adds the full
browser suite.

## Artifacts

Every successful visual case writes:

- \`test-results/visual-evidence/<case>.png\`
- \`test-results/visual-evidence/<case>.json\`

The JSON record contains actual and expected computed values for every matrix
expectation. GitHub Actions retains the visual evidence for review; failure
traces, screenshots, and Playwright reports remain available through the browser
artifacts.

## Updating the matrix

A visual contract change requires all of the following:

1. change the canonical token or package mapping;
2. update the deterministic regression fixture when a new state is needed;
3. update \`docs/metadata/visual-regression-matrix.json\`;
4. run the static verifier and browser matrix;
5. review generated PNG evidence;
6. explain the intended visual contract change in the pull request.

Do not weaken a token expectation merely to accept visual drift. When a
component genuinely needs a local visual role, document its ownership and add a
narrow expectation.

## Evidence boundary

The matrix proves the representative token roles and theme/density composition
listed by canonical metadata. It does not claim exhaustive pixel coverage for
every public component, responsive breakpoint, operating system, or contrast
mode. New coverage must extend the canonical matrix rather than create another
visual source of truth.
`;
write("docs/testing/visual-regression.md", visualRegression);

const browserTesting = `# Browser Testing

## Purpose

VyrnForge browser tests prove behavior that DOM rendering alone cannot verify,
including real focus movement, portal behavior, viewport positioning, pointer
interactions, scroll locking, and browser event ordering.

The browser suite consumes the deterministic regression fixture application. It
does not create a second component catalog or import unpublished package source
paths.

## Commands

\`\`\`bash
npm run test:browser:install
npm run test:browser
npm run test:browser:headed
npm run test:browser:debug
npm run test:browser:report
npm run test:visual
npm run verify:visual-regression
\`\`\`

When Chromium is already installed outside Playwright, set
\`PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH\` to its executable path. CI uses the
Playwright-managed Chromium build.

\`test:browser\` starts the fixture application automatically on
\`http://127.0.0.1:4173\`. A separately running compatible fixture server may be
reused for local development but is never assumed in CI.

## Fixture contract

Browser tests navigate through stable fixture IDs from
\`apps/regression-fixtures/src/fixtureRegistry.ts\`. A fixture must:

- use deterministic data;
- avoid network requests and current timestamps;
- expose \`data-vf-fixture-ready="true"\` only when it is ready for interaction;
- prefer semantic roles and accessible names;
- use \`data-vf-fixture-action\` or \`data-vf-fixture-region\` only when a
  semantic locator is not stable enough;
- consume VyrnForge through public package exports.

## Selector rules

Prefer, in order:

1. role and accessible name;
2. label text;
3. stable fixture action or region attributes;
4. component CSS classes only for geometry or overlay-boundary checks.

Do not select elements by arbitrary DOM position or implementation-generated
React IDs.

## Artifacts

The Chromium project records a trace on the first retry, screenshots on failure,
an HTML report, and a JSON result file in CI. GitHub Actions also retains
\`test-results/visual-evidence\` for relevant visual runs so successful
computed-style records and screenshots remain reviewable.

## Evidence boundaries

A browser smoke test proves the fixture infrastructure and the exact behavior it
asserts. It does not automatically provide complete browser evidence for every
component shown by that fixture.

Current component contract specifications include:

- \`tests/browser/dialog.spec.ts\`
- \`tests/browser/drawer.spec.ts\`
- \`tests/browser/menu.spec.ts\`
- \`tests/browser/popover-tooltip.spec.ts\`
- \`tests/browser/autocomplete.spec.ts\`
- \`tests/browser/multi-select.spec.ts\`
- \`tests/browser/transfer-list.spec.ts\`
- \`tests/browser/slider-rating.spec.ts\`
- \`tests/browser/tabs-toggle.spec.ts\`
- \`tests/browser/toast.spec.ts\`
- \`tests/browser/data-grid-keyboard.spec.ts\`
- \`tests/browser/data-grid-interactions.spec.ts\`

Automated axe scans, DOM interaction tests, and Playwright browser tests are
complementary; none should be presented as a substitute for the others.

## Visual regression

\`tests/browser/visual-regression.spec.ts\` consumes the canonical matrix in
\`docs/metadata/visual-regression-matrix.json\`. Computed-style token
expectations are the blocking cross-platform baseline; PNG screenshots are
retained as human-review evidence. See
[Visual Regression Testing](visual-regression.md).
`;
write("docs/testing/browser-testing.md", browserTesting);

let docsReadme = read("docs/README.md");
docsReadme = replaceRequired(
  docsReadme,
  "| Browser testing                    | [Browser Testing](testing/browser-testing.md)                                                                   |\n| Cross-framework consumer fixtures  | [Consumer Fixture Strategy](testing/multi-framework-consumer-fixtures.md)                                       |",
  "| Browser testing                    | [Browser Testing](testing/browser-testing.md)                                                                   |\n| Visual regression                  | [Visual Regression Testing](testing/visual-regression.md)                                                       |\n| Cross-framework consumer fixtures  | [Consumer Fixture Strategy](testing/multi-framework-consumer-fixtures.md)                                       |",
  "docs index visual regression link",
);
docsReadme = replaceRequired(
  docsReadme,
  "| Repository hygiene                              | [Repository Hygiene](governance/repository-hygiene.md)                    |\n| Generated repository inventory                  | [Repository Inventory](governance/repository-inventory.md)                |",
  "| Repository hygiene                              | [Repository Hygiene](governance/repository-hygiene.md)                    |\n| Quality gates                                    | [Quality Gates](quality/00-quality-gates.md)                               |\n| Generated repository inventory                  | [Repository Inventory](governance/repository-inventory.md)                |",
  "docs index quality gate link",
);
docsReadme = replaceRequired(
  docsReadme,
  "| [quality/](quality/)                   | Quality audits, closure records, visual evidence, accessibility evidence, and stabilization reports. |\n| [testing/](testing/)                   | Detailed compatibility, browser, consumer, and framework verification contracts.                     |",
  "| [quality/](quality/)                   | Current quality gates, limitations, architecture evidence, accessibility evidence, and retained stabilization records. |\n| [testing/](testing/)                   | Detailed browser, visual, compatibility, consumer, and framework verification contracts.                      |",
  "docs index evidence descriptions",
);
write("docs/README.md", docsReadme);

let verifier = read("scripts/verify-documentation-current.mjs");
verifier = replaceAllRequired(
  verifier,
  '  "docs/architecture/02-state-and-adapter-ownership.md",\n',
  '  "docs/architecture/02-state-and-adapter-ownership.md",\n  "docs/architecture/08-semantic-token-contract.md",\n',
  "semantic token verifier coverage",
);
verifier = replaceAllRequired(
  verifier,
  '  "docs/quality/03-known-limitations.md",\n',
  '  "docs/quality/00-quality-gates.md",\n  "docs/quality/03-known-limitations.md",\n  "docs/testing/browser-testing.md",\n  "docs/testing/visual-regression.md",\n',
  "quality and testing verifier coverage",
);
write("scripts/verify-documentation-current.mjs", verifier);

let verifierTest = read("scripts/verify-documentation-current.test.mjs");
verifierTest += `\n\ntest("rejects removed aggregate commands in quality guidance", () =>\n  fixture(\n    (root) => {\n      const relativePath = "docs/quality/00-quality-gates.md";\n      write(\n        root,\n        relativePath,\n        \`\${read(root, relativePath)}\\nLegacy instruction: npm run quality\\n\`,\n      );\n    },\n    (failures) =>\n      assert(\n        failures.some((failure) =>\n          failure.includes("removed public command: npm run quality"),\n        ),\n      ),\n  ));\n`;
write("scripts/verify-documentation-current.test.mjs", verifierTest);

let registry = read("apps/docs/src/docsRegistry.ts");
registry = replaceRequired(
  registry,
  'import multiFrameworkFixtures from "../../../docs/testing/multi-framework-consumer-fixtures.md?raw";\nimport semanticTokenAudit from "../../../docs/quality/s3-semantic-token-audit.md?raw";\nimport multiFrameworkArchitectureEvidence from "../../../docs/quality/s4-multi-framework-architecture.md?raw";',
  'import multiFrameworkFixtures from "../../../docs/testing/multi-framework-consumer-fixtures.md?raw";\nimport visualRegression from "../../../docs/testing/visual-regression.md?raw";\nimport qualityGates from "../../../docs/quality/00-quality-gates.md?raw";\nimport knownLimitations from "../../../docs/quality/03-known-limitations.md?raw";\nimport multiFrameworkArchitectureEvidence from "../../../docs/quality/s4-multi-framework-architecture.md?raw";',
  "docs registry quality imports",
);
registry = replaceRequired(
  registry,
  `  {\n    id: "s3-semantic-token-audit",\n    title: "S3 Semantic Token Audit",\n    group: "Quality",\n    description:\n      "VF-3001 inventory of shared token gaps, hard-coded decisions, and deferred migration debt.",\n    sourcePath: "docs/quality/s3-semantic-token-audit.md",\n    aiPurpose:\n      "Use this to distinguish completed token foundation work from VF-3009 and VF-3010 migration debt.",\n    tags: ["quality", "tokens", "audit", "s3"],\n    content: semanticTokenAudit,\n  },`,
  `  {\n    id: "visual-regression",\n    title: "Visual Regression Testing",\n    group: "Testing",\n    description:\n      "Deterministic computed-style baselines, screenshot evidence, and visual matrix maintenance.",\n    sourcePath: "docs/testing/visual-regression.md",\n    aiPurpose:\n      "Use this before changing the visual regression matrix, fixtures, or evidence policy.",\n    tags: ["testing", "visual", "tokens", "evidence"],\n    content: visualRegression,\n  },\n  {\n    id: "quality-gates",\n    title: "Quality Gates",\n    group: "Quality",\n    description:\n      "Current component, repository, accessibility, token, and merge-quality requirements.",\n    sourcePath: "docs/quality/00-quality-gates.md",\n    aiPurpose:\n      "Use this to determine the current blocking quality expectations for repository changes.",\n    tags: ["canonical", "quality", "testing", "ci"],\n    canonical: true,\n    content: qualityGates,\n  },\n  {\n    id: "known-limitations",\n    title: "Known Limitations",\n    group: "Quality",\n    description:\n      "Current release-level framework, browser, server, and application-ownership limitations.",\n    sourcePath: "docs/quality/03-known-limitations.md",\n    aiPurpose:\n      "Use this before making support claims that may exceed current package or framework boundaries.",\n    tags: ["canonical", "quality", "limitations"],\n    canonical: true,\n    content: knownLimitations,\n  },`,
  "docs registry stale S3 route",
);
registry = replaceRequired(
  registry,
  '      "CF-7013 guidance for choosing React components or native elements, integrating Angular and Vue, and understanding beta exclusions.",',
  '      "Guidance for choosing React components or native elements, integrating Angular and Vue, and understanding current framework and release limitations.",',
  "migration route description",
);
registry = replaceRequired(
  registry,
  '    tags: ["release", "migration", "multi-framework", "gmf4"],',
  '    tags: ["release", "migration", "multi-framework"],',
  "migration route tags",
);
registry = replaceRequired(
  registry,
  '      "CF-7009 packed Native HTML, React, Angular, and Vue shared browser scenarios and runtime evidence.",',
  '      "Packed Native HTML, React, Angular, and Vue shared browser scenarios and runtime evidence.",',
  "browser matrix description",
);
registry = replaceRequired(
  registry,
  '    tags: ["metadata", "multi-framework", "browser", "gmf4", "json"],',
  '    tags: ["metadata", "multi-framework", "browser", "json"],',
  "browser matrix tags",
);
registry = replaceRequired(
  registry,
  '      "CF-7010 Axe, keyboard, and manual Windows + Chrome + NVDA evidence state across four packed consumers.",',
  '      "Automated accessibility, keyboard, and manual assistive-technology evidence across packed framework consumers.",',
  "accessibility description",
);
registry = replaceRequired(
  registry,
  '    tags: ["metadata", "accessibility", "multi-framework", "gmf4", "json"],',
  '    tags: ["metadata", "accessibility", "multi-framework", "json"],',
  "accessibility tags",
);
registry = replaceRequired(
  registry,
  '      "CF-7013 migration and limitations guide review status and required coverage.",',
  '      "Migration and limitations guide review status and required coverage.",',
  "migration metadata description",
);
registry = replaceRequired(
  registry,
  '    tags: ["metadata", "migration", "multi-framework", "gmf4", "json"],',
  '    tags: ["metadata", "migration", "multi-framework", "json"],',
  "migration metadata tags",
);
registry = replaceRequired(
  registry,
  '      "CF-7011/CF-7012 generated framework usage tabs and component-contract reference status.",',
  '      "Generated framework usage tabs and component-contract reference status.",',
  "component reference metadata description",
);
registry = replaceRequired(
  registry,
  '      "gmf4",\n',
  '',
  "component reference metadata tags",
);
write("apps/docs/src/docsRegistry.ts", registry);

for (const path of [
  "docs/quality/01-current-component-audit.md",
  "docs/quality/q1-component-quality-audit.md",
  "docs/quality/s3-semantic-token-audit.md",
  "docs/quality/s3-token-adoption-report.md",
  "docs/quality/s3-visual-regression.md",
  "docs/quality/s5-framework-neutral-behaviors.md",
  "docs/quality/s8-non-grid-beta-scope-audit.md",
]) {
  if (!existsSync(path)) throw new Error(`Expected stale document: ${path}`);
  rmSync(path);
}

console.log("Stale quality documentation cleanup applied.");
