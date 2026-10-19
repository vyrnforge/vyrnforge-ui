# @vyrnforge/legacy

This package is an inert quarantine of the pre-rebuild VyrnForge repository.

It exists only so the old implementation can be inspected temporarily and deleted later as one directory.

Rules:

- New VyrnForge code must not import from this package or its archive.
- This package must not participate in builds, runtime dependencies, public exports, documentation generation, or release artifacts.
- Legacy tests are historical evidence only and do not define current correctness.
- Files under `archive/` preserve the old packages, apps, documentation, scripts, tests, workflows, and root build configuration.

Deletion target: remove `packages/legacy` once the rebuilt foundations and representative components make the historical implementation unnecessary.
