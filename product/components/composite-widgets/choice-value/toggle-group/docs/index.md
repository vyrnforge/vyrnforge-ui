# ToggleGroup

Use ToggleGroup for a named group of related pressed commands, such as formatting options or alternative view modes. The group coordinates selection; every item remains a native button with `aria-pressed`.

## Exclusive selection

Use single selection when at most one command can be pressed. Pressing the selected item again clears the choice. This is a toggle group, not a radio group.

## Multiple selection

Use multiple selection for independent formatting choices within one named group. Toggling an item changes only that item's membership in the selected values.

## Icon-only choices

For familiar view commands, use square icon-only items and give each a stable accessible name. The root also needs a name that describes the group's purpose.

## Required selection

Single selection normally permits an empty value. If the consumer task requires one selected command, keep the group controlled and reject an empty requested value. Use SegmentedControl instead when the task is a radio-like exclusive value rather than a collection of pressed commands.

## Layout and styling

The current public ToggleGroup stylesheet supplies a horizontal inline group, token-based medium sizing, inherited density, icon-only item geometry, and pressed, disabled and focus-visible styling. It does not expose dedicated size, vertical orientation or selected-color variant APIs. Do not present those as supported features.

## Accessibility

Use a named group and stable item values and names. Each enabled item is independently tabbable; Enter and Space activate it. Do not assume arrow-key or roving focus behavior. Keep disabled items inert and pressed state exposed. Native Web supplies static semantics and styling; coordinated selection is provided by the managed framework ports. Human assistive-technology acceptance remains separate from automated checks.
