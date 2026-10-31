# Validation reporting

`tooling/validation/` owns repository-level reporting that turns an already-generated semantic impact plan plus executor outcomes into inspectable validation evidence.

It does **not** classify product impact, select tests, schedule commands, own the Nx project graph, run browsers, verify packages, define component acceptance criteria, or replace GitHub Actions orchestration. Those responsibilities remain with `tooling/impact/`, Nx, Playwright, package/docs/release verifiers, product owners, and workflow configuration respectively.

## Evidence summary contract

`tooling/validation/summarize.mjs` consumes the immutable semantic plan produced for the validated revision and the observed results of the selected executor families. It writes both machine-readable JSON and a reviewer-readable Markdown summary under `test-results/validation-summary/`.

The summary records:

- validated revision and mode;
- changed paths and affected product nodes;
- component × browser-port scopes;
- package-artifact roots;
- selected and relevant skipped logical validation scopes;
- execution prerequisites from the plan;
- selected evidence outcomes; and
- an overall pass/fail disposition.

The summary is diagnostic evidence. It must never reinterpret a skipped required scope as passing, and it must not manufacture product semantics or manual assistive-technology/usability evidence from automated results.

Partial summaries should still be written when selected evidence fails so CI selection and failure provenance remain inspectable.
