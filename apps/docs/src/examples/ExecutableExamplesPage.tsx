import {
  Badge,
  EmptyState,
  Heading,
  Text,
} from "@vyrnforge/ui-components";
import type { DocsFrameworkId } from "../docsContext";
import { resolveDocumentationExample } from "../referenceRoutes";
import { CodeBlock } from "./components/CodeBlock";
import { getExecutableExampleRecord } from "./data/executableExampleContract";

export function ExecutableExamplesPage({
  frameworkId,
  version,
}: {
  frameworkId: DocsFrameworkId;
  version: string;
}) {
  const resolution = resolveDocumentationExample(
    "framework-consumer",
    frameworkId,
    version,
  );

  if (!resolution.available) {
    return (
      <div className="vf-docs-state">
        <EmptyState
          description="No verified packed-consumer implementation is available in this context."
          title={`Executable example unavailable for ${frameworkId} ${version}`}
        />
      </div>
    );
  }

  const example = getExecutableExampleRecord(frameworkId);
  if (example.sourcePath !== resolution.implementation.sourcePath) {
    throw new Error(
      `Generated example registry source for ${frameworkId} has drifted from packed consumer evidence.`,
    );
  }

  return (
    <div className="vf-docs-reference-layout">
      <div className="vf-docs-reference">
        <section className="vf-docs-reference__section">
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
        </section>
        <section className="vf-docs-reference__section">
          <Heading level={3} size="md">
            Executable source
          </Heading>
          <Text size="sm" tone="muted">
            <code>{resolution.implementation.sourcePath}</code>
          </Text>
          <CodeBlock code={example.source} />
        </section>
      </div>
    </div>
  );
}
