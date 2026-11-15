# Transitional anchored-surface runtime

This directory is an explicit quarantine for browser/runtime code that remains necessary while GitHub issue #1280 migrates anchored and transient surfaces to their final owners.

It is **not** a Product Graph capability, Layer 4 unit, general Web foundation, or approved overlay subsystem.

Current contents:
- `floating-positioning/` — legacy JavaScript placement/measurement/update implementation.
- `dismissal-coordination/` — legacy document-listener dismissal coordinator.

Rules:
- Do not add new consumers unless required to preserve existing behavior during migration.
- Do not expand these modules into a global overlay manager, layer stack, focus manager, portal runtime, or lifecycle controller.
- Prefer HTML Popover/browser behavior, CSS Anchor Positioning, component-owned policy, and port-local execution according to AD-13.
- Residual JavaScript fallback should move toward the smallest private component/port owner.
- Remove this directory and the temporary public export mappings when issue #1280 completes.
