# Verification tooling

`tooling/verify/` owns durable executable invariants for repository structure, architecture, package contracts, environment compatibility, packed-consumer behavior, generic testing/impact structure, workflows, and maintained release/package boundaries.

Package distribution verification uses one real packed-consumer pass. `consumer-packages.mjs` creates each required tarball once, validates its published payload, installs the exact tarballs into an isolated consumer, and verifies public entrypoints from that installation. A separate dry-run package-smoke pass would duplicate packaging work without proving a different contract.

A verifier belongs here only when it protects an ongoing repository-level contract. Completed migration gates, milestone status checks, product behavior scenarios, owner-specific classification rules, and one-off cleanup assertions do not. Product-, package-, application-, and documentation-specific evidence stays owner-local; repository verifiers may validate only the generic boundaries and metadata contracts that coordinate those owners.
