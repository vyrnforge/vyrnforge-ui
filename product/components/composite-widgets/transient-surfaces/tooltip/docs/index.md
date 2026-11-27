# Tooltip

A compact, non-interactive description attached to a focusable trigger. Use Tooltip for supplementary context or to explain an icon; keep essential instructions visible.

## Appearance and placement

The surface uses regular-weight small text, theme-aware inverse colors, compact padding and a subtle shadow. The default placement is top; choose bottom, left, right or an aligned placement when it better fits the surrounding content. Native CSS anchor positioning flips or fits the surface near viewport edges. The default is arrowless. Enable an optional decorative arrow to point toward the trigger. The shared Web arrow connection reads the actual resolved surface geometry after native collision fallback; it never positions the surface. A constrained scrollable or overlapping surface may suppress the pointer rather than draw a misleading one.

Sizes sm, md and lg use regular 12px, 14px and 16px text at the default root size, with proportionate shared spacing. The default arrow depths are 4px, 5px and 6px. Arrow clearance adds to the surface offset so the arrow tip maintains the requested gap. Aligned placements respect RTL.

## Interaction and accessibility

Hover or focus reveals a description, Escape dismisses it without moving focus, and pointer users can move into the open content. The trigger has an accessible name independent of its tooltip. Tooltip content is not interactive; use Popover for actions and richer content. Touch users must not depend on hover to discover essential information. Forced colors retain system colors; reduced motion suppresses the reveal animation.

## Customization

Customize background, foreground, radius, font, maximum width anchor offset and arrow size through createTheme with the registered --vf-tooltip-background, --vf-tooltip-foreground, --vf-tooltip-radius, --vf-tooltip-font, --vf-tooltip-max-width --vf-tooltip-offset and --vf-tooltip-arrow-size tokens. Defaults: inverse semantic text/surface colors; control radius; regular 0.875rem text with normal line height and control font family; maximum width 16rem; and 0.25rem clearance. Colors accept CSS colors, radius/maximum width/offset/arrow size accept CSS lengths, and font accepts a complete CSS font shorthand. Maintain contrast and avoid excessive offsets that make hover transfer difficult.

## Related controls

Slider value labels are numeric feedback, not descriptive tooltips. Use Slider's own valueLabelDisplay and formatValue options for numeric feedback.

## Native Web

Use data-vf-size on the content to select sm, md or lg. For an authored native manual popover, set data-vf-arrow and call connectTooltipArrow(surface, trigger) from @vyrnforge/web/tooltip after opening with showPopover({ source: trigger }); invoke the returned cleanup on close or removal. The framework adapters manage this connection automatically. Angular and Vue expose size and arrow on their content parts; Elements exposes size and arrow attributes on vf-tooltip.
