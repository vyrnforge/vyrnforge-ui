import { ComponentDemoPage } from "../../components/ComponentDemoPage";
import { createLiveScope, LiveExample } from "../../components/live";

function live(
  id: string,
  title: string,
  initialCode: string,
  description?: string,
  editorHeight = 240
) {
  return (
    <LiveExample
      description={description}
      editorHeight={editorHeight}
      id={id}
      imports={'import { Button, Inline, Select, ToastAction, ToastProvider, useToast } from "@vyrnforge/ui-components";'}
      initialCode={initialCode.trim()}
      minPreviewHeight={220}
      scope={createLiveScope("Button", "Inline", "Select", "ToastAction", "ToastProvider", "useToast")}
      title={title}
    />
  );
}

export function ToastPage() {
  return (
    <ComponentDemoPage
      accessibility={[
        "Neutral, info, and success toasts use polite status announcements; warning and error toasts use alert semantics.",
        "Focus does not move automatically when a toast appears.",
        "Toast must not replace persistent contextual feedback when users must act on the information."
      ]}
      avoidWhen={[
        "The message is required form validation; use ValidationMessage.",
        "The message must remain visible in page context; use Alert or InlineMessage.",
        "The workflow needs blocking confirmation; use Dialog or ConfirmDialog.",
        "The app needs persistent notification history; own that in the application."
      ]}
      description="Experimental transient feedback for successful operations, failures, warnings, and informational events."
      importCode={'import { ToastProvider, ToastAction, useToast } from "@vyrnforge/ui-components";'}
      packageName="@vyrnforge/ui-components"
      props={[
        { name: "ToastProvider.position", type: "ToastPosition", defaultValue: '"bottom-end"', description: "Viewport placement around the browser viewport." },
        { name: "ToastProvider.maxVisible", type: "number", defaultValue: "5", description: "Maximum visible toasts before additional records queue." },
        { name: "ToastProvider.defaultDuration", type: "number", defaultValue: "5000", description: "Default auto-dismiss duration in milliseconds." },
        { name: "ToastOptions.tone", type: '"neutral" | "info" | "success" | "warning" | "error"', defaultValue: '"neutral"', description: "Semantic tone and announcement behavior." },
        { name: "ToastOptions.duration", type: "number | null", defaultValue: "5000", description: "Auto-dismiss duration. Use null for persistent toasts." },
        { name: "ToastOptions.action", type: "ReactNode", description: "Optional single action, commonly ToastAction." },
        { name: "useToast().update", type: "(id, options) => void", description: "Updates an existing toast without duplicating it." }
      ]}
      relatedComponents={[
        { id: "alert", name: "Alert / InlineMessage", description: "Persistent contextual page feedback." },
        { id: "validation-message", name: "ValidationMessage", description: "Field-level validation." },
        { id: "dialog", name: "Dialog", description: "Focused blocking interaction." },
        { id: "confirm-dialog", name: "ConfirmDialog", description: "Confirmation before significant action." },
        { id: "badge", name: "Badge", description: "Compact state label." }
      ]}
      sections={[
        {
          id: "provider-setup",
          label: "Provider setup",
          title: "Provider setup",
          children: live("toast-provider", "Provider boundary", `function ToastDemo() {
  const toast = useToast();

  return (
    <Button onClick={() => toast.info({ title: "Provider ready" })}>
      Show toast
    </Button>
  );
}

function Example() {
  return (
    <ToastProvider>
      <ToastDemo />
    </ToastProvider>
  );
}

render(<Example />);`, "Wrap the application area that should own transient toast state.")
        },
        {
          id: "basic-usage",
          label: "Basic usage",
          title: "Basic usage",
          children: live("toast-basic", "Neutral toast", `function ToastDemo() {
  const toast = useToast();

  return (
    <Button onClick={() => toast.toast({ title: "Copied to clipboard" })}>
      Show toast
    </Button>
  );
}

render(<ToastProvider><ToastDemo /></ToastProvider>);`)
        },
        {
          id: "tones",
          label: "Tones",
          title: "Tones",
          children: live("toast-tones", "Semantic tones", `function ToastDemo() {
  const toast = useToast();

  return (
    <Inline gap="sm" wrap>
      <Button onClick={() => toast.info({ title: "Export started" })}>Info</Button>
      <Button onClick={() => toast.success({ title: "Changes saved" })}>Success</Button>
      <Button onClick={() => toast.warning({ title: "Session expires soon" })}>Warning</Button>
      <Button onClick={() => toast.error({ title: "Update failed" })}>Error</Button>
    </Inline>
  );
}

render(<ToastProvider><ToastDemo /></ToastProvider>);`)
        },
        {
          id: "title-description",
          label: "Title and description",
          title: "Title and description",
          children: live("toast-title-description", "Longer content", `function ToastDemo() {
  const toast = useToast();

  return (
    <Button
      onClick={() =>
        toast.success({
          title: "Application configuration saved",
          description: "Identity, routing, and reporting settings were updated."
        })
      }
    >
      Save configuration
    </Button>
  );
}

render(<ToastProvider><ToastDemo /></ToastProvider>);`)
        },
        {
          id: "auto-dismiss",
          label: "Auto-dismiss",
          title: "Auto-dismiss",
          children: live("toast-auto-dismiss", "Timed toast", `function ToastDemo() {
  const toast = useToast();

  return (
    <Button
      onClick={() =>
        toast.info({
          title: "Auto-dismiss",
          description: "Hover or focus the toast to pause the timer.",
          duration: 2500
        })
      }
    >
      Show timed toast
    </Button>
  );
}

render(<ToastProvider><ToastDemo /></ToastProvider>);`)
        },
        {
          id: "persistent-toast",
          label: "Persistent toast",
          title: "Persistent toast",
          children: live("toast-persistent", "Manual dismissal", `function ToastDemo() {
  const toast = useToast();

  return (
    <Button
      onClick={() =>
        toast.warning({
          title: "Review required",
          description: "This toast stays until dismissed.",
          duration: null
        })
      }
    >
      Show persistent toast
    </Button>
  );
}

render(<ToastProvider><ToastDemo /></ToastProvider>);`)
        },
        {
          id: "actions",
          label: "Actions",
          title: "Actions",
          children: live("toast-action", "Undo action", `function ToastDemo() {
  const toast = useToast();

  return (
    <Button
      onClick={() =>
        toast.success({
          title: "Bulk action complete",
          description: "5 records were archived.",
          action: (
            <ToastAction altText="Undo archive action" onClick={() => toast.info({ title: "Undo requested" })}>
              Undo
            </ToastAction>
          )
        })
      }
    >
      Archive records
    </Button>
  );
}

render(<ToastProvider><ToastDemo /></ToastProvider>);`, undefined, 280)
        },
        {
          id: "update-existing-toast",
          label: "Update existing",
          title: "Update existing toast",
          children: live("toast-update", "Export lifecycle", `function ToastDemo() {
  const toast = useToast();
  const timeoutRef = React.useRef(null);

  React.useEffect(() => () => clearTimeout(timeoutRef.current), []);

  return (
    <Button
      onClick={() => {
        const id = toast.info({
          title: "Exporting report",
          description: "Preparing the file...",
          duration: null
        });

        timeoutRef.current = setTimeout(() => {
          toast.update(id, {
            title: "Export ready",
            description: "The report is ready to download.",
            tone: "success",
            duration: 5000
          });
        }, 900);
      }}
    >
      Start export
    </Button>
  );
}

render(<ToastProvider><ToastDemo /></ToastProvider>);`, undefined, 320)
        },
        {
          id: "placement",
          label: "Placement",
          title: "Placement",
          children: live("toast-placement", "Configurable viewport", `function ToastDemo() {
  const [position, setPosition] = React.useState("bottom-end");

  return (
    <ToastProvider position={position}>
      <Inline gap="sm" wrap>
        <Select
          aria-label="Toast position"
          value={position}
          onChange={(event) => setPosition(event.currentTarget.value)}
          options={[
            { label: "Top start", value: "top-start" },
            { label: "Top center", value: "top-center" },
            { label: "Top end", value: "top-end" },
            { label: "Bottom start", value: "bottom-start" },
            { label: "Bottom center", value: "bottom-center" },
            { label: "Bottom end", value: "bottom-end" }
          ]}
        />
        <PlacementButton />
      </Inline>
    </ToastProvider>
  );
}

function PlacementButton() {
  const toast = useToast();
  return <Button onClick={() => toast.info({ title: "Position preview" })}>Show toast</Button>;
}

render(<ToastDemo />);`, undefined, 360)
        },
        {
          id: "queue-behavior",
          label: "Queue behavior",
          title: "Queue behavior",
          children: live("toast-queue", "Maximum visible toasts", `function ToastDemo() {
  const toast = useToast();

  return (
    <Button
      onClick={() => {
        Array.from({ length: 6 }).forEach((_, index) => {
          toast.info({
            title: \`Queued message \${index + 1}\`,
            duration: 2200
          });
        });
      }}
    >
      Trigger 6 messages
    </Button>
  );
}

render(
  <ToastProvider maxVisible={3}>
    <ToastDemo />
  </ToastProvider>
);`)
        }
      ]}
      status="experimental"
      title="Toast"
      useWhen={[
        "A short operation completes or fails and the user should be briefly informed.",
        "The message supplements, but does not replace, persistent feedback where action is required.",
        "The app needs transient feedback without adding a global store."
      ]}
    />
  );
}
