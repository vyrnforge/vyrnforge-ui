# Application structures — source ownership

Application structures own reusable application-region and navigation relationships. Classify by the structural responsibility, not by component size or number of composed controls.

The canonical source directory is `product/components/application-structures/`. Stable component IDs, public package subpaths and documentation routes are independent of this taxonomy.

## Accepted current inventory

- `app-shell` — reusable application-region structure.
- `side-nav` — reusable grouped application/documentation navigation UI.

These existing structures retain their current contracts. A focused contract/API review is separate from the ownership migration. Optional advanced products (such as specialized structured-data, scheduling, authoring, visualization, document or media capabilities) require separate product admission, build-versus-integrate and accessibility/maintenance decisions. They are not implied by this directory.

## Boundaries

Patterns and workflows own reusable task guidance, composition and evidence under `product/patterns/`: loading/recovery, forms/submission, search/filter/sort, CRUD/bulk operations, destructive actions, feedback selection, adaptive tasks, identity/session, permissions, privacy/consent and AI task flows. Admit a distinct component only when a reusable structural or behavioral contract is proven.

Application structures do not own routing engines, authentication, authorization enforcement, application stores, data layers or business workflows. Applications remain responsible for those concerns.

Preserve native semantics, shared CSS and idiomatic framework integration. Source discovery does not establish maturity or release readiness.
