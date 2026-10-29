# Semantic impact tooling

`tooling/impact/` is intentionally a thin VyrnForge-specific layer. It classifies changed paths into semantic ownership such as public packages, product components, documentation, and repository-wide foundation changes.

It does **not** schedule commands, own caching, compute the generic project dependency graph, manage browser processes, or execute validation. Nx owns generic affected-project analysis and task orchestration; Playwright owns browser execution; package-specific validators own package correctness.

The semantic impact report exists so CI and reviewers can inspect consequences that cannot be inferred from imports alone. It is metadata, not a second task graph.
