# Overlay And Focus Foundation

`@vyrnforge/ui-components` owns the private overlay foundation used by Popover, Menu, Dropdown, Tooltip, Dialog, Drawer, and ConfirmDialog. It remains an implementation detail; applications consume the public components rather than internal portal or positioning helpers.

## Portal And Positioning

- Floating and modal content renders through a React portal to `document.body` by default. Public overlay props may accept `portalContainer` when an application needs a different DOM boundary.
- The internal anchored-positioning hook uses fixed positioning, `getBoundingClientRect`, viewport shifting, basic side flipping, scroll/resize listeners, and `ResizeObserver` when available.
- `Popover`, `Menu`, `Dropdown`, Tooltip, and future Autocomplete listboxes use this one anchored positioning path.
- Dynamic x/y and anchor-width values are passed as `--dv-overlay-*` CSS variables. Static visual rules remain in `styles/overlays/`.

## Overlay Stack And Dismissal

The internal overlay stack tracks mounted dismissable layers without an application store. Only the topmost layer responds to Escape, outside pointer, or optional outside-focus dismissal. Pointer detection uses capture-phase `pointerdown`, `composedPath` where available, and registered trigger branches so a trigger click does not immediately dismiss its own overlay.

- `Dialog`, modal `Drawer`, `Menu`, Dropdown, and Popover support Escape dismissal.
- Tooltip closes immediately on Escape while visible, but does not trap focus or lock scroll.
- Right-click does not cause outside-pointer dismissal.
- A child overlay is topmost while open, so its pointer and Escape events do not dismiss a parent layer.

## Focus And Modal Behavior

`FocusScope` is private shared behavior.

- Dialog and modal Drawer trap Tab and Shift+Tab inside the active modal, support `initialFocusRef`, and restore focus to the element that opened them when it still exists.
- Non-modal Popover does not trap focus or auto-focus its content by default. Modal Popover is explicitly opt-in.
- Menu focuses the first enabled menu item when opened and supports ArrowUp, ArrowDown, Home, End, Enter, Space, and Escape.
- Tooltip is descriptive only. It must not contain interactive controls and does not become a focus boundary.

## Scroll Lock

Dialog, modal Drawer, and ConfirmDialog lock `document.body` scrolling through a reference-counted internal lock. Nested modals keep the body locked until the final modal closes. The previous inline body overflow and padding values are restored afterward. Menus, tooltips, normal Dropdown, and non-modal Popover never lock body scrolling.

## Modal Versus Non-Modal Components

| Component | Default behavior | Focus trap | Scroll lock |
| --- | --- | --- | --- |
| Popover | Non-modal anchored content | No | No |
| Dropdown | Non-modal Popover composition | No | No |
| Menu | Non-modal action menu | Menu-item navigation only | No |
| Tooltip | Non-interactive description | No | No |
| Dialog | Modal | Yes | Yes |
| Drawer | Modal by default | Yes | Yes |
| ConfirmDialog | Dialog composition | Yes | Yes |

## Z-Index Hierarchy

Shared core tokens define the normal hierarchy:

| Token | Layer |
| --- | --- |
| `--dv-z-base` | Application content |
| `--dv-z-sticky` | Sticky shell regions |
| `--dv-z-dropdown` | Ordinary dropdown content |
| `--dv-z-popover` | Popovers and menus |
| `--dv-z-tooltip` | Tooltips |
| `--dv-z-overlay` | Modal overlay surfaces |
| `--dv-z-dialog` | Dialogs and modal drawers |
| `--dv-z-toast` | Toast notifications |

The active internal overlay stack adds a runtime ordering value so nested portal layers stay above their parent. AppShell header and sidebar remain below overlay portals.

## Future Autocomplete

Autocomplete must reuse the shared portal, dismissable layer, anchored positioning, and focus rules. It must not introduce a separate portal root, outside-click handler, or positioning engine. Its future combobox/listbox semantics are distinct from Menu and must be implemented as a dedicated accessibility task.
