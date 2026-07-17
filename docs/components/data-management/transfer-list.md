# TransferList

`TransferList` is an experimental dual-list assignment component in `@vyrnforge/ui-components`.

Use it when users choose a subset from a bounded known collection and need to see available and assigned items at the same time.

Do not use it as a replacement for `UniversalDataGrid`, complex IAM permission catalogs, server-paginated resource selection, or approval workflows that need impact preview and audit review.

## Import

```tsx
import { TransferList } from "@vyrnforge/ui-components";
```

## Value Contract

`value` and `defaultValue` represent the target or assigned panel.

```tsx
<TransferList
  options={[
    { value: "iam", label: "Identity and Access Management" },
    { value: "analytics", label: "Analytics Workspace" }
  ]}
  defaultValue={["analytics"]}
/>
```

Rules:

- option `value` uniquely identifies the item
- option `label` is plain text and remains the accessible name
- duplicate selected values are normalized
- selected values not present in `options` are ignored visually
- both panels follow the original `options` order
- disabled options remain visible but cannot be selected or moved

## Transient Selection

Panel checkbox selections are transient UI state. They are not the submitted value and are not persisted by the component.

The component tracks source selection, target selection, source query, and target query separately from `value`.

Filtering does not clear hidden selections. Moving selected items moves all selected enabled values in that panel, including selected values hidden by the current filter.

## Filtering

Set `searchable` to show independent source and target search inputs.

Default filtering is local, case-insensitive, trims the query, and matches labels plus optional `keywords`.

Use `filterOptions` for application-owned local filtering. Backend search, pagination, caching, and retry behavior remain outside TransferList.

## Moving Items

Transfer actions move enabled options only.

- Move selected to assigned
- Move selected to available
- Move all enabled source options to assigned
- Move all enabled target options to available

`moveAll={false}` hides the all-item actions. `clearSelectionAfterMove` defaults to `true`.

## Form Submission

When `name` is provided, TransferList renders one hidden input per assigned value using repeated field names.

```html
applicationIds=iam
applicationIds=analytics
```

Disabled TransferList instances do not submit hidden values. Read-only instances remain submitted but cannot be changed.

## Accessibility Model

TransferList intentionally uses labelled groups, native checkboxes, and native buttons.

It does not use `role="listbox"` because this first release prioritizes reliable native checkbox behavior over a custom desktop-style multiselect widget.

Keyboard behavior:

- Tab moves through search fields, select-visible controls, checkboxes, and transfer buttons.
- Space toggles focused checkboxes.
- Enter activates focused transfer buttons.
- Ctrl/Cmd+A inside a panel selects all visible enabled items.
- Escape clears the focused panel search when a query is present.

## Responsive Behavior

Wide layouts show source, actions, and target side by side. Narrow layouts stack the panels and keep actions between them.

Panel option lists scroll internally. TransferList does not implement virtualization in this release.

## Limitations

TransferList does not implement:

- server pagination
- internal fetching
- virtualization
- drag-and-drop
- target reordering
- grouping
- hierarchical or tree transfer
- custom option creation
- nested interactive row content
- data-grid mode

Use `UniversalDataGrid` or a dedicated assignment page when data is large, server-managed, permission-heavy, or requires approval/audit context.
