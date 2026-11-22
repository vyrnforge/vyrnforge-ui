# Badge

Badge displays a short label, numeric count, or small indicator alongside other content. It is noninteractive and does not make notifications, selection, account status, or workflow claims.

## When to use

Use Badge for concise contextual metadata such as Draft, New, or a consumer-provided count. Use ordinary Text when no reusable capsule treatment is needed; use TagGroup for managed tags and Button/Link for actions.

## Appearances

Text and numeric counts remain normal readable content. A dot is a visual indicator, not an accessible message by itself: it needs a meaningful consumer-authored accessible name, or must be explicitly decorative next to equivalent text. No status meaning is inferred from colors.

## Tone, size and shape

Neutral, accent and danger reuse existing semantic color roles. Success/warning are not presented until corresponding semantic token pairs have been accepted. The compact sizes are sm and md; shapes rounded and pill; variants subtle and outline. No hard-coded status palette, numeric overflow policy, or consumer color override API is introduced.

## Accessibility

Badges are not buttons, live regions, status messages, or focus targets. Text content is read normally. A named dot uses a single image-like accessible name while its painted dot is decorative; a decorative dot is hidden from assistive technologies and should accompany equivalent visible wording. Do not depend on color alone. Check contrast across light/dark/system themes, forced colors, high zoom, and RTL.

## Boundaries

Count clamping, localization, business status, notification delivery, links/actions, dismiss/removal, presence, and avatar badge overlays belong elsewhere. This component owns only its noninteractive presentation.

## Native Web markup

The separate Native Web documentation surface owns the HTML recipe, using `@vyrnforge/web/styles/badge.css` and `data-vf-badge` hooks. React consumers should use the public component rather than duplicating markup.
