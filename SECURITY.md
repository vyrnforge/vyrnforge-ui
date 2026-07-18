# Security Policy

VyrnForge UI security reports are taken seriously and should be submitted privately. Do not report potential vulnerabilities through public GitHub issues, discussions, pull requests, or public comments.

VyrnForge UI is currently pre-alpha. APIs, package contents, package names, supported versions, and release procedures may still change before the first public alpha release.

## Supported Versions

No public package release has been completed yet.

| Version or state | Security support expectation |
| --- | --- |
| Current `main` branch and pre-alpha development | May receive best-effort security review and remediation when practical. |
| Unpublished or obsolete development snapshots | Not guaranteed to receive security support. |
| Future public package releases | Formal version support will be defined after public package releases begin. |

This table does not define long-term support and does not imply production support.

## Reporting A Vulnerability

Preferred route after it is enabled for this repository:

```txt
Repository -> Security -> Advisories -> Report a vulnerability
```

Current repository setting: GitHub Private Vulnerability Reporting is enabled. Use the private advisory route above for vulnerability reports when available.

Fallback contact until that setting or contact is confirmed:

```txt
[SECURITY CONTACT TO BE CONFIRMED BEFORE PUBLIC RELEASE]
```

This placeholder is unresolved and not production-ready. Do not add personal email addresses unless they are approved public repository contacts.

## Information To Include

When reporting a vulnerability, include as much of the following as is safe to share:

- Affected package or component.
- Affected version, commit, or branch.
- Vulnerability description.
- Reproduction steps or proof of concept.
- Expected security impact.
- Affected environments or browsers.
- Suggested mitigation when known.
- Whether the issue has already been disclosed elsewhere.

Avoid including unnecessary customer data, personal data, confidential material, or production identifiers.

## Sensitive Material Handling

When preparing a report:

- Do not submit credentials, real customer data, access tokens, or private keys.
- Use synthetic or redacted evidence.
- Do not exploit systems beyond what is necessary to demonstrate the issue.
- Do not perform destructive testing.
- Do not access data belonging to other users or organizations.

## Response Process

Security reports are handled on a best-effort basis during pre-alpha development. The expected process is:

1. Acknowledge receipt when practical.
2. Validate and triage the report.
3. Request additional information when required.
4. Assess affected packages, commits, branches, and future release plans.
5. Prepare remediation and release guidance when appropriate.
6. Coordinate disclosure when appropriate.

No guaranteed response or remediation SLA exists.

## Coordinated Disclosure

Please keep vulnerability details confidential until:

- The issue is confirmed.
- Affected users can be protected.
- A fix or mitigation is available.
- A disclosure date is mutually agreed where practical.

Public disclosure without reasonable coordination may increase risk to users.

## Scope

Likely in scope:

- `@vyrnforge/ui-core`.
- `@vyrnforge/ui-components`.
- `@vyrnforge/ui-data-grid`.
- Public package build and export configuration.
- Documentation or playground behavior that creates a real security impact.
- Repository release and package-publishing configuration.

Normally out of scope:

- Vulnerabilities only in unsupported third-party software without VyrnForge-specific impact.
- Automated scanner output without demonstrated impact.
- Missing non-security headers on local development servers.
- Denial-of-service testing.
- Social engineering.
- Physical attacks.
- Reports based solely on pre-alpha instability or ordinary UI defects.

An ordinary bug may still be valid, but use the normal issue or contribution process when it has no security impact.

## Dependency Vulnerabilities

Third-party dependency reports should include evidence that:

- The vulnerable dependency is actually present.
- The vulnerable code path is reachable.
- The issue affects a distributed VyrnForge artifact or development workflow.

Dependency findings are not dismissed automatically, but impact should be demonstrated.

## Safe Harbor

Good-faith security research that follows this policy will be considered constructively. This statement is not a legal promise, immunity clause, or authorization to access systems, accounts, data, or infrastructure that you do not own or have explicit permission to test.

## Security Updates

Confirmed security fixes may be communicated through one or more of these channels when available:

- GitHub Security Advisories.
- Release notes.
- Changelog entries.
- Package release notes after npm publishing begins.

These channels are listed as expected communication paths and may not all be operational during pre-alpha development.

## Current Limitations

- VyrnForge UI is pre-alpha.
- No formal long-term-support policy exists.
- No guaranteed response SLA exists.
- No bug bounty currently exists.
- GitHub Private Vulnerability Reporting is not currently enabled.
- Security contact and final disclosure procedures must be confirmed before the first public alpha.

## Relationship To CONTRIBUTING.md

Use [CONTRIBUTING.md](CONTRIBUTING.md) for normal defects, documentation updates, component changes, and contribution workflow.

Potential vulnerabilities must not be opened as public issues.
