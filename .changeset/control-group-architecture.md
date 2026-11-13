---
'@vyrnforge/web': major
'@vyrnforge/react': major
'@vyrnforge/angular': major
'@vyrnforge/vue': major
'@vyrnforge/elements': major
---

Replace the misleading L3 `InputGroup` contract with the framework-neutral `ControlGroup` composition primitive.

- Rename `InputGroup` / `VfInputGroupDirective` / `VfInputGroupElement` and the `data-vf-input-group` / `vf-input-group` hooks to their `ControlGroup` equivalents.
- Add `horizontal | vertical` orientation to the shared ControlGroup contract.
- Keep child controls independently responsible for value, activation, disabled state, size, variant, validation, focus, and form behavior.
- Do not propagate configuration through React context, Vue provide/inject, Angular DI, child cloning, or a shared runtime.
- Do not add semantic `role="group"` automatically; consumers author semantic grouping and accessible naming when the task requires it.
- Support button-only adjacency through ControlGroup rather than adding a separate ButtonGroup primitive.

Migration:

- `InputGroup` → `ControlGroup`
- `InputGroupProps` → `ControlGroupProps`
- `VfInputGroupDirective` / `vfInputGroup` → `VfControlGroupDirective` / `vfControlGroup`
- `VfInputGroupElement` / `vf-input-group` / `defineInputGroupElement` → `VfControlGroupElement` / `vf-control-group` / `defineControlGroupElement`
- `data-vf-input-group` → `data-vf-control-group`
