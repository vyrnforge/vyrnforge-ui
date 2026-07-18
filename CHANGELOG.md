# Changelog

Noteworthy public changes to VyrnForge UI will be documented here.

Versioned sections will begin with the first public alpha release. Until then, pre-alpha changes remain under `Unreleased` and detailed component documentation stays in the source-of-truth docs linked from `docs/README.md`.

Release readiness, versioning, publication, and migration policy live in [docs/release/](docs/release/).

## Unreleased

### Added

### Changed

### Fixed

### Deprecated

### Removed

- Removed undocumented package-root exports for `useColumnResize`,
  `useColumnReorder`, `useControlledState`, and `useDebouncedValue`. These
  remain internal grid coordination hooks and were not supported public APIs.

### Accessibility

### Security

### Migration Notes

- Use `useDataGridState` for documented experimental grid-state coordination.
  Use `UniversalDataGrid` props and the documented public state/core helpers
  for resizing, ordering, and other grid behavior. Do not replace removed
  exports with deep imports from package source files.
