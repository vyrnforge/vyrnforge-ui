import { Badge, Card, Heading, Text } from "@vyrnforge/ui-components";
import type { DocsFrameworkId } from "../docsContext";
import { CodeBlock } from "./components/CodeBlock";
import { getExecutableExampleRecord } from "./data/executableExampleContract";

export function ExecutableExamplesPage({
  frameworkId,
}: {
  frameworkId: DocsFrameworkId;
}) {
  const example = getExecutableExampleRecord(frameworkId);

  return (
    <div className="vf-docs-reference-layout">
      <div className="vf-docs-reference">
        <Card className="vf-docs-reference__section" padding="lg">
          <Heading level={3} size="md">
            {example.frameworkLabel} executable consumer
          </Heading>
          <Text tone="muted">
            Verified against packed VyrnForge packages rather than a
            Playground-only implementation.
          </Text>
          <Badge tone="subtle" variant="success">
            {example.supportClaim}
          </Badge>
        </Card>
        <Card className="vf-docs-reference__section" padding="lg">
          <Heading level={3} size="md">
            Executable source
          </Heading>
          <Text size="sm" tone="muted">
            <code>{example.sourcePath}</code>
          </Text>
          <CodeBlock code={example.source} />
        </Card>
      </div>
    </div>
  );
}
