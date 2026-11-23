# CI operations

`tooling/ci/` owns operational repository automation rather than product validation. GitHub Actions YAML orchestrates it; validation planning remains under `tooling/impact/`.

## Repository retention

`.github/workflows/actions-retention.yml` runs after merged PRs and daily. Manual workflow dispatch defaults to `dry_run: true` and uploads a JSON report with deletion candidates, preserved entries, reasons, and outcomes. The script distinguishes workflow-run record retention from the repository's separate artifact retention setting.

The production run-history policy is six days for all completed workflow categories, including main, docs, retention, scheduled, dynamic, PR and release. The latest successful merged-PR validation is retained during immediate merged-history sweeps but eventually expires through the six-day age sweep. No completed history is indefinitely protected by category or minimum-run count. In-progress/queued runs and the currently running cleanup run are not deleted. A maximum of 500 run records are removed per invocation.

The repository's artifact limit was observed as **five days** in live Actions logs on November 23, 2026, so this workflow explicitly uploads reports for five days. Other workflows may have their own shorter effective artifact lifetime, independent of the run history. Repository settings remain the authority for the artifact maximum.

Deletion uses bounded sequential requests; GitHub API reads use capped concurrency and transient rate-limit retry/backoff. When branch inspection fails, the job reports failure rather than deleting branches on incomplete evidence. For branch-specific eligibility and protections, see [README.branch-retention.md](./README.branch-retention.md).

Do not place product verification, test runners, or workflow-specific one-off replacements here. Add CI tooling only when operationally reusable.
