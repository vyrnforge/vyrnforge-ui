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

## Evidence placement

Retained evidence should live with the current contract that consumes it rather
than in a generic archive:

- `docs/testing/` owns durable verification contracts and testing guidance;
- `docs/quality/` owns current quality policy, review records, and results that
  continue to support active claims;
- `docs/release/evidence/` owns immutable release-specific or external evidence;
- accepted ADRs own architectural decision history;
- Git and merged pull-request history remain the default archive for ordinary
  superseded task/program material.

A file should not be moved merely to make a directory look cleaner. Move or
retain evidence only when the destination makes its current owner and lifecycle
clearer.

## Generated material

Checked-in generated artifacts are not disposable merely because they can be
regenerated. Retain them when a current package, Reference surface, consumer,
test, or verification contract consumes the committed output.

A generated artifact may be removed only after its current consumer is retired
or changed and the generator/verification contract is updated accordingly.
Generated ownership follows
[Generated Source Ownership](generated-source-ownership.md).

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

Resolve conflicts by the owner of the fact rather than by whichever document was
edited most recently:

1. [Project Source Of Truth](01-project-source-of-truth.md) owns product identity,
   durable scope, and the source-authority map.
2. Accepted architecture decisions and current `docs/architecture/*` contracts
   own architecture decisions and technical boundaries.
3. Canonical package/API/release metadata and manifests own current implemented
   package, API, maturity, and release facts.
4. The Google Drive spreadsheet **VyrnForge Progress Tracker — Live Status** owns
   active execution, task status, dependencies, sequencing, and gates.
5. Package and component guidance may explain usage but cannot override the
   canonical owners above.
6. Active proposals may describe future targets only when clearly marked as
   proposed and must not be presented as implemented state.
7. Archived and historical evidence never overrides current guidance.

Future-target architecture and current implemented state must remain explicitly
distinguished when both are documented.

## Before removal or relocation

Before deleting, archiving, or moving documentation:

1. Check repository references and the documentation application's source discovery/bindings.
2. Confirm the material is not a canonical owner or required evidence source.
3. Update active links and source mappings first.
4. Run documentation verification and the affected documentation build.

See [Documentation System](../engineering/documentation-system.md) for the repository-wide documentation layers and ownership model.
