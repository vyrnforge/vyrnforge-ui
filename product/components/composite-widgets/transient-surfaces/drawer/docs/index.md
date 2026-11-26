# Drawer

Drawer is an edge-attached modal panel composed over native Dialog.

## When to use

Use Drawer for focused settings or inspection that benefits from an edge panel. Do not use the modal Drawer for persistent navigation or nonmodal split views.

## Behavior and accessibility

Placement is start, end, top or bottom. Start/end follow document direction. Native dialog owns top-layer placement, modality and focus. Dismissal requests, controlled state, optional backdrop dismissal and focus restoration follow Dialog. Supply a visible DrawerTitle and a matching descriptionId when needed.

## Composition

Reuse DrawerClose as a native button and existing layout/controls inside DrawerBody. Do not add a separate scrim or global modal runtime.

## Surface anatomy

Optional header, body and footer regions organize authored content and actions. In Native Web use the shared `data-vf-dialog-header`, `data-vf-dialog-body` and `data-vf-dialog-footer` hooks; `data-vf-divider` adds a boundary to header or footer. Flat compositions remain supported. Structured direct children allow the body to scroll while actions remain available; very short surfaces may scroll as a whole. Regions add no dismissal or decision policy.
