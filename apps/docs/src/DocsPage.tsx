import { Badge, InlineMessage, PageHeader } from "@vyrnforge/ui-components";
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
    <main className="vf-docs-page">
      <div className="vf-docs-page__intro">
        <PageHeader
          actions={
            <div className="vf-docs-page__badges">
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
          }
          description={route.description}
          eyebrow={route.sourcePath}
          title={route.title}
        />
        {route.aiPurpose && (
          <InlineMessage className="vf-docs-ai-purpose" title="AI purpose" variant="info">
            {route.aiPurpose}
          </InlineMessage>
        )}
      </div>

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
