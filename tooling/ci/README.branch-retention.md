# Branch retention

The repository cleanup removes an old branch **when it has no traceable GitHub Issue**. The stale threshold is seven days since the branch HEAD commit (not creation date). A closed pull request does **not** count as a GitHub Issue by itself. A stale branch without an issue can be deleted whether its commits were merged, squash-merged, unmerged, or ahead of the default branch. This is the explicit repository-maintenance policy adopted on 23 November 2026.

## Issue-link evidence

Cleanup checks all GitHub Issues, including closed issues, without treating pull requests as issues. The workflow token explicitly requires `issues: read`; if GitHub returns no real Issues, deletion fails closed instead of assuming every branch is orphaned. It preserves a branch when an existing issue is referenced in the branch name (for example `qa/...-1397`), in an issue title/body that includes the exact branch name, in a matching branch pull request's title/body, in the branch HEAD commit message, or when an issue explicitly references that pull request. Generic numeric text does not count unless its number resolves to a real GitHub Issue.

An incomplete issue index or unavailable commit metadata **never** authorizes deletion. The issue index is refreshed before executing deletions.

## Non-negotiable protection

The default branch, GitHub-protected branches, `release/*`, `hotfix/*`, and same-repository heads/bases of open PRs remain protected. Open PRs and branch SHA are rechecked immediately before each removal. Deleted branch names and their precise HEAD SHAs are included in the cleanup JSON report for traceability; deleting a Git ref is not a guarantee that GitHub has purged all underlying objects, PR refs, logs, or commit history.

The scheduled workflow runs daily, and successful pull-request merges also run the orphan-branch sweep. Each execution deletes at most 100 old untracked branches. GitHub repository rules remain an additional enforcement boundary.

A manual `workflow_dispatch` defaults to `dry_run: true`, emitting a deletion plan without removing records. Scheduled and merged-PR-triggered execution both remove eligible orphan branches; merged PR history cleanup remains bounded separately.
