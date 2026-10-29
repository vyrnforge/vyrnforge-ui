# Semantic impact tooling

`tooling/impact/` is intentionally a thin VyrnForge-specific classification layer. It maps changed paths to semantic ownership and evidence consequences that a generic project graph cannot infer by itself: product components, framework ports, reusable owned units, package/public surfaces, documentation, release intent, visual/browser evidence, and conservative repository-wide impact.

It does **not** schedule commands, own caching, compute the generic project dependency graph, manage browser processes, or execute validation. Nx owns generic affected-project analysis and task orchestration; Playwright owns browser execution; package/release/documentation validators own their evidence. Workflow YAML consumes the classifier's selectors, but the classifier never becomes a second task graph.

## Plan shape

A plan records the validation mode, changed paths, affected components/packages/owned units, browser ports, semantic evidence classes, unknown paths, whether impact broadened repository-wide, and human-readable reasons for every selected scope. It also emits small boolean/port selectors for CI (`packageArtifactsRequired`, `browserRequired`, `docsRequired`, and `releaseRequired`). Those selectors name evidence to run; they are not commands or test-file lists.

Normal PR/Main/local modes classify the actual change. Shared canonical component evidence fans across implemented ports, port-local source stays port-local, Web component CSS fans through the component's real supported ports, package manifests/public entrypoints select packed API/consumer evidence, discovered reusable units fan to components that declare/import them, and unknown paths fail closed. Scheduled and release modes deliberately broaden to the complete safety-net evidence set.

## Local use

`pnpm impact:plan` computes the local plan from committed branch changes relative to `origin/main`/`main`, tracked working-tree changes, staged changes, and untracked files. `pnpm check:changed` emits that same plan and then delegates generic affected lint/typecheck/test/build execution to Nx. Developers use the plan to run any selected expensive evidence (`pnpm verify:packages`, `pnpm verify:release`, `pnpm build:docs`, or the listed Playwright port evidence) when working locally; there is intentionally no custom local scheduler duplicating CI/Nx.

CI stores the JSON plan as reviewable evidence. The report exists so selectors and semantic fan-out can be inspected and tested rather than hidden in workflow path filters.
