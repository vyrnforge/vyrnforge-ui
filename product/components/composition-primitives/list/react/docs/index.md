# React List

## React setup

Import List and ListItem from `@vyrnforge/react/list`. CSS-aware browser bundles can extract canonical `@vyrnforge/web/styles/list.css`; SSR applications must deliver the same stylesheet to the client. The React host emits native lists and list items with no local interaction state or effects.

## Composition with existing VyrnForge components

Use the existing Avatar, Text, Icon, Button, Link, Badge, and Flow controls inside rich rows. `leading` and `trailing` are layout slots, not icon registries, click handlers, or selected/disabled state. The examples intentionally compose real VyrnForge components instead of handcrafted substitutes. Controls own their own semantics and state.

## React state and server rendering

All row content and actions are consumer-owned. Passing different children or leading/trailing content updates ordinary React markup; List does not synchronize app data or emit selection intents. Rendering on a server is deterministic, and hydration requires no List-specific browser lifecycle. A full-row link may be authored as a Link inside the row, but the `li` itself must not be an artificial interactive target.
