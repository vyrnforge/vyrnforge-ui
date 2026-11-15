# Layer 6 — Complex UI & application-structure source ownership

Layer 6 owns reusable UI responsibilities that are materially larger than one self-contained widget: application structure, complex structured-data or hierarchical interaction systems, or compositions that coordinate multiple lower-layer interaction models as one reusable public concept.

The canonical source directory is `product/components/complex-ui/`. Stable component IDs and public package subpaths remain independent of this ownership taxonomy.

## Accepted current inventory

- `app-shell` — reusable application-region structure.
- `side-nav` — reusable grouped application/documentation navigation UI.

This is the complete accepted Layer 6 inventory on the current repository baseline. Future concepts such as DataGrid, TreeView, TreeGrid, TransferList, QueryBuilder, Calendar/DatePicker systems, CommandPalette, NavigationMenu, or NotificationCenter are candidates only. They do not become Layer 6 owners until a distinct reusable responsibility and evidence justify them.

## Not Layer 6

Patterns and workflows are not a seventh component layer and are not automatically Layer 6. Loading/recovery, forms/submission, search/filter/sort, CRUD/bulk operations, destructive-action handling, notification-selection rules, responsive task adaptation, identity/session, permissions, privacy/consent, and AI task flows belong under `product/patterns/` or consuming applications unless a separate reusable component responsibility is proven.

Layer 6 must not absorb routing engines, authentication, authorization enforcement, application stores, product data layers, or business workflows.
