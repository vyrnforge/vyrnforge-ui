# Impact tooling

`tooling/impact/` owns the repository's validation-impact model: scope definitions, dependency and trigger policy, changed-file planning, validation selection, execution, concurrency policy, and the tests that prove those decisions.

This capability answers which validation should run and how repository-wide validation is coordinated. It does not own product behavior, component scenarios, package implementation tests, or application evidence. Those remain with their owning package, product slice, or application and are selected by the impact graph rather than redefined here.
