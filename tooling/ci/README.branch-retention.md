# Branch retention

The branch-retention planner is intended for repository maintenance automation. It protects the default branch, GitHub-protected branches, release and hotfix prefixes, and every same-repository branch currently used as either the head or base of an open pull request.

Scheduled cleanup uses a 30-day stale threshold and requires evidence that the branch was merged through a pull request or has no commits ahead of the default branch. Cleanup is capped at 25 branches per run. A merged pull-request event may select only that pull request's own head branch, and stacked pull-request bases remain protected.

The planner is deliberately separate from the execution mechanism so selection policy remains unit-testable and reviewable.
