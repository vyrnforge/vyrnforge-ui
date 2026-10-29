# Branch retention

Branch cleanup is repository maintenance automation. A branch becomes eligible when its head commit is at least 7 days old. Merge status and containment in the default branch are deliberately irrelevant: stale abandoned work may be removed even when it contains unique commits.

The default branch, GitHub-protected branches, `release/*`, `hotfix/*`, and every same-repository branch currently used as either the head or base of an open pull request are protected. The cleanup executor refreshes open pull requests and rechecks the branch SHA immediately before removal so a newly opened PR or a branch that moved during the run is skipped.

The scheduled workflow runs daily and may also be dispatched manually. Each run handles at most 25 eligible branches and uploads a JSON audit report. Failures are reported and fail the cleanup job; repository rules remain an additional enforcement boundary.
