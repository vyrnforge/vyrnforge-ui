# Document Lifecycle

## Lifecycle states

| State | Use when | Action |
| --- | --- | --- |
| Draft | New idea or incomplete plan | Keep in sprint or proposal docs. |
| Proposed | Needs review but has clear structure | Link from roadmap if likely. |
| Stable | Accepted as current direction | Link from docs index. |
| Deprecated | Replaced but still useful | Add replacement link. |
| Archived | Historical only | Move under `docs/archive/`. |

## Archive policy

Do not delete old docs immediately. Archive them.

Archive path:

```txt
docs/archive/yyyy-mm-topic-name/
```

Add this header:

```md
> Archived: This document was replaced by `<new-doc-path>` because `<reason>`.
```

## Stable documentation checklist

A stable document must:

- state its purpose
- state what it owns
- state non-goals
- link related docs
- avoid contradicting other stable docs
- be useful to a human developer
- be useful to an AI agent

## When docs conflict

Conflict resolution order:

1. `docs/governance/01-project-source-of-truth.md`
2. `docs/architecture/*`
3. `docs/roadmap/00-master-roadmap.md`
4. package README files
5. component-level docs
6. sprint/task docs
7. archived docs

Archived docs never override active docs.
