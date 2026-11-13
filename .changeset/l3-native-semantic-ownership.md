---
'@vyrnforge/web': major
'@vyrnforge/elements': major
---

Correct Layer 3 semantic ownership in the rebuild.

- Remove the `vf-fieldset` and `vf-radio-group` Custom Element wrappers and their registration helpers. Elements applications use real native `<fieldset>` / `<legend>` markup with the canonical `data-vf-fieldset` and `data-vf-radio-group` Web hooks instead.
- Keep Fieldset and RadioGroup as public composition concepts without requiring runtime representation symmetry across ports.
- Keep ControlGroup presentation-only and explicitly reject a redundant ButtonGroup alias; behavioral button sets belong to RadioGroup, ToggleGroup, Toolbar, or another component that owns the actual state/keyboard contract.
- Replace the misleading text-alignment ControlGroup example with independently operable search controls.

Migration:
- `<vf-fieldset gap="…">…</vf-fieldset>` → `<fieldset data-vf-fieldset data-vf-fieldset-gap="…"><legend>…</legend>…</fieldset>`
- `VfFieldsetElement` / `defineFieldsetElement` are removed.
- `<vf-radio-group gap="…" orientation="…">…</vf-radio-group>` → `<fieldset data-vf-radio-group data-vf-radio-group-gap="…" data-vf-radio-group-orientation="…"><legend>…</legend>…</fieldset>`
- `VfRadioGroupElement` / `defineRadioGroupElement` are removed.
