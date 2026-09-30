# G21 — Framework-Neutral Architecture Alignment

- Sprint: S20
- Task: PA-2009
- Decision: **Pass**, conditional on protected CI for this decision package
  remaining green through merge.
- Baseline entering acceptance:
  `a31c62167a16cb71061d9fcb8a1bad42d36b4b01`

## Scope

G21 accepts the S20 architecture repair only. It does not authorize package
renames, npm publication, maturity promotion, framework benchmarking, deferred
Data Grid features, or Native, Angular, or Vue Data Grid surfaces.

## Acceptance evidence

### Framework-neutral canonical non-grid scope

PA-2002 / PR #657 moved scope selection to shared catalog metadata and preserved
the approved 71-record set: 63 contract-complete plus 8 exception-required.

Decision: **Pass**.

### Product support separated from implementation state

PA-2003 / PR #659 introduced schema v3 framework mappings with independent
`supportLevel: first-class` and `implementationState`.
`docs/metadata/multi-framework.json` retains four first-class surfaces.

Decision: **Pass**.

### Neutral generator ownership model

PA-2004 / PR #665 removed `canonicalRenderer` and `canonical-native`
hierarchy terminology. Framework plans use `sharedBrowserImplementation`;
Native uses `native-custom-element-surface`.

Decision: **Pass**.

### Non-hierarchical package identity

PA-2005 / PR #658 describes React, Angular, and Vue as first-class integrations
and the current Data Grid honestly as React-specific, without package rename or
additional framework parity claims.

Decision: **Pass**.

### Equivalent four-surface verification

PA-2006 / PR #660 added
`docs/metadata/first-class-surface-verification.json` and its verifier so
Native, React, Angular, and Vue have explicit build, lint, type, test, and
surface-appropriate evidence obligations.

Decision: **Pass**.

### Native first-class completeness

PA-2007 / PR #663 added Native completeness evidence and verification across
canonical mappings, registration, typing and Custom Elements metadata, packed
consumption, browser and accessibility evidence, and server-safe imports.

Decision: **Pass**.

### Framework-neutral Data Grid seam

PA-2008 / PR #664 moved reusable grid foundation concerns behind an internal
neutral boundary. Package-boundary checks prohibit React, ReactDOM, Vue,
Angular, and `@vyrnforge/ui-components` leakage into that foundation. The
current public grid remains React alpha.

Decision: **Pass**.

### Public API and scope compatibility

S20 did not rename packages, promote maturity, publish packages, add framework
grid surfaces, or intentionally redefine the approved non-grid public component
scope.

Decision: **Pass**.

### Protected repository verification

Every merged S20 implementation PR passed its protected `ci-gate`. This
PA-2009 decision package must also pass the current full CI and `ci-gate`
before merge.

Decision: **Pending this PR**.

## Preserved architecture

Native HTML / Custom Elements, React, Angular, and Vue are equal first-class
VyrnForge surfaces. Equal support does not require four independent renderers.
Shared browser implementation reuse through `@vyrnforge/ui-elements` is an
implementation strategy, not a product-support hierarchy.

Framework packages remain adapters over shared VyrnForge contracts and
foundations. Implementation-state differences and framework exceptions remain
truthful evidence and do not lower a surface's declared product support.

Data Grid remains an advanced VyrnForge module with a current React-only alpha
surface. G21 accepts only the first framework-neutral foundation seam; it makes
no additional framework-support claim for the grid.

## Required final checks

The exact PA-2009 head must pass:

- repository quality and static verification;
- canonical contracts and component-reference verification;
- generated framework artifacts and framework API reference checks;
- package-boundary verification;
- packed external consumer verification;
- packed four-surface generation smoke;
- affected browser and accessibility contracts;
- security and documentation gates;
- protected aggregate `ci-gate`.

When those checks pass and the decision package is merged, G21 is closed and S20
is complete.
