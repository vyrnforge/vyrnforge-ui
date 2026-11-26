# Chip

Chips are compact labels for categories, attributes, filters, and small actions. Use them when a full-size button is unnecessary.

## Basic chip

The default filled chip emphasizes a label with a surface. Use the outlined variant for lighter visual emphasis. A static chip has no interactive role or tab stop.

## Actions

Use a native button for a command, a pressed button for persistent filter selection, and a native link for navigation. A removal action is an independently named sibling button; it never nests inside an action or link. The removal control uses the existing icon-only Button presentation. The default close mark uses a small, contrasting circular surface within a localized square native hit target of at least 24 by 24 CSS pixels. When a primary action exists, it covers the remaining Chip surface, including space above and below the removal target in multiline chips. The small amount of invisible padding around the close mark belongs to the removal control; it does not stretch into a trailing strip. Custom removal artwork is not wrapped in the default circle. Native Enter/Space activates buttons; Enter activates links. Disabled navigation removes its destination and tab stop. Selection can be controlled or uncontrolled; filtering and actual removal belong to the consumer. Restore focus when a removed chip owned focus.

## Adornment

Use a leading Avatar or Icon, or a trailing Icon, for redundant visual information. The visible text remains the accessible name. Adornments are decorative and noninteractive; the removal button owns its own accessible name.

## Colors

Neutral, accent, and danger map to current shared semantic theme roles. The filled accent uses the accent foreground and background pair; outlines preserve the readable text role. Do not use color alone to communicate meaning. The consumer can remap theme roles in a scope. Success, warning and info are tracked as a separate shared semantic token foundation.

## Sizes

Choose small, medium (default), or large. Chips use compact intrinsic sizing with token-derived geometry, not the weight and width of a standard command button. Interactive targets retain a minimum 24 CSS pixel size.

## Multiline

Labels normally stay on one line and truncate only when constrained. Enable wrapping for longer content; multiline chips use the shared control radius. Full text remains accessible in the DOM.

## Chip arrays

Use Flow for wrapping a collection of static labels. For removable collections use TagGroup's managed focus behavior or restore focus to the next or previous surviving control, or a stable collection control. Keep collection state outside Chip. Use ToggleGroup when its coordinated selection contract is appropriate.

## Playground

Try supported combinations of appearance, interaction, adornments and dismissal. The generated React usage follows the same state as the preview. The copy action has a selectable source fallback. The playground is a documentation example, not a new runtime.

## When to use

Use Chip for compact categories, filters and removable attributes. Use Badge for anchored indicators, Button for ordinary commands, Checkbox or Radio for form choice, and TagGroup for managed removable lists. No ChipGroup runtime is required.

## Accessibility

Static labels have no added role or tab stop. Native Enter/Space activates actionable, selectable and remove controls; Enter activates enabled links. Disabled links have no href and cannot navigate. Supply a meaningful visible label and a localized item-specific removal label. Slots must be noninteractive and redundant to the visible label. Do not hide or truncate the only way to discover a consequential label; allow wrapping or expose its full text in surrounding content. Preserve visible focus, 24px minimum action targets, logical RTL order, text scaling, reduced motion and forced colors. A selected chip uses both aria-pressed and a visible mark, not color alone. Never add automatic live regions or group keyboard semantics.

## Boundaries

Chip has no collection policy, submit action, automatic deletion, new palette, new animation system or cross-framework runtime. Other ports require separate implementation and evidence.
