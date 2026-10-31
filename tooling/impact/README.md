# Semantic impact tooling

`tooling/impact/` is intentionally a thin VyrnForge-specific classification layer. It maps changed paths to semantic ownership and evidence consequences that a generic project graph cannot infer by itself: product components, framework ports, reusable owned units, package/public surfaces, documentation, release intent, visual/browser evidence, and conservative repository-wide impact.

It does **not** schedule commands, own caching, compute the generic project dependency graph, manage browser processes, or execute validation. Nx owns generic affected-project analysis and task orchestration; Playwright owns browser execution; package/release/documentation validators own their evidence. Workflow YAML consumes the classifier's selectors, but the classifier never becomes a second task graph.

## Plan shape

A plan records the validation mode, changed paths, affected components/packages/owned units, component-aware browser scopes, packed-package roots, semantic evidence classes, unknown paths, whether impact broadened repository-wide, and human-readable reasons for selected evidence.

The plan also exposes two diagnostic layers:

- `validationScopes` describes logical proof responsibilities such as port integration, browser behavior, cross-port conformance, packed public entrypoints, consumer verification, docs, visual, SSR and release intent. These are evidence labels, not commands or test-file lists.
- `executionPrerequisites` describes environment/build prerequisites required to execute selected evidence. Prerequisites are distinct from the evidence they enable.

Small CI selectors (`packageArtifactsRequired`, `browserRequired`, `docsRequired`, `releaseRequired`) remain coarse by design. `browserScopes` narrows targeted browser execution to affected component × port combinations, while `packageArtifactPackages` identifies package roots whose public/packed surfaces require verification.

Normal PR/Main/local modes classify the actual change. Shared canonical component evidence fans across implemented ports, port-local source stays component/port-local, Web component CSS fans through the component's real supported ports, package manifests/public entrypoints select packed API/consumer evidence for the affected package root, discovered reusable units fan to components that declare/import them, and unknown paths fail closed.

Known infrastructure follows explicit ownership when that ownership is narrow. The docs promotion workflow selects docs/workflow evidence; retention workflow/tooling remains repository-maintenance evidence. Shared validation orchestration, root build/package-manager/compiler configuration, impact infrastructure, unknown workflows and other genuinely global or uncertain changes broaden conservatively.

Scheduled and release modes deliberately broaden to the complete safety-net evidence set.

## Browser scopes

Targeted CI serializes component-aware browser scopes for the selected port lanes. `VF_COMPONENT_PORT` selects the framework/Web port and `VF_COMPONENTS` contains the comma-separated component subset. Playwright and fixture preparation use the same scope, preventing a local Button change from running every component supported by that port.

When `VF_COMPONENTS` is unset, browser execution remains broad. Scheduled/release validation intentionally uses that behavior.

## Package scopes

Targeted packed-package validation receives `VF_PACKAGE_SCOPE` from the semantic plan. `tooling/verify/package-artifacts.mjs` derives the selected package's internal dependency closure from the canonical package model, builds/packs that closure, and executes package/API/publint/ATTW/installed-consumer evidence. Scheduled/release omit the scope and continue to validate the full public package set.

## Local use

`pnpm impact:plan` computes the local plan from committed branch changes relative to `origin/main`/`main`, tracked working-tree changes, staged changes, and untracked files.

`pnpm check:changed` emits that same plan and delegates generic affected lint/typecheck/test/build execution to Nx. It is the fast local affected path; it does not pretend to execute every specialized semantic evidence class.

`pnpm validate:full` is the explicit broad/manual local safety-net command for repository checks, release intent, packed packages, docs, and the complete discovered browser-port × Chromium/Firefox/WebKit matrix. `pnpm test:browser:all-ports` derives ports from the package model rather than maintaining another port list. Local Playwright browser runtimes must already be available.

CI stores the semantic plan and a consolidated validation summary as reviewable evidence. The report exists so selectors, semantic fan-out, relevant skips and execution outcomes can be inspected rather than hidden in workflow path filters.
