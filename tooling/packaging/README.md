# Packaging tooling

This capability contains repository-only helpers for producing and normalizing release-shaped package artifacts. It does not define a task graph; Nx owns task orchestration and package-native build tools own package output.

Angular normalization is limited to validating the source manifest against generated Angular Package Format output and removing nested secondary-entrypoint manifests that must not become independent package scopes. Public package validation remains owned by `tooling/verify/package-artifacts.mjs`.
