# BT-8007 External Evidence

This directory is reserved for reviewed BT-8007 evidence. Do not store secrets,
OIDC tokens, npm session data, private account details, or raw authentication
responses.

Populate [`evidence.json`](evidence.json) and retain the referenced redacted captures before changing `externalEvidence.status` to `verified`:

- one redacted npm trusted-publisher settings capture per publishable package;
- one redacted GitHub `npm-release` environment protection capture;
- the successful verify-mode workflow run and dry-run artifact reference;
- reviewer, review date, and any approved exception.

Repository-controlled validation alone is not sufficient to close BT-8007.
