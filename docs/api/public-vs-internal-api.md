# Public Vs Internal API

This document defines what consuming applications may rely on. It does not own
the package inventory, component maturity records, or release classification.

## Public API

A VyrnForge API is public when it is exposed through a documented public package
entrypoint or documented consumer-facing contract and is not explicitly marked
internal.

Public API includes, as applicable:

- documented package-root and public subpath exports from the current VyrnForge
  packages;
- Native HTML / Custom Element, React, Angular, and Vue public component/facade
  contracts;
- documented component properties/inputs, events/outputs, methods, slots,
  composition rules, refs, and exported types;
- documented CSS entrypoints, custom properties, and classes;
- documented framework-neutral behavior/controller contracts;
- documented data-grid state, persistence, server-query, and export-request
  contracts;
- documented structured metadata intended for repository tooling or consumers.

Current package identity and public entrypoints are owned by
[`../metadata/packages.json`](../metadata/packages.json), package manifests, and
verified package artifacts. Component maturity is owned by
[`../metadata/components.json`](../metadata/components.json). Do not infer
public support from an internal source path merely because it is reachable in
the repository.

If an export exists but its public status is unclear, verify the package
manifest/exports, package guidance, canonical metadata, and generated reference
before adopting it as an application contract.

## Internal API

Internal API includes:

- private helper files and non-exported hooks/controllers;
- package-internal source paths not declared as public entrypoints;
- renderer coordination and implementation details that are not part of a
  documented contract;
- internal class names not documented in
  [CSS Class Reference](css-class-reference.md);
- test utilities and fixture-only adapters;
- generated build output that is not an explicit published artifact;
- docs-application-only implementation such as `vf-docs-*` classes.

Internal APIs may change without a compatibility guarantee.

## Maturity and release state

Public component maturity is recorded in
[`../metadata/components.json`](../metadata/components.json). Package/release
classification is recorded in release metadata and package manifests. Public
API status, component maturity, and release channel are related but distinct:
an exported experimental component is not made stable by being package-root
accessible, and a package release channel does not promote every component
inside it.

Use the canonical maturity values and evidence from component metadata rather
than maintaining a second list here.

## Consumer rules

- Import from documented public package entrypoints, not package-internal
  `src/*` paths.
- Check canonical component/API metadata before relying on a VyrnForge contract.
- Keep application business logic, state management, backend integration,
  routing, authorization, and persistence outside VyrnForge contracts.
- Do not treat generated/reference views as independent API authorities; they
  must derive from canonical metadata and implementation.
- If a needed API is missing, record the gap and implement it through a
  dedicated VyrnForge task rather than depending on an internal path.
