# Toast

Toast is concise, supplemental, transient status feedback.

## When to use

Use Toast only when the information remains discoverable elsewhere if it disappears. Essential recovery, unresolved failures, required actions and validation errors belong in durable inline feedback, Banner, or a genuinely required decision.

## Timing and interaction

ToastRoot supports controlled open/onOpenChange or defaultOpen. Default duration is 5000 ms; zero, negative or non-finite duration means persistent. Hover and keyboard focus pause timing; dismissal and expiry request close without overriding controlled state. ToastClose uses native button activation; give icon-only controls a localized accessible name.

## Announcement and ownership

ToastViewport and ToastRoot expose the existing polite/status contract without moving focus. No severity API, standardized action slot, queue, history, mandatory provider or Snackbar alias is introduced. The application owns event classification, durable information, delivery, history and focus recovery after removing a focused control. A timed notification must not be the user's only chance to read or act.
