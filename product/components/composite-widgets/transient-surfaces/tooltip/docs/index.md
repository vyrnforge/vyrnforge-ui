# Tooltip

A compact, non-interactive description attached to a focusable trigger. Use Tooltip for supplementary context or to explain an icon; keep essential instructions visible.

## Appearance and placement

The surface uses regular-weight small text, theme-aware inverse colors, compact padding and a subtle shadow. The default placement is top; choose bottom, left, right or an aligned placement when it better fits the surrounding content. Native CSS anchor positioning flips or fits the surface near viewport edges. The surface is intentionally arrowless so fallback placement cannot leave a misleading pointer.

## Interaction and accessibility

Hover or focus reveals a description, Escape dismisses it without moving focus, and pointer users can move into the open content. The trigger has an accessible name independent of its tooltip. Tooltip content is not interactive; use Popover for actions and richer content. Touch users must not depend on hover to discover essential information. Forced colors retain system colors; reduced motion suppresses the reveal animation.

## Theme customization

Customize background, foreground, radius, font, maximum width and anchor offset through createTheme with the registered --vf-tooltip-background, --vf-tooltip-foreground, --vf-tooltip-radius, --vf-tooltip-font, --vf-tooltip-max-width and --vf-tooltip-offset tokens. Maintain contrast and avoid excessive offsets that make hover transfer difficult.

## Related controls

Slider value labels are numeric feedback, not descriptive tooltips. Use Slider's own valueLabelDisplay and formatValue options for numeric feedback.
