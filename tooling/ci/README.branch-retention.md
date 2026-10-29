# Branch retention

Branch cleanup is repository maintenance automation. A branch becomes eligible when its head commit is at least 7 days old. Merge status, containment in the default branch, and unique commits do not affect eligibility: stale non-protected branches are removed.

The default branch, GitHub-protected branches, `release/*`, `hotfix/*`, and every same-repository branch currently used as either the head or base of an open pull request are protected. The executor refreshes open pull requests and rechecks the branch SHA immediately before removal so a newly opened PR or a branch that moved during the run is skipped.

The repository retention workflow runs daily and may also be dispatched manually. Each run handles at most 25 eligible branches and records branch results in the retention audit report. Repository rules remain an additional enforcement boundary.
