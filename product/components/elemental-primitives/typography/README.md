# Layer 1 Typography

Typography is the shared Layer 1 family for textual presentation.

## Ownership

- **Text** — general textual semantics plus an explicit visual typography role.
- **Code** — specialized native code/pre presentation that reuses the shared typography scale while retaining monospace/code-surface treatment.
- **Kbd** — specialized native keyboard-input presentation that reuses the shared typography scale while retaining monospace/keycap treatment.

Native textual semantics such as headings, paragraphs, quotations, emphasis, annotations, and textual metadata are not separate product units. Approved semantics are hosted by Text or authored directly inside scoped prose.

Interactive semantics, form relationships, disclosure behavior, lists/figures/tables, and editable code experiences remain outside Typography ownership. They may consume Typography presentation without transferring their semantic or behavioral ownership to it.

Native Web CSS and tokens are the shared presentation source of truth. Framework ports expose the same contract idiomatically and must not create independent typography systems.
