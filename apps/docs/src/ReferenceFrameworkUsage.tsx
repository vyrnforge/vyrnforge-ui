import { Badge, Heading, Text } from "@vyrnforge/ui-components";
import type { DocsFrameworkId } from "./docsContext";
import type { ReferenceFrameworkUsage } from "./referenceData";

function CodeExample({ label, value }: { label: string; value: string }) {
  if (!value) return null;

  return (
    <div className="vf-docs-contract-field">
      <strong>{label}</strong>
      <pre>
        <code>{value}</code>
      </pre>
    </div>
  );
}

export function ReferenceFrameworkUsage({
  frameworkId,
  usage,
}: {
  frameworkId: DocsFrameworkId;
  usage: ReferenceFrameworkUsage;
}) {
  return (
    <section
      className="vf-docs-reference__section"
      id="component-framework-usage"
    >
      <Heading level={3} size="md">
        Framework usage
      </Heading>
      <div className="vf-docs-framework-usage__meta">
        <Badge size="sm" tone="subtle">
          {usage.status}
        </Badge>
        <strong>{usage.label}</strong>
        {usage.package ? <code>{usage.package}</code> : null}
      </div>
      <Text tone="muted">
        Usage is generated from canonical VyrnForge framework and component
        metadata for the selected {frameworkId} surface.
      </Text>
      <CodeExample label="Setup" value={usage.setup} />
      <CodeExample label="Basic usage" value={usage.example} />
      <Text size="sm" tone="muted">
        {usage.note}
      </Text>
    </section>
  );
}
