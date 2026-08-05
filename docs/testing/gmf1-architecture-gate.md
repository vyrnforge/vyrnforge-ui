# GMF1 — Multi-Framework Architecture Gate

## Decision

MF-4001 through MF-4012 have evidence-complete architecture and package
foundations. `@vyrnforge/ui-behaviors` and `@vyrnforge/ui-elements` are real,
buildable, testable workspaces. Every public React non-grid catalog record now
has a framework-parity plan.

GMF1 is considered passed only after the pull request's required `ci-gate`
completes successfully.

## Explicit non-claims

- no public native component renderer is beta-supported yet;
- no Angular or Vue runtime compatibility claim exists yet;
- no component-specific shared controller parity claim exists yet;
- data-grid work remains deferred and independent.

## Required commands

```bash
npm run verify:ci
npm run quality
```
