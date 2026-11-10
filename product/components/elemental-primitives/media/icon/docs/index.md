# Icon

Icon is the genuine visual primitive in the Layer 1 Media family. It renders reusable SVG artwork but does not own interaction.

## Artwork contract

`IconDefinition` and `defineIcon(...)` from `@vyrnforge/web/icon` define framework-neutral SVG artwork. The optional `@vyrnforge/icons` package provides first-party glyph definitions; renderer packages remain independent from that catalog.

The public presentation axes are variant `outlined | filled`, shape `rounded | sharp`, and size `sm | md | lg`.

## Native Web

Load `@vyrnforge/web/styles/icon.css` and author SVG markup using the stable `data-vf-icon` contract. Icon inherits `currentColor` from its owning component or surrounding content.

## Accessibility

Icons are decorative by default and should be hidden from assistive technology. When an icon itself carries standalone meaning, provide an explicit accessible label and expose image semantics. VyrnForge does not invent labels.

When Icon appears inside an already named Button, Link, or other interactive owner, the interactive component owns the accessible name and Icon remains decorative. Icon itself is not focusable or interactive.
