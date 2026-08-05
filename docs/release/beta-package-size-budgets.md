# Beta package size budgets

BT-8004 makes package growth a reviewed release decision for the four packages in the `non-grid-beta` release group. `@vyrnforge/ui-data-grid` remains outside this gate.

The canonical limits live in [`docs/metadata/beta-package-size-budgets.json`](../metadata/beta-package-size-budgets.json). Initial packed and unpacked baselines come from the successful BT-8003 package artifact run for commit `bf55580f4fcafc2cf286958490f6f4d51382b746`.

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
