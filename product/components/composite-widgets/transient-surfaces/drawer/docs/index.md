# Drawer

Drawer is an edge-attached modal panel composed over native Dialog.

## When to use

Use Drawer for focused settings or inspection that benefits from an edge panel. Do not use the modal Drawer for persistent navigation or nonmodal split views.

## Behavior and accessibility

Placement is start, end, top or bottom. Start/end follow document direction. Native dialog owns top-layer placement, modality and focus. Dismissal requests, controlled state, optional backdrop dismissal and focus restoration follow Dialog. Supply a visible DrawerTitle and a matching descriptionId when needed.

## Composition

Reuse DrawerClose as a native button and existing layout/controls inside DrawerBody. Do not add a separate scrim or global modal runtime.
