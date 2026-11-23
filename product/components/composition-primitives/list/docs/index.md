# List

List is an ordered or unordered **semantic collection with rich rows**. It retains native `ul`/`ol` and `li` semantics while providing token-backed leading, content, and trailing regions. It is useful for people, resources, activity summaries, settings rows, and other scannable collections.

## When to use

Use List when rows need composed content, supporting text, identity imagery, metadata, or independent actions. Use the native `ul`/`ol` presentation when no extra visual composition is necessary. List does not own selection, typeahead, roving focus, application navigation, data retrieval, pagination, filtering, or loading state. Use Listbox for selectable options, Menu for command navigation, SideNav for destinations, and actual Button/Link/Checkbox controls for row actions.

## Anatomy and reuse

A List host contains ListItem children. Each ListItem is a native `li` with optional leading and trailing slots and authored body content. Compose existing Avatar, Icon, Image, Text, Badge, Button, Link, and layout components as needed. The slots position content; they do not replace those components or synthesize accessible names. Multiple controls in a row retain their own native tab stops and focus indicators. Do not make the entire row a button by adding `onClick` to `li`.

## Variants, sizing and spacing

The visual variants are `plain` (default), `divided` (between rows) and `bordered` (outlined group with separators). Sizes `sm`, `md` (default) and `lg` affect row padding, not the size of nested Avatar or Button. Explicit `spacing` values `none`, `sm`, `md` and `lg` add inter-row room. Inherited comfortable/compact density adjusts default row padding without replacing explicit size or spacing. `marker="none"` is the rich-row default; `marker="auto"` displays bullet or numeral markers according to the native list host. `as="ol"` preserves order and supports native `start` where appropriate.

## Accessibility and states

The list remains a list in the accessibility tree, including when CSS removes markers. Labels and text are authored by consumers and may be localized. Ordered meaning must use `ol`, not visual numbering on an unordered list. No custom keyboard model or focus movement is added: Tab follows actual interactive children, Enter/Space activation belongs to their native controls. A disabled or busy action must express that on the actual Button/Link or other control; ListItem itself has no false `disabled`, `selected`, or `loading` state. Empty/error/loading placeholders should be authored outside the collection, with their own appropriate status semantics. Ensure actions retain accessible names, adequate targets and visible focus.

## Responsive and design constraints

Leading/body/trailing regions wrap at narrow widths without reordering the DOM. Logical padding follows RTL direction. Shared tokens own borders, surfaces, spacing, and density. No pointer affordance, selection color, animation, implicit live region, or application state is introduced. Forced-colors uses visible borders. Human visual and assistive-technology acceptance require separate evidence.

## Native semantic baseline

The shared CSS works on authored `<ul data-vf-list data-vf-list-variant="divided" data-vf-list-size="md" data-vf-list-spacing="none" data-vf-list-marker="none" role="list">` containing `<li data-vf-list-item>` elements with `data-vf-list-item-layout`, `data-vf-list-item-leading`, `data-vf-list-item-content` and `data-vf-list-item-trailing`. This is a structural baseline for the shared framework-neutral contract, not an additional Native Web documentation rollout.
