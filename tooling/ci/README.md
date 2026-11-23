# CI operations

`tooling/ci/` owns operational repository automation rather than product validation. GitHub Actions YAML orchestrates it; validation planning remains under `tooling/impact/`.

## Repository retention

\`.github/workflows/actions-retention.yml\` runs after merged PRs and daily. It has **independent jobs** for workflow-run history and issue-unlinked stale branches. Run cleanup needs Actions write but only read-only repository contents; branch cleanup needs contents and Issues access but does not receive Actions write. Both jobs check out trusted default-branch code. A failure in branch inspection does not prevent the separate run-history job from executing.

A manual workflow dispatch defaults to \`dry_run: true\`; each job uploads its own JSON report with candidates, results and residual counts. The run-history policy is **six days** for every completed category: PR, main, docs, retention, scheduled, dynamic, release and unknown. In-progress/queued runs and the currently running cleanup run are not deleted. Superseded merged-PR runs can be pruned earlier, while their final successful evidence remains eligible for ordinary six-day expiry.

Each run-history batch deletes **at most 200** records and refreshes GitHub's run listing before planning the next batch. An execution permits **up to four batches** (maximum 800 deletions, subject to retries and the job's 20-minute timeout). The final refreshed listing must show no more eligible records; otherwise the job fails visibly with the remaining backlog in its report instead of claiming that configured policy equals verified retention. Rate-limited or failed deletion requests are also reported as errors. A later scheduled or merged-PR execution can continue the backlog; this policy is an operational enforcement attempt, not native provider-side hard expiry. An explicit manual \`pull_request\` input narrows the run job to that merged PR rather than performing the whole age sweep.

The repository's artifact limit was observed as **five days** in live Actions logs on November 23, 2026, so this workflow explicitly uploads reports for five days. Other workflows may have their own shorter effective artifact lifetime, independent of the run history. Repository settings remain the authority for the artifact maximum.

Deletion uses bounded sequential requests; GitHub API reads use capped concurrency and transient rate-limit retry/backoff. When branch inspection fails, the job reports failure rather than deleting branches on incomplete evidence. For branch-specific eligibility and protections, see [README.branch-retention.md](./README.branch-retention.md).

Do not place product verification, test runners, or workflow-specific one-off replacements here. Add CI tooling only when operationally reusable.
