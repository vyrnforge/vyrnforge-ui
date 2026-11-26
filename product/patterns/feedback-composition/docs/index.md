# Feedback Composition

Combine small feedback responsibilities into application-owned workflows rather than adding another runtime.

## Usage and accessibility

Use Backdrop with Loading and native inert only when a region must stop accepting input. A required decision uses AlertDialog and an application-owned commit; a failed operation keeps durable recovery near the task. Notification history uses ordinary List and Text with application-owned records; Toast is supplemental. Undo remains available for the required duration through a durable recovery path.

## Confirmation and result

Use AlertDialog for a consequential decision. Keep the safe Cancel first, provide a consequence-specific action label, and show the authoritative result only after the application commits. If a commit is asynchronous or rejected, keep the dialog open until the application resolves it. Persistent result content stays in the owning task region.

## Reversible actions

Expose Undo inline while the reversal remains available. Removing the presentation must not remove the only recovery path; do not impose a library-wide timeout on the action. Return focus to a meaningful available control when the recovery interaction changes the region.

## Durable notification history

Render notification records using ordinary List and Text, with application-owned records, read state and persistence. An optional Toast announces a new record without owning or removing it. The history is not a live region and does not require a global service.

## Native Web

Use the shared Loading Web hooks and native progress; the application owns operations.

## React composition

Use the existing React components from their public entrypoints. Browser-aware bundlers load the shared Web CSS; no separate Feedback Composition component is required.
