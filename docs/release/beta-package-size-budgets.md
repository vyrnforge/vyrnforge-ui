# Beta package size budgets

BT-8004 makes package growth a reviewed release decision for the five packages in the `non-grid-beta` release group. `@vyrnforge/ui-data-grid` remains outside this gate.

The canonical limits live in [`docs/metadata/beta-package-size-budgets.json`](../metadata/beta-package-size-budgets.json). The original four-package baselines come from the retained BT-8003 artifact evidence recorded in that manifest. The `@vyrnforge/ui-vue` baseline was measured during MFD-1315 in GitHub Actions run `34188917610` from the publishable five-package release set: 20,609 packed bytes, 162,815 unpacked bytes, 16 files, 61,003 runtime JavaScript bytes, 89,517 declaration bytes, and 0 CSS bytes.

## Measured dimensions

Each package is checked for npm packed bytes, npm unpacked bytes, published file count, runtime JavaScript bytes, declaration bytes, and CSS bytes. The runtime dimensions are calculated from the built `dist/` directory after BT-8003 creates and verifies the real beta tarballs.

## Waivers

A budget may be exceeded only by adding a narrow waiver to the canonical manifest. Every waiver must identify one package and metric, set a temporary maximum, name an owner, explain the reason, and provide an ISO expiry date no more than 30 days in the future. Expired, malformed, unrelated, or insufficient waivers fail CI.

Waivers are not a replacement for updating the baseline. A permanent increase requires review of the generated size report and an intentional budget change.

## Commands and evidence

```sh
npm run test:beta-package-size-budgets
npm run verify:beta-package-contract
npm run verify:beta-package-artifacts
npm run verify:beta-package-size-budgets
```

CI uploads `test-results/beta-package-artifacts/size-report.json` together with the BT-8003 tarball and clean-consumer reports.
