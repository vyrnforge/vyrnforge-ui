# Layer 2 — interactive control primitives

Layer 2 contains the smallest independently operable controls that own one distinct activation, navigation, editable value, selection, file-selection, or bounded-adjustment responsibility.

The approved inventory is:
- Activation: Button, ToggleButton
- Navigation: Link
- Entry: Input, Textarea
- Selection: Checkbox, Radio, Switch, NativeSelect, FileInput
- Adjustment: Slider

Native Web semantics remain authoritative. Framework adapters are justified only when they add useful framework ergonomics; they are not created for catalog symmetry.

Input owns the native single-value modes `text`, `email`, `password`, `search`, `tel`, `url`, `number`, `date`, `time`, `datetime-local`, `month`, `week`, and `color`. NumberInput, ColorInput, and TemporalInput are retired as separate concepts because they only fixed the native input type. FileInput remains distinct because native file selection exposes FileList, accept/multiple/capture and security-constrained form behavior that ordinary Input modes do not share.

Theme Toggle is not an L2 product unit. Theme preference is application policy composed from Switch/native checkbox-backed switch semantics plus the shared theme contract. Branded theme-toggle artwork belongs to the consuming application.

All retained controls use the L0 token/CSS/accessibility foundation: semantic `--vf-*` tokens, private `--_vf-*` calculations only when needed, low-specificity selectors, logical properties, `:focus-visible`, native state selectors, forced-colors support, reduced-motion handling, native directionality, and native form/keyboard/focus semantics.

Passing source discovery does not imply mature support. Evidence remains scoped to the exact reviewed revision and must cover applicable semantics, form behavior, keyboard/focus, accessibility, RTL, theme, forced colors, packaging, SSR and clean consumers.
