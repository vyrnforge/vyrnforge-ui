# Button Group

Group related commands without creating a new interactive control. Button Group is a composition pattern using existing compatible Button-family controls and layout styling, not an exported component.

## Separate actions

Use wrapping inline Flow when related commands should remain visually distinct. Give the primary action appropriate emphasis; keep supporting commands secondary or quiet.

## Horizontal joined actions

Apply `data-vf-button-group` to the parent of direct Button or ToggleButton children with no gap. The shared Button stylesheet joins adjacent borders. A named `role="group"` can communicate the relationship; it does not change each control's independent Tab stop or activation.

## Joined icon actions

Use the same group styling with square icon-only Buttons. Give each icon action its own accessible name, including when a group has a name. Do not rely on the artwork or the group name to identify the command.

## Joined toggle buttons

Compose actual ToggleButton controls in the same joined group. Each command retains its own pressed state and accessible name; combining formatting such as Bold and Italic does not require a group-level selection model. Load the public ToggleButton stylesheet, which includes the Button foundation.

## Mixed button types

Use the same composition for compatible ordinary Buttons and ToggleButtons. A one-shot action such as advancing to the next article does not become pressed merely because it shares a group with a persistent Bookmark command. The consuming application owns any coordination between actions.

## Vertical joined actions

Use `data-vf-button-group-orientation="vertical"` with block Flow for stacked joined commands. Joined horizontal groups do not wrap automatically. Prefer separate wrapping actions or vertical composition when space is constrained.

## Accessibility and behavior

Each child retains its own native Enter/Space activation, focus-visible styling, type, disabled and applicable pressed/loading semantics. Preserve individual names and Tab stops. Button Group does not add arrow navigation or selection. Use ToggleGroup for coordinated pressed choices, SegmentedControl for an exclusive value, or Toolbar for composite command navigation.

The consuming application owns action execution. Load the existing public Button and layout styles; there is no Button Group package entrypoint, separate stylesheet, or runtime API.
