# Feedback Composition

Combine small feedback responsibilities into application-owned workflows rather than adding another runtime.

## Usage and accessibility

Use Backdrop with Loading and native inert only when a region must stop accepting input. A required decision uses AlertDialog and an application-owned commit; a failed operation keeps durable recovery near the task. Notification history uses ordinary List and Text with application-owned records; Toast is supplemental. Undo remains available for the required duration through a durable recovery path.

## Native Web

Use the shared Loading Web hooks and native progress; the application owns operations.

## React composition

Use the existing React components from their public entrypoints. Browser-aware bundlers load the shared Web CSS; no separate Feedback Composition component is required.
