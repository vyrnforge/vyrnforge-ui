# Changelog

Noteworthy public changes to VyrnForge UI will be documented here.

Versioned sections record public prereleases. Detailed component documentation
stays in the source-of-truth docs linked from `docs/README.md`.

Release readiness, versioning, publication, and migration policy live in [docs/release/](docs/release/).

## Unreleased

### Added

- Added MF-5001 through MF-5004 framework-neutral behavior foundations for
  controllable state, deterministic collections and active-item navigation,
  single/multiple/toggle/range selection, and canonical reasoned controller
  events.

- Added the accepted multi-framework web architecture for a first-class React
  renderer, planned native Custom Elements, verified Angular/Vue consumption,
  and framework-neutral behavior contracts.
- Added machine-readable component contracts for canonical `vf-*` events,
  semantic composition regions, form association, and representative action,
  navigation, form-control, and overlay components.
- Added React, native HTML, Angular, and Vue architecture fixtures plus
  verification that prevents those fixtures from overstating runtime support.

- Added dependency-aware CI planning, reusable quality/package/consumer/docs
  workflows, a stable `ci-gate`, a pinned Node 24 LTS nightly baseline, and a
  high-severity dependency audit.
- Added repository toolchain verification for Node `24.18.0`, npm `11.16.0`,
  and TypeScript `7.0.2`.
- Added post-publication registry consumer verification, npm signature and
  provenance-attestation verification, and automated annotated Git tag plus
  GitHub prerelease creation with separated permissions.

### Changed

- Replaced the next grid-focused roadmap phase with the non-grid
  multi-framework beta program. `@vyrnforge/ui-data-grid` remains an
  independently versioned React alpha and does not block the beta release
  group.
- Established the `@vyrnforge/ui-behaviors` and `@vyrnforge/ui-elements`
  package foundations while retaining `@vyrnforge/ui-components` as the public
  React package through beta.

- Split normal CI, GitHub Pages deployment, npm OIDC publication, registry
  verification, and GitHub release recording into explicit responsibilities.
- Gated automatic GitHub Pages deployment on successful CI for the current
  `main` commit, preventing stale CI runs from deploying older documentation.
- Updated GitHub-maintained workflow actions to their Node 24 generations,
  including the current checkout, setup-node, and Pages action releases.
- Migrated the repository development and CI toolchain to Node `24.18.0`, npm
  `11.16.0`, and an exact TypeScript `7.0.2` workspace pin while preserving the
  published packages' existing Node 22/24 consumer compatibility range.
- Made the explicit prerelease dist-tag authoritative during alpha; npm's
  registry-managed `latest` tag is not treated as a stability signal.
- Standardized canonical density names as `compact`, `balanced`, and
  `spacious` while retaining `standard` and `comfortable` as compatibility
  aliases for existing consumers.

- Prepared `@vyrnforge/ui-core`, `@vyrnforge/ui-components`, and
  `@vyrnforge/ui-data-grid` as the synchronized `0.1.0-alpha.1` corrective
  prerelease. It corrects registry-facing package status text and aligns all
  three package versions.

- Added UniversalDataGrid browser contracts for keyboard cell navigation,
  pointer resize, drag reorder, sticky regions, and two-axis scrolling.
- Added the S3 semantic token foundation for shared surfaces, text, borders,
  interaction, status, density, typography, motion, and deterministic layers,
  with typed exports and machine-verifiable metadata.

### Fixed

### Deprecated

### Removed

- Removed undocumented package-root exports for `useColumnResize`,
  `useColumnReorder`, `useControlledState`, and `useDebouncedValue`. These
  remain internal grid coordination hooks and were not supported public APIs.
- Removed `ToastViewport` and `ToastViewportProps` from the
  `@vyrnforge/ui-components` package root. The viewport is internal provider
  infrastructure, not an application API.

### Accessibility

- Added a roving body-cell focus model with Arrow/Home/End navigation, keyboard
  row activation and selection, semantic resize separators, keyboard column
  reorder fallback, visible focused-cell styling, and polite interaction
  announcements.
- Kept the grid header and selection column visible during vertical and
  horizontal scrolling.

### Security

### Migration Notes

- Use `useDataGridState` for documented experimental grid-state coordination.
  Use `UniversalDataGrid` props and the documented public state/core helpers
  for resizing, ordering, and other grid behavior. Do not replace removed
  exports with deep imports from package source files.
- Use `ToastProvider` for toast rendering. Do not replace the removed
  `ToastViewport` root export with an internal source import.

## 0.1.0-alpha.0

### Added

- Historical first public prerelease: `@vyrnforge/ui-core@0.1.0-alpha.0`.
  `@vyrnforge/ui-components` and `@vyrnforge/ui-data-grid` were not published
  in that prerelease.
