# Validation reporting

`tooling/validation/` owns repository-level reporting that turns an already-generated semantic impact plan plus executor outcomes into inspectable validation evidence.

It does **not** classify product impact, select tests, schedule commands, own the Nx project graph, run browsers, verify packages, define component acceptance criteria, or replace GitHub Actions orchestration. Those responsibilities remain with `tooling/impact/`, Nx, Playwright, package/docs/release verifiers, product owners, and workflow configuration respectively.

## Evidence summary contract

`tooling/validation/summarize.mjs` consumes the immutable semantic plan produced for the validated revision, the observed results of the selected executor families, and optional exact-revision executor metric records. It writes both machine-readable JSON and a reviewer-readable Markdown summary under `test-results/validation-summary/`.

The summary records:

- validated revision and mode;
- changed paths and affected product nodes;
- component × browser-port scopes;
- package-artifact roots;
- selected and relevant skipped logical validation scopes;
- execution prerequisites from the plan;
- selected evidence outcomes;
- retained executor timing/setup observations where available;
- prerequisite cache/artifact reuse observations where available; and
- an overall pass/fail disposition.

Metric records with an explicit revision must match the revision being summarized. Timing is diagnostic evidence for optimization decisions; it never weakens, invents, or reclassifies a required validation scope.

The summary must never reinterpret a skipped required scope as passing, and it must not manufacture product semantics or manual assistive-technology/usability evidence from automated results. Partial summaries should still be written when selected evidence fails so CI selection and failure provenance remain inspectable.

## Browser prerequisite reuse

Browser validation keeps component/port assertions isolated while reusing only measured execution prerequisites:

1. the browser executor provisions the widest browser-binary set required by the selected tier once and retains it in a lockfile-keyed Playwright cache;
2. Nx remains the producer of package build outputs and performs the shared browser prerequisite build once;
3. those `packages/*/dist` outputs are archived in a run-scoped artifact named for the exact validated revision;
4. each browser port/component lane restores the exact-revision build artifact, prepares its own selected fixtures, runs its own browser assertions, and retains its own evidence and timing record;
5. runner-specific browser OS dependencies remain lane-local because they are machine prerequisites rather than portable product artifacts.

The Nx local cache is deliberately **not** copied between GitHub-hosted runners. Cross-machine local-cache transfer would bypass Nx's current cache-integrity boundary. Until VyrnForge adopts a supported Nx remote-cache mechanism, exact build outputs—not the local Nx cache—are the reusable artifact boundary.
