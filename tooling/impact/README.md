# Impact tooling

`tooling/impact/` owns the repository's validation-impact model: scope definitions, dependency and trigger policy, changed-file planning, validation selection, execution, concurrency policy, and the tests that prove those decisions.

This capability answers which validation should run and how repository-wide validation is coordinated. It does not own product behavior, component scenarios, package implementation tests, or application evidence. Those remain with their owning package, product slice, or application and are selected by the impact graph rather than redefined here.

## Execution contract

Validation plans select **evidence scopes**. Shared lint, build, setup, and preparation work must be declared as scope prerequisites and deduplicated by the executor; selected commands must not hide a second copy of work already represented by the graph.

When multiple selected evidence scopes require the same prerequisite, that prerequisite executes once. Equivalent exhaustive evidence may be batched only when the batch proves the same affected closure without weakening owner-local assertions. Browser installation and shared component-browser serving follow the same rule: prepare once for the widest selected matrix, then reuse that preparation across the selected evidence.

Package membership and internal dependency ordering are derived from the maintained workspace/package manifests. The package-contract verifier remains responsible for enforcing that those manifests match the approved architecture; the impact engine should not keep a second hand-maintained copy of the package graph.
