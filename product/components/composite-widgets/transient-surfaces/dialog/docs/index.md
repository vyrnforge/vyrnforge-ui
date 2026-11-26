# Dialog

Dialog is a focused native modal for a genuine decision or scoped task.

## When to use

Use Dialog when continuing requires focused interaction. Do not interrupt routine status or recovery with a modal. Native dialog and showModal own modality and the top layer; do not add a global overlay manager or render a separate Backdrop inside it.

## Behavior and accessibility

Use a visible DialogTitle or an authored accessible name. Supply descriptionId and matching DialogDescription when the description is concise and necessary. The native dialog chooses initial focus by default; use initialFocusRef for a justified target. Controlled open remains authoritative, and onDismissRequest can prevent Escape, backdrop or close-control requests. Backdrop dismissal defaults to false. Restore focus to the initiating control or an appropriate application-owned destination if it disappears.

## Composition

Reuse Button for the trigger and native DialogClose for dismissal. The close part accepts native button attributes and can use the shared Button styling hooks. Use AlertDialog for a required acknowledgement or high-risk decision, and Drawer for an edge-attached modal panel. Application owns business actions, validation and committed state.
