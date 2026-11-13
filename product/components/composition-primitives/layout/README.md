# L3 Composition Primitives

Layer 3 owns reusable **structural composition**: arrangements and adjacency relationships that are broader than one control but do not own semantic state, native form behavior, composite keyboard models, or application workflow.

The accepted L3 public inventory is deliberately small:

- **Stack**
- **Inline**
- **Cluster**
- **AutoGrid**
- **Container**
- **ControlGroup**

The inventory is derived from responsibility, not preserved from the historical catalog.

## Spatial composition

### Stack

Stack arranges related children in block flow with shared spacing, cross-axis alignment, and main-axis justification.

It owns layout only. Consumers choose the semantic host.

### Inline

Inline arranges related children in one non-wrapping inline row.

Use Cluster when wrapping is part of the required composition.

### Cluster

Cluster arranges related children in inline flow and wraps them as available space changes.

It is appropriate for groups such as actions, metadata, tags, or other peer content where wrapping is structural rather than behavioral.

### AutoGrid

AutoGrid lays out repeated peers in equal flexible tracks using an intrinsic `auto-fit/minmax` algorithm.

The name is intentionally **AutoGrid**, not generic `Grid`: it does not model arbitrary CSS Grid track systems. The public `--vf-auto-grid-min-item-size` component token controls the intrinsic minimum item size; specialized grid templates remain ordinary CSS Grid owned by the consumer.

### Container

Container constrains content width, centers it, and applies logical inline gutters.

It does not own page-shell semantics or routing/application structure.

## Control adjacency

### ControlGroup

ControlGroup visually joins adjacent **independently operable** controls in horizontal or vertical orientation.

Each child retains its own:

- semantics and accessible name;
- value/state;
- disabled/read-only/validation behavior;
- focus and activation;
- size/variant contract;
- native form participation.

ControlGroup adds no `role="group"`, shared value, roving focus, selection controller, child cloning, framework context, or inherited control configuration.

Button-only adjacency is valid and does not justify a ButtonGroup primitive. If the controls share one-of-many selection, pressed-state selection, or managed command navigation, use the semantic owner of that behavior instead: native radio grouping, ToggleGroup, Toolbar, SegmentedControl, or another appropriate higher-layer component.

## Explicit non-L3 dispositions

### AspectRatio

AspectRatio is **not an L3 primitive**. Modern CSS `aspect-ratio` already owns this responsibility directly.

Use ordinary CSS, for example:

```css
.media-frame {
  aspect-ratio: 16 / 9;
}
```

VyrnForge does not wrap a single native CSS property merely to create framework/catalog symmetry.

### Field

Field is **not a public L3 primitive** at this baseline. The retired implementation owned only grid spacing and did not own label/control/help/error relationships.

Use semantic labeling/description markup plus Stack for spacing. The Forms & Submission Patterns contract owns form-field UX relationships. A future Field component requires a separate contract proving a relationship responsibility that Stack plus native HTML cannot express cleanly.

### Fieldset

Fieldset remains **native HTML**, not a VyrnForge L3 component. Use real `<fieldset>` and `<legend>` so grouping, legend semantics, descendant disabled propagation, and native form behavior remain platform-owned.

VyrnForge does not expose `Fieldset`, `vfFieldset`, `vf-fieldset`, or `data-vf-fieldset` as L3 APIs.

### RadioGroup

Native radios already obtain selection and keyboard behavior from the browser through their shared `name`. Semantic grouping uses native `<fieldset>/<legend>`; layout uses Stack or Cluster.

Therefore the former L3 RadioGroup wrapper is retired. A future custom radio-group component would need to own real selection/interaction behavior and would be reviewed as a higher-layer composite rather than reintroduced as a layout alias.

## Framework surfaces

Canonical Web hooks are the shared styling contract:

- `data-vf-stack`
- `data-vf-inline`
- `data-vf-cluster`
- `data-vf-auto-grid`
- `data-vf-container`
- `data-vf-control-group`

React and Vue expose semantic-host-capable convenience components. Angular exposes host directives so authored semantic HTML remains the DOM owner.

There is intentionally **no `@vyrnforge/elements/layout` runtime entrypoint**. An application that otherwise uses VyrnForge Custom Elements composes layout with semantic/native HTML plus the canonical Web hooks. Adding `vf-stack`, `vf-container`, or similar wrapper elements would add DOM structure without adding semantics or behavior.

## Admission rule

Do not add Box, Flex, Row, Column, Wrap, Spacer, Center, ButtonGroup, or another familiar design-system noun merely for catalog completeness.

A new L3 primitive must own a distinct, reusable structural composition responsibility that cannot be expressed cleanly by:

1. native HTML semantics;
2. ordinary CSS;
3. the six existing L3 primitives;
4. a lower-layer control;
5. a higher-layer composite or pattern.

L3 does not own routing, application state, validation engines, form state, selection controllers, toolbar navigation, overlays, application shells, or product workflows.
