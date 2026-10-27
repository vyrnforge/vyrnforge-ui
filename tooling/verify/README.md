# Verification tooling

`tooling/verify/` owns durable executable invariants for repository structure, architecture, documentation, package contracts, compatibility, packed-consumer behavior, testing structure, workflows, and release readiness.

Package distribution verification uses one real packed-consumer pass. `consumer-packages.mjs` creates each required tarball once, validates its published payload, installs the exact tarballs into an isolated consumer, and verifies public entrypoints from that installation. A separate dry-run package-smoke pass would duplicate packaging work without proving a different contract.

A verifier belongs here only when it protects an ongoing contract. Completed migration gates, milestone status checks, product behavior scenarios, general test harnesses, and one-off cleanup assertions do not. Product- or package-specific evidence should remain owner-local and be consumed or coordinated by shared tooling rather than copied into this capability.
