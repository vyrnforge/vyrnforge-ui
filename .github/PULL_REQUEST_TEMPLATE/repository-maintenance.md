## Summary

Describe the focused dependency, tooling, configuration, cleanup, or repository-maintenance change and why it is necessary now.

## Maintenance scope

- [ ] Dependency or lockfile update
- [ ] TypeScript, bundler, formatter, or test configuration
- [ ] Workspace or root manifest
- [ ] Verification script that does not change release behavior
- [ ] Repository cleanup or generated-artifact hygiene
- [ ] Contributor, security, or licensing maintenance
- [ ] Non-runtime refactor

## Impact assessment

**Affected packages or workspaces:**

**Runtime behavior:** None / describe

**Public package payload:** None / describe

**CI/CD or release behavior:** None / describe

**Licensing or security posture:** None / describe

## Maintenance review

- [ ] The change is not disguising a feature, breaking API change, or release candidate.
- [ ] Dependency additions are minimal and justified; large framework or state-management dependencies were not introduced.
- [ ] Lockfile changes correspond only to intentional manifest changes.
- [ ] Package exports, CSS entries, peer dependencies, and exact internal dependencies remain valid.
- [ ] Generated output, archives, logs, credentials, and `node_modules` are not committed.
- [ ] Source-of-truth engineering or governance documentation was updated where policy changed.

## Validation

- [ ] The generated CI plan safely covers every affected workspace and downstream package.
- [ ] Relevant targeted checks passed during implementation.
- [ ] `npm run verify:ci` passed when workflows, planner, release scripts, or repository templates changed.
- [ ] `npm run quality` passed once before merge when full validation is required.
- [ ] No package version, npm publication, dist-tag, Git tag, or GitHub Release changed.

## Notes

Document compatibility concerns, dependency advisories, deferred upgrades, rollback steps, or required follow-up work.
