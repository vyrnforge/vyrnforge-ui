# Component Presets And Aliases

- Task: SC-2102
- Status: Accepted capability contract
- Machine-readable source: `docs/metadata/component-presets.json`

## Purpose

Some public VyrnForge conveniences are not independent components. They are
named presets, input transforms, or small compositions over an existing
canonical component. Modeling them as separate renderers would duplicate
semantics and incorrectly turn compatibility exports into product hierarchy.

The preset contract records reusable intent once and lets each first-class
surface expose that intent idiomatically.

## Rules

A preset must name an existing canonical base component. Base defaults may only
target canonical properties on that component. Transform outputs must also
target canonical properties. Cross-surface semantics such as accessible-name,
tooltip, icon, or content-source behavior live in the preset contract rather
than a framework implementation.

Surface bindings describe how a first-class surface exposes the capability:
through the base component, a named compatibility export, or a composition
helper. A named export does not become a new canonical renderer.

Preset metadata may preserve a historical convenience API, but it may not
silently narrow the base component contract or override application-owned
business semantics.

## Initial capability set

SC-2102 records:

- `StatusBadge` as a status-to-`Badge.variant` transform;
- Clear, Close, More, and Refresh helpers as named `IconButton` presets;
- `ToastAction` as a compact `Button` composition with an accessible-name
  input.

These records preserve current React API behavior while making the underlying
semantics available to Native HTML / Custom Elements, Angular, and Vue without
requiring duplicate component implementations.
