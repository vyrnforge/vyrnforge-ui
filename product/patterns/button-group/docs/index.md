# Button Group

Group related commands without creating a new interactive control. Button Group is a composition pattern using existing Button and layout styling, not an exported component.

## Separate actions

Use wrapping inline Flow when related commands should remain visually distinct. Give the primary action appropriate emphasis; keep supporting commands secondary or quiet.

## Horizontal joined actions

Apply `data-vf-button-group` to the parent of direct Button children with no gap. The shared Button stylesheet joins adjacent borders. A named `role="group"` can communicate the relationship; it does not change each Button's independent Tab stop or activation.

## Joined icon actions

Use the same group styling with square icon-only Buttons. Give each icon action its own accessible name, including when a group has a name. Do not rely on the artwork or the group name to identify the command.

## Vertical joined actions

Use `data-vf-button-group-orientation="vertical"` with block Flow for stacked joined commands. Joined horizontal groups do not wrap automatically. Prefer separate wrapping actions or vertical composition when space is constrained.

## Accessibility and behavior

Each Button retains native Enter/Space activation, focus-visible styling, type, disabled and loading semantics. Preserve individual names and Tab stops. Button Group does not add arrow navigation or selection. Use ToggleGroup for coordinated pressed choices, SegmentedControl for an exclusive value, or Toolbar for composite command navigation.

The consuming application owns action execution. Load the existing public Button and layout styles; there is no Button Group package entrypoint, separate stylesheet, or runtime API.
