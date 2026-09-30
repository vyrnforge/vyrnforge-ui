# G22 — Shared Capability Convergence

- Sprint: S21
- Task: SC-2109
- Decision: **Pass**, conditional on protected CI for this decision package
  remaining green through merge.
- Baseline entering acceptance:
  `60a23928347256721955d047dedd5ae5007cf9f1`

## Scope

G22 accepts the S21 shared-capability convergence work only. It does not
authorize maturity promotion, package renames, npm publication, Data Grid
feature expansion, new Data Grid framework surfaces, or new large dependencies.

## Acceptance evidence

### Presets, aliases, and named composition

SC-2102 / PR #667 added framework-neutral preset, alias, and named-composition
metadata for StatusBadge, IconButton action aliases, and ToastAction without
creating independent framework renderers. Protected CI #2241 passed generated
references, four-surface generation smoke, browser contracts, docs, security,
and `ci-gate`.

Decision: **Pass**.

### Shared toast service and viewport lifecycle

SC-2103 / PR #668 moved toast record lifecycle, timers, update/dismiss,
pause/resume, action triggering, and service semantics into shared foundations.
React, Native, Angular, and Vue consume the same lifecycle through idiomatic
bindings. Protected CI #2299 passed.

Decision: **Pass**.

### Native-host and named-region adoption

SC-2104 / PR #669 added framework-neutral host-tag, class, and named-region
adoption so typography and layout surfaces can preserve native roots,
attributes, refs/events, and consumer-owned rich content without replacing
Light DOM. Protected CI #2307 passed.

Decision: **Pass**.

### Focus, native form, and multi-value semantics

SC-2105 / PR #670 moved Rating to native-radio semantics, added RadioGroup
focus targeting for adopted native radios, and extended Select multiple to
array value/default/reset/restore plus repeated-name FormData submission.
Protected CI #2311 passed browser, form, keyboard, accessibility, and
compatibility evidence.

Decision: **Pass**.

### Rich collection and navigation composition

SC-2106 / PR #671 added framework-neutral item composition descriptors for
Tabs, Breadcrumbs, SideNav, SegmentedControl, Menu, MultiSelect, and
TransferList. Shared behavior continues to own keyboard, focus, filtering,
selection, and form semantics while framework adapters preserve rich content.
Protected CI #2329 passed Native/React adoption, Angular/Vue composition
coverage, Batch-4 collection parity, and compatibility checks.

Decision: **Pass**.

### Overlay and advanced Autocomplete adoption

SC-2107 / PR #673 added shared overlay composition capability for Dialog,
Drawer, Popover, Tooltip, Toast, ConfirmDialog, and Autocomplete. Shared
foundations own lifecycle, placement, focus, dismissal, toast, confirm, and
Autocomplete behavior while framework adapters retain idiomatic rich-content
values and extension points. Protected CI #2358 passed overlay-feedback parity,
browser Autocomplete evidence, packed cross-framework integration, docs,
security, and compatibility checks.

Decision: **Pass**.

### Framework exception reconciliation

SC-2108 / PR #674 reconciled all 16 original framework exception records
against delivered S21 capabilities. Fifteen records are closed with explicit
capability and CI evidence. One exception remains active:
`MFD-EX-NATIVE-TOAST-VIEWPORT`.

That residual exception is narrow: the shared toast service/viewport lifecycle
is delivered, but the public `vf-toast-viewport` registration still lacks its
own canonical component-contract mapping, so Native manifest generation still
requires exception backing. CI #2360 exposed this exact gap when an attempted
zero-exception reconciliation caused manifest generation to fail. The final
SC-2108 verifier therefore enforces exactly this one live residual mapping gap
and evidence-backed closure of the other 15 records. Protected CI #2364 passed
the exception verifier, native manifest generation, generated artifacts,
packed four-surface integration, quality, docs, security, and `ci-gate`.

Decision: **Pass**.

### Public API, DOM, form, accessibility, and compatibility preservation

S21 capability work did not intentionally narrow the documented framework
public APIs. Native semantic roots, React DOM/ref/event contracts, form
semantics, rich framework content, keyboard/focus behavior, controlled state,
overlay lifecycle, and accessibility behavior are covered by task-specific
parity and compatibility evidence. React implementation-tree fingerprints were
recaptured only when shared adoption changed implementation structure and each
recapture records its S21 evidence.

Decision: **Pass**.

### Equal first-class surfaces

Native HTML / Custom Elements, React, Angular, and Vue remain equal first-class
surfaces. Shared contracts, behaviors, services, metadata, and adoption
capabilities are framework-neutral; framework packages remain idiomatic
adapters rather than independent semantic implementations.

Packed four-surface generation smoke and cross-framework consumer evidence were
green on the relevant S21 protected runs, including the SC-2108 reconciliation
head.

Decision: **Pass**.

### Protected repository verification

Every merged SC-2102 through SC-2108 implementation PR passed its protected
`ci-gate`. This SC-2109 decision package must also pass the current full CI and
`ci-gate` on its exact head before merge.

Decision: **Pending this PR**.

## Preserved architecture

VyrnForge remains one multi-framework UI foundation. Reusable semantics belong
in shared contracts, behaviors, metadata, generators, services, and adoption
models. React, Angular, Vue, and Native HTML / Custom Elements expose those
capabilities idiomatically without becoming separate component libraries.

The remaining Native toast-viewport exception does not represent framework
semantic ownership. It records one explicit canonical metadata/manifest mapping
gap for an already-shared toast capability and remains subject to its concrete
exit criteria.

Data Grid remains an advanced VyrnForge module outside the S21 convergence
scope. G22 does not authorize maturity promotion, package rename, publication,
feature expansion, or additional Data Grid framework surfaces.

## Required final checks

The exact SC-2109 head must pass:

- repository formatting, linting, type, and static verification;
- framework exception verification with the single narrowed residual record;
- canonical contracts, metadata, and generated component/reference checks;
- generated framework artifacts and deterministic references;
- packed external consumer verification;
- packed Native/React/Angular/Vue generation smoke;
- browser, form, keyboard, focus, accessibility, and visual contracts;
- package-boundary and server-safe import verification;
- documentation and security gates;
- protected aggregate `ci-gate`.

When those checks pass and this decision package is merged, G22 is closed and
S21 shared capability convergence is complete.
