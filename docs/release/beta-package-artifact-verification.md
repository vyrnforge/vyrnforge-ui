# Beta Package Artifact Verification

BT-8003 verifies the publishable payload for the first non-grid beta without
promoting the independently versioned data-grid alpha. The canonical contract is
`docs/metadata/beta-package-artifacts.json`; it is generated from the approved
`non-grid-beta` release group and the package manifests.

Run the complete gate with:

```bash
npm run verify:beta-package-artifacts
```

The command builds the four beta packages, creates real npm tarballs, checks the
exact packed payload, installs those tarballs into a clean fixture with npm
`--offline`, resolves every public entry point from the installed package, runs a
TypeScript typecheck and production Vite build, writes reviewable reports, and
removes generated tarballs, lockfiles, `node_modules`, and build output.

## Verified packages and public entry points

### `@vyrnforge/ui-core`

- `@vyrnforge/ui-core`
- `@vyrnforge/ui-core/index.css`
- `@vyrnforge/ui-core/style.css`
- `@vyrnforge/ui-core/styles/index.css`

### `@vyrnforge/ui-behaviors`

- `@vyrnforge/ui-behaviors`

### `@vyrnforge/ui-components`

- `@vyrnforge/ui-components`
- `@vyrnforge/ui-components/index.css`
- `@vyrnforge/ui-components/style.css`
- `@vyrnforge/ui-components/styles/index.css`

### `@vyrnforge/ui-elements`

- `@vyrnforge/ui-elements`
- `@vyrnforge/ui-elements/custom-elements.json`
- `@vyrnforge/ui-elements/index.css`
- `@vyrnforge/ui-elements/register`
- `@vyrnforge/ui-elements/style.css`
- `@vyrnforge/ui-elements/styles/index.css`

For conditional exports, the gate requires the declared `types`, ESM `import`,
and CommonJS `require` targets. String exports must resolve to the documented CSS
or JSON artifact. Every target must be present in the tarball and in the clean
installed package.

## Payload policy

Each tarball may contain only:

- `package.json`, `README.md`, and `LICENSE`;
- files below `dist/`;
- `custom-elements.json` for `@vyrnforge/ui-elements`.

Source files, tests, stories, source maps, logs, environment files, archives, and
internal or draft directories are rejected. Workspace, file, link, and relative
published dependency specifications are also rejected.

## Offline consumer evidence

The fixture at `tests/beta-package-consumer` installs ordinary third-party
fixture dependencies first. The four VyrnForge tarballs are then installed in a
separate npm invocation using `--offline --no-save`. The gate rejects workspace
symlinks and verifies:

- every installed package version is `0.2.0-beta.1`;
- every public JS, CSS, JSON, and type target exists;
- CommonJS/package and ESM resolution stay inside the installed package;
- TypeScript resolves all documented package entry points;
- a production Vite build succeeds and emits shared `--vf-*` CSS variables.

## Reports

CI uploads `test-results/beta-package-artifacts/` as the
`beta-package-artifacts` workflow artifact. It contains:

- `tarball-report.json`: package filenames, integrity values, sizes, file lists,
  and public entry-point targets;
- `consumer-report.json`: installed paths, resolution evidence, typecheck/build
  status, and cleanup results;
- `consumer.log`: the clean command transcript used to reproduce failures.

The reports are verification evidence, not release artifacts. The tarballs are
removed after verification and the packages are not published by this command.
