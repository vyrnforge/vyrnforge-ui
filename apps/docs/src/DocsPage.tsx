import { Badge, Card, Heading, Text } from "@dravyn/ui-components";
import type { DocsRoute } from "./docsRegistry";
import { AiContextPage } from "./AiContextPage";
import { ComponentReferencePage } from "./ComponentReferencePage";
import { MarkdownView } from "./MarkdownView";
import { MetadataPage } from "./MetadataPage";
import { PackageReferencePage } from "./PackageReferencePage";

type DocsPageProps = {
  route: DocsRoute;
};

export function DocsPage({ route }: DocsPageProps) {
  return (
    <main className="docs-page">
      <Card className="docs-page__intro" padding="lg">
        <div className="docs-page__intro-header">
          <div>
            <div className="docs-page__source">{route.sourcePath}</div>
            <Heading level={2} size="lg">
              {route.title}
            </Heading>
          </div>
          <div className="docs-page__badges">
            {route.canonical && (
              <Badge variant="success" tone="subtle">
                Canonical
              </Badge>
            )}
            {route.tags?.map((tag) => (
              <Badge key={tag} size="sm" tone="subtle">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
        {route.description && <Text tone="muted">{route.description}</Text>}
        {route.aiPurpose && (
          <div className="docs-ai-purpose">
            <strong>AI purpose:</strong> {route.aiPurpose}
          </div>
        )}
      </Card>

      {route.kind === "component-reference" ? (
        <ComponentReferencePage />
      ) : route.kind === "package-reference" ? (
        <PackageReferencePage />
      ) : route.kind === "metadata" ? (
        <MetadataPage route={route} />
      ) : route.kind === "ai" || route.kind === "json" ? (
        <AiContextPage route={route} />
      ) : (
        <MarkdownView markdown={route.content ?? ""} />
      )}
    </main>
  );
}
