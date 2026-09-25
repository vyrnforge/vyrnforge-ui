import { Badge, Card, CodeText, Heading, Text } from "@vyrnforge/ui-components";
import type { DocsFrameworkId } from "./docsContext";
import { DocumentationPage } from "./DocumentationPage";
import { DocsCodeBlock } from "./DocsCodeBlock";
import {
  executableExampleRecords,
  executableExampleSourceOfTruth,
} from "./examples/framework/executableExampleContract";

export function FrameworkExamplesPage({
  frameworkId,
}: {
  frameworkId: DocsFrameworkId;
}) {
  const selected =
    executableExampleRecords.find(
      (example) => example.frameworkId === frameworkId,
    ) ?? executableExampleRecords[0];

  return (
    <DocumentationPage
      description="Verified packed-consumer examples for Native HTML, React, Angular, and Vue. These sources are the same fixture-backed examples validated by CI."
      eyebrow="Getting Started"
      status={
        <Badge tone="subtle" variant="success">
          CI verified
        </Badge>
      }
      title="Framework Examples"
      sections={[
        {
          id: "frameworks",
          title: "First-class framework surfaces",
          content: (
            <div className="vf-docs-discovery-grid">
              {executableExampleRecords.map((example) => (
                <Card key={example.frameworkId} padding="md">
                  <Heading level={3} size="sm">
                    {example.frameworkLabel}
                  </Heading>
                  <Text>
                    <CodeText>{example.fixtureId}</CodeText>
                  </Text>
                  <Text size="sm" tone="muted">
                    {example.supportClaim}
                  </Text>
                </Card>
              ))}
            </div>
          ),
        },
        {
          id: "source",
          title: `${selected.frameworkLabel} executable source`,
          description: `Source path: ${selected.sourcePath}`,
          content: <DocsCodeBlock code={selected.source} />,
        },
        {
          id: "evidence",
          title: "Verification evidence",
          content: (
            <div className="vf-docs-contract-details">
              <div className="vf-docs-contract-field">
                <strong>Fixture</strong>
                <span>{selected.directory}</span>
              </div>
              <div className="vf-docs-contract-field">
                <strong>Contract</strong>
                <span>{selected.contractFile}</span>
              </div>
              <div className="vf-docs-contract-field">
                <strong>Registry</strong>
                <span>{executableExampleSourceOfTruth}</span>
              </div>
              <div className="vf-docs-contract-field">
                <strong>Verification</strong>
                <span>{selected.verification.join(", ")}</span>
              </div>
            </div>
          ),
        },
      ]}
    />
  );
}
