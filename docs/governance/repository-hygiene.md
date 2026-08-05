# Repository Hygiene

This record documents the VF-0005 repository-artifact cleanup. It covers
tracked-file hygiene and confirmed local generated output only; it does not
change package APIs, component behavior, CSS ownership, dependencies, or CI/CD
behavior.

## Reviewed Patterns

- archives and package artifacts: `*.rar`, `*.zip`, `*.tar`, `*.tar.gz`, and
  `*.tgz`;
- local installs, build output, caches, and coverage: `node_modules/`, `dist/`,
  `build/`, `coverage/`, `.cache/`, `.vite/`, `.vitest/`, and TypeScript build
  information;
- test artifacts: `playwright-report/`, `test-results/`, `blob-report/`, and
  generated screenshots beneath test-output directories;
- logs and temporary files: `*.log`, npm/yarn/pnpm debug logs, `*.tmp`,
  `*.temp`, swap files, backup files, and process IDs;
- local configuration and editor/OS files: `.env*`, `.DS_Store`, `Thumbs.db`,
  `.idea/`, and workspace-specific `.vscode/` files.

## Removed Files

No tracked file was removed.

The following ignored, local generated files were removed from the working
tree:

- `docs-dev.err.log`
- `docs-dev.out.log`
- `apps/docs/tsconfig.tsbuildinfo`
- `examples/basic-playground/tsconfig.tsbuildinfo`
- `tests/package-consumer/tsconfig.tsbuildinfo`
- `apps/docs/dist/`
- `examples/basic-playground/dist/`
- `packages/ui-core/dist/`
- `packages/ui-components/dist/`
- `packages/ui-data-grid/dist/`

The reviewed artifact set was 2,334,323 bytes before cleanup and 0 bytes after
cleanup. The value excludes `node_modules/`, which is an active local
dependency installation rather than a tracked repository artifact.

## Ignore Rules Added

The root `.gitignore` now explicitly excludes:

- archive snapshots and package-adjacent archives: `*.tar`, `*.tar.gz`,
  `*.zip`, and `*.rar` (`*.tgz` was already excluded);
- browser-test output: `playwright-report/`, `test-results/`, and
  `blob-report/`;
- common temporary/editor artifacts: `*.tmp`, `*.temp`, `*.swp`, `*.swo`,
  `*.bak`, `*.orig`, and `*.pid`.

Existing rules already exclude node modules, package/app build output, coverage,
logs, environment files, TypeScript build caches, npm cache/debug files, and
consumer-verification temporary output.

## Intentionally Retained

| Item | Reason |
| --- | --- |
| `package-lock.json` | Required reproducible dependency lockfile. |
| `docs/archive/` | Tracked governance history. The archive README labels it historical and points to the canonical docs index. |
| `node_modules/` | Ignored active local dependency installation; not tracked and not removed by this hygiene task. |
| Documentation images and fixtures | No generated test screenshot or unintended image artifact was identified by the audit. |
| Local package consumer fixture | Intentional packed-package verification fixture under `tests/package-consumer/`. |

No ambiguous tracked file was deleted. Future archive assets that are intended as
governance evidence require explicit review and may be force-added deliberately
despite the archive ignore patterns.

## Validation

- confirmed no tracked archive, build output, cache, log, tarball, or local
  environment artifact matched the audit patterns;
- confirmed the removed local artifacts were already covered by ignore rules;
- confirmed package source and public APIs are outside the hygiene diff;
- ran repository metadata and lightweight CI-contract verification after the
  documentation changes;
- checked the final working tree for unintended generated files.
