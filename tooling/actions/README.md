# GitHub Actions retention

VyrnForge treats workflow-run history as operational evidence, not permanent storage.

## Controls

1. Superseded pull-request and main validation runs are cancelled through workflow concurrency groups.
2. Every workflow artifact declares an explicit retention period appropriate to its evidence class.
3. `Actions Retention Audit` runs weekly and can be triggered manually. It reads workflow-run history and writes a machine-readable retention plan without mutating Actions history.
4. Cleanup policy is centralized in `retention-policy.json` and protected by repository tests.

## Retention classes

- PR validation: successful runs 30 days; failed/cancelled runs 7 days.
- Main validation: successful runs 60 days; failed/cancelled runs 14 days.
- Scheduled assurance: successful runs 45 days; failed/cancelled runs 14 days.
- Documentation deployment: successful runs 30 days; failed/cancelled runs 14 days.
- Release validation: successful runs 365 days; failed/cancelled runs 90 days.
- Dependabot/dynamic runs: successful runs 14 days; failed/cancelled runs 7 days.
- Unknown workflows fail conservative: successful runs 30 days; failed/cancelled runs 7 days.

Regardless of age, the planner preserves at least five recent completed runs and at least two recent successful runs per workflow. One cleanup execution may propose at most 100 deletions. Queued or in-progress runs and the currently executing retention run are never candidates.

## Destructive cleanup

The audit workflow is intentionally read-only. Enabling automatic deletion is a separate operational change because deleting workflow-run history is irreversible. The apply step should consume this same tested plan and requires `actions: write`; it must not weaken the preservation floors, release retention, or deletion cap.
