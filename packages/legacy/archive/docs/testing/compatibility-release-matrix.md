# Compatibility release matrix

BT-8005 converts the supported beta environment into executable CI cases. The canonical matrix is [`docs/metadata/compatibility-release-matrix.json`](../metadata/compatibility-release-matrix.json).

The release matrix covers Node.js 22.12 and 24.18, React 18 and 19, Angular 21 LTS and 22, Vue 3.4 and 3.5, and native HTML smoke tests in Chromium, Firefox, and WebKit. These are compatibility claims for the four-package non-grid beta release group; they do not promote `@vyrnforge/ui-data-grid` into beta.

Every case performs a clean fixture dependency installation, packs and installs the VyrnForge packages, verifies the installed packages are not workspace links, typechecks the consumer, creates a production build, starts the built application, and executes the existing shared browser smoke scenarios.

The matrix uses exact versions. The reusable workflow derives its job matrix directly from the canonical manifest, so adding or removing support requires one reviewed metadata change rather than a duplicated workflow edit or an unbounded `latest` dependency.

## Commands

```sh
npm run test:compatibility-release-matrix
npm run verify:compatibility-release-matrix
npm run verify:compatibility-release-case -- --case native-node24-chromium
```

Each CI job uploads its case report from `test-results/compatibility-release-matrix/`.
