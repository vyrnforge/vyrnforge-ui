# Layer 3 — Composition primitive source ownership

`layout` is the aggregate package projection for the ten accepted L3 composition concepts: Stack, Inline, Cluster, Grid, Container, AspectRatio, Field, Fieldset, ControlGroup, and RadioGroup. It remains an aggregate entrypoint, not one semantic component and not a requirement that every concept have the same runtime representation in every port.

The implementation classes are deliberately different:

- core spatial primitives: Stack, Inline, Cluster, Grid, Container;
- layout utility: AspectRatio;
- structural form composition: Field;
- native-backed form/control relationships: Fieldset and RadioGroup;
- visual control adjacency: ControlGroup.

Native HTML wins when it already completes the semantic responsibility. In particular, Elements applications use native `<fieldset>` / `<legend>` plus the canonical Web data hooks for Fieldset and RadioGroup rather than `vf-fieldset` or `vf-radio-group` wrappers. Button-only adjacency stays within ControlGroup; there is no separate ButtonGroup primitive.
