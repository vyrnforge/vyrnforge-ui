import { Badge, InlineMessage, PageHeader } from "@vyrnforge/ui-components";
import type { ReferenceRecordSelection } from "./App";
import type { DocsFrameworkId } from "./docsContext";
import type { DocsRoute } from "./docsRegistry";
import { AiContextPage } from "./AiContextPage";
import { AiContextIndexPage } from "./AiContextIndexPage";
import { ComponentReferencePage } from "./ComponentReferencePage";
import { MarkdownView } from "./MarkdownView";
import { MetadataPage } from "./MetadataPage";
import { OverviewPage } from "./OverviewPage";
import { PackageReferencePage } from "./PackageReferencePage";

type DocsPageProps = {
  route: DocsRoute;
  frameworkId: DocsFrameworkId;
  onFrameworkChange: (frameworkId: DocsFrameworkId) => void;
  onRouteChange: (routeId: string) => void;
  referenceRecord: ReferenceRecordSelection | null;
};

export function DocsPage({
  route,
  frameworkId,
  onFrameworkChange,
  onRouteChange,
  referenceRecord,
}: DocsPageProps) {
  if (route.id === "overview") {
    return (
      <main className="vf-docs-page vf-docs-page--overview">
        <OverviewPage
          frameworkId={frameworkId}
          onFrameworkChange={onFrameworkChange}
          onRouteChange={onRouteChange}
        />
      </main>
    );
  }

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
          <InlineMessage
            className="vf-docs-ai-purpose"
            title="AI purpose"
            variant="info"
          >
            {route.aiPurpose}
          </InlineMessage>
        )}
      </div>

      {route.kind === "ai-context-index" ? (
        <AiContextIndexPage />
      ) : route.kind === "component-reference" ? (
        <ComponentReferencePage
          componentId={
            referenceRecord?.domain === "components"
              ? referenceRecord.id
              : null
          }
          frameworkId={frameworkId}
          onFrameworkChange={onFrameworkChange}
        />
      ) : route.kind === "package-reference" ? (
        <PackageReferencePage
          packageId={
            referenceRecord?.domain === "packages" ? referenceRecord.id : null
          }
        />
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
