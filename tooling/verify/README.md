# Verification tooling

`tooling/verify/` owns durable executable invariants for repository structure, architecture, documentation, package contracts, compatibility, consumer/package smoke behavior, testing structure, workflows, and release readiness.

A verifier belongs here only when it protects an ongoing contract. Completed migration gates, milestone status checks, product behavior scenarios, general test harnesses, and one-off cleanup assertions do not. Product- or package-specific evidence should remain owner-local and be consumed or coordinated by shared tooling rather than copied into this capability.
