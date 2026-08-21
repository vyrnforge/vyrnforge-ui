# Document Lifecycle

## Lifecycle states

| State      | Use when                                                      | Action                                                                          |
| ---------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Draft      | New idea or incomplete plan                                   | Keep close to the active proposal or work item; do not present it as canonical. |
| Proposed   | Needs review but has clear structure                          | Link from current planning only when it is actively being considered.           |
| Stable     | Accepted as current direction                                 | Link from the appropriate canonical index or owner.                             |
| Deprecated | Still needed during a migration or compatibility period       | Mark the replacement and expected removal conditions.                           |
| Archived   | Historical material with continuing evidence or context value | Move under `docs/archive/` and clearly mark the replacement.                    |
| Deleted    | Obsolete material with no continuing repository value         | Remove it; Git history remains the recovery path.                               |

## Retention decision

Do not archive files merely because they once existed.

Archive a replaced document when it remains useful for one or more of these reasons:

- audit or release evidence;
- migration history;
- regression investigation;
- accepted architectural history not already preserved by an ADR;
- an important historical decision whose original context is still useful.

Delete a replaced document when it is only:

- a completed one-time prompt or implementation instruction;
- a stale task/sprint note with no continuing policy or evidence value;
- an exact or near-exact duplicate of a canonical source;
- a generated or copied artifact that can be reproduced;
- a pointer-only archive that adds no historical information beyond Git history.

Do not delete legal text, accepted ADR history, evidence required by release or verification policy, or material still referenced by active code or documentation.

## Archive policy

When archival is justified, use:

```txt
docs/archive/yyyy-mm-topic-name/
```

Add a clear note identifying the replacement and why the historical copy is retained, for example:

```md
> Archived: Replaced by `<new-doc-path>`. Retained for `<audit/migration/architecture reason>`.
```

Archived documents are historical evidence, not alternate current guidance.

## Stable documentation checklist

A stable document must:

- state its purpose;
- state what it owns;
- state non-goals where ambiguity is likely;
- link related canonical docs;
- avoid contradicting other stable docs;
- avoid duplicating inventories already owned by metadata or code;
- be useful to a human developer;
- be discoverable and interpretable by an AI agent without creating an AI-only source of truth.

## When docs conflict

Conflict resolution order:

1. `docs/governance/01-project-source-of-truth.md`
2. accepted architecture decisions and current `docs/architecture/*` contracts
3. canonical current package/API/release metadata and manifests for implemented state
4. `docs/roadmap/00-master-roadmap.md` for program execution and future work
5. package README files and component-level guidance
6. active proposals or task documents
7. archived and historical evidence

Future-target architecture and current implemented state must remain explicitly distinguished when both are documented.

Archived documents never override active docs.

## Before removal or relocation

Before deleting, archiving, or moving documentation:

1. Check repository references and the documentation application registry.
2. Confirm the material is not a canonical owner or required evidence source.
3. Update active links and route/source mappings first.
4. Run documentation verification and the affected documentation build.

See [Documentation System](../engineering/documentation-system.md) for the repository-wide documentation layers and ownership model.
