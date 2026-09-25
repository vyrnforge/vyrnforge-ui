import {
  Badge,
  Button,
  Card,
  Checkbox,
  Heading,
  Select,
  Switch,
  Tabs,
  Text,
  TextInput,
} from "@vyrnforge/ui-components";
import type { DocsFrameworkId } from "./docsContext";
import {
  getComponentReferenceRecord,
  type ReferenceFrameworkUsage,
} from "./referenceData";

type ReferencePreviewProps = {
  componentId: string | null;
  frameworkId: DocsFrameworkId;
};

function hasSnippet(value: string) {
  return Boolean(
    value &&
    value !== "pending" &&
    value !== "requires-verification" &&
    value !== "not-applicable",
  );
}

function LiveSample({ componentId }: { componentId: string }) {
  switch (componentId) {
    case "button":
      return <Button variant="primary">Primary action</Button>;
    case "badge":
      return <Badge variant="success">Active</Badge>;
    case "text-input":
      return (
        <TextInput aria-label="Example text input" defaultValue="VyrnForge" />
      );
    case "checkbox":
      return <Checkbox label="Enable notifications" />;
    case "switch":
      return <Switch label="Enable feature" />;
    case "select":
      return (
        <Select
          aria-label="Example select"
          defaultValue="standard"
          options={[
            { label: "Compact", value: "compact" },
            { label: "Standard", value: "standard" },
            { label: "Comfortable", value: "comfortable" },
          ]}
        />
      );
    case "tabs":
      return (
        <Tabs
          defaultValue="overview"
          items={[
            {
              id: "overview",
              label: "Overview",
              content: <Text>Overview content</Text>,
            },
            {
              id: "details",
              label: "Details",
              content: <Text>Details content</Text>,
            },
          ]}
        />
      );
    default:
      return (
        <Text tone="muted">
          The selected component uses the canonical framework example and API
          below. Interactive samples are added only when they can be rendered
          without inventing required application state.
        </Text>
      );
  }
}

function FrameworkCode({ usage }: { usage: ReferenceFrameworkUsage }) {
  const hasSetup = hasSnippet(usage.setup);
  const hasExample = hasSnippet(usage.example);

  return (
    <section
      aria-labelledby="vf-docs-preview-code-heading"
      className="vf-docs-preview__code-panel"
    >
      <div className="vf-docs-preview__code-heading">
        <div>
          <Text size="sm" tone="muted">
            {usage.label}
          </Text>
          <Heading id="vf-docs-preview-code-heading" level={4} size="sm">
            Framework code
          </Heading>
        </div>
        <Badge size="sm" tone="subtle">
          {usage.status}
        </Badge>
      </div>

      {usage.package ? (
        <Text size="sm" tone="muted">
          Package: <code>{usage.package}</code>
        </Text>
      ) : null}

      {hasSetup ? (
        <div className="vf-docs-preview__snippet">
          <Text size="sm" tone="muted">
            Setup
          </Text>
          <pre className="vf-docs-preview__code">
            <code>{usage.setup}</code>
          </pre>
        </div>
      ) : null}

      {hasExample ? (
        <div className="vf-docs-preview__snippet">
          <Text size="sm" tone="muted">
            Example
          </Text>
          <pre className="vf-docs-preview__code">
            <code>{usage.example}</code>
          </pre>
        </div>
      ) : null}

      {!hasSetup && !hasExample ? (
        <Text size="sm" tone="muted">
          No generated example code is available for this framework surface.
        </Text>
      ) : null}

      <Text size="sm" tone="muted">
        {usage.note}
      </Text>
    </section>
  );
}

export function ReferencePreview({
  componentId,
  frameworkId,
}: ReferencePreviewProps) {
  if (!componentId) return null;

  const component = getComponentReferenceRecord(componentId);
  if (!component) return null;

  const frameworkUsage = component.frameworks[frameworkId];

  return (
    <Card className="vf-docs-preview" padding="none">
      <div className="vf-docs-preview__header">
        <div>
          <div className="vf-docs-preview__eyebrow">
            <Badge size="sm" tone="subtle" variant="success">
              Live in Docs
            </Badge>
            <Text size="sm" tone="muted">
              React demonstration + selected framework source
            </Text>
          </div>
          <Heading level={3} size="md">
            {component.displayName} example
          </Heading>
        </div>
      </div>
      <div className="vf-docs-preview__body">
        <div className="vf-docs-preview__stage">
          <div className="vf-docs-example-live-stage">
            <LiveSample componentId={component.id} />
          </div>
        </div>
        <FrameworkCode usage={frameworkUsage} />
      </div>
    </Card>
  );
}
