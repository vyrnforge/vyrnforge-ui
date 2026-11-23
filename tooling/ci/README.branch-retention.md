# Branch retention

The daily repository cleanup is deliberately conservative. A branch is eligible for automatic removal only when its head commit is at least seven days old, it is not protected, and **either** its commits are contained in the default branch (`ahead_by === 0`) **or** the branch SHA exactly matches the head SHA of a merged pull request into the default branch. The latter supports squash merges without treating a mere PR branch-name match as evidence.

The default branch, GitHub-protected branches, `release/*`, `hotfix/*`, same-repository heads/bases of open pull requests, and branches associated with any closed **unmerged** pull request are excluded. Unknown comparisons, unavailable metadata, and unmerged unique commits are never eligible for automatic deletion; review them manually.

The executor uses bounded API concurrency and retries temporary GitHub rate limits. It refreshes open PRs and verifies the branch ref SHA immediately before deletion to avoid removing work that moved while the report was built. One execution deletes at most 25 branches.

Use the workflow-dispatch `dry_run` input (default `true`) to produce a report without removing records. Scheduled cleanup and merged-PR cleanup execute normally; the report records the candidate reasons and outcomes. GitHub permissions and branch rules remain an additional boundary.
