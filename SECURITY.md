# Security Policy

VyrnForge security reports should be submitted privately. Do not publish potential vulnerabilities in issues, pull requests, discussions, or other public channels.

VyrnForge is currently in rebuild bootstrap. The active package architecture is `@vyrnforge/core`, `@vyrnforge/web`, `@vyrnforge/react`, `@vyrnforge/angular`, `@vyrnforge/vue`, and `@vyrnforge/elements`. These packages remain unreleased bootstrap surfaces unless the release process explicitly states otherwise.

## Supported versions

There is no production-support or long-term-support promise during bootstrap. Security support for future releases will be defined by release policy and the canonical compatibility source when publishing begins.

## Reporting a vulnerability

Use the repository's private GitHub security reporting/advisory flow when available. Include the affected package or capability, version/commit, reproduction details, expected impact, affected environments, and a safe proof of concept where useful.

Do not include real credentials, customer data, private keys, access tokens, or unrelated confidential information. Use synthetic or redacted evidence and avoid destructive testing or accessing systems/data you do not own or have explicit permission to test.

## Scope

Potential VyrnForge-specific security impact may include active package code and public entrypoints, browser/runtime behavior, package and release configuration, documentation tooling that creates a real security issue, or repository automation that affects distributed artifacts.

`packages/legacy` is quarantined historical reference and is not a supported runtime surface. Findings that only affect quarantined code are normally not release vulnerabilities unless the same issue exists in the rebuilt implementation or active tooling.

Third-party dependency findings should demonstrate that the dependency is present and that the vulnerable path affects an active VyrnForge artifact or development/release workflow.

## Disclosure

Please keep vulnerability details private while the issue is triaged and a fix or mitigation is prepared. There is no guaranteed response SLA or bug bounty during bootstrap.

For ordinary defects and contribution workflow, use [CONTRIBUTING.md](CONTRIBUTING.md).
