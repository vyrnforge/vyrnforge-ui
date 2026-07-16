# Toast

`Toast` is an experimental transient feedback foundation in `@dravyn/ui-components`.

Use it for brief operation feedback such as saved changes, copy completion, export lifecycle updates, background completion, warnings, and failures.

Do not use Toast for required form validation, critical information that must remain visible, legal acknowledgements, destructive confirmation, persistent system alerts, or application notification history.

## Provider

Wrap the app area that should own transient feedback.

```tsx
import { ToastProvider } from "@dravyn/ui-components";

<ToastProvider position="bottom-end" maxVisible={5}>
  <App />
</ToastProvider>
```

Each provider owns an isolated queue. Multiple providers may exist. Dravyn does not use Redux, Zustand, module-level global state, or persistent storage for toast state.

`ToastProvider` renders `ToastViewport` automatically through the shared Portal foundation.

## Controller API

```tsx
import { useToast } from "@dravyn/ui-components";

function SaveButton() {
  const toast = useToast();

  return (
    <Button
      onClick={() =>
        toast.success({
          title: "Application saved",
          description: "The configuration was updated."
        })
      }
    >
      Save
    </Button>
  );
}
```

`useToast()` exposes:

- `toast(options)`
- `success(options)`
- `error(options)`
- `warning(options)`
- `info(options)`
- `dismiss(id)`
- `dismissAll()`
- `update(id, options)`

Caller-supplied duplicate IDs update the existing toast rather than rendering duplicates.

## Timers

Default duration is `5000` milliseconds.

`duration={null}` keeps a toast visible until dismissed. Timed toasts pause on hover and focus by default, then resume with the remaining time.

Updating a toast restarts its timer policy from the updated record.

## Queue

`maxVisible` defaults to `5`. Additional toasts remain queued and become visible as existing toasts dismiss.

`newestOnTop` changes visual order only. `dismissAll()` clears visible and queued toasts.

## Accessibility

Neutral, info, and success toasts use polite status announcements. Warning and error toasts use alert semantics.

Focus does not move automatically to a new toast. Action and dismiss buttons remain keyboard accessible.

Toast must not replace persistent contextual feedback when the user must act. Critical failures should also appear with `Alert`, `InlineMessage`, or page-level error content.

## Z-Index

Toast viewport uses `--dv-z-toast` and renders through the shared Portal foundation. Toasts are anchored to the browser viewport and remain independent from AppShell content scrolling.

Do not use Toast as the only feedback inside a modal workflow. Modal workflows should include contextual feedback inside the dialog or drawer when corrective action is required.

## Alternatives

- `ValidationMessage`: field-level feedback.
- `Alert` / `InlineMessage`: persistent contextual page feedback.
- `Dialog`: focused blocking interaction.
- `ConfirmDialog`: confirmation before significant action.
- App-owned notification center: persistent notification history.
