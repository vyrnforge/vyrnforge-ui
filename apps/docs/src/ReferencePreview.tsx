import { Badge, Card, Heading, Text } from "@vyrnforge/ui-components";
import type { DocsFrameworkId } from "./docsContext";
import { getEmbeddedPlaygroundHref } from "./deploymentLinks";
import { getComponentReferenceRecord } from "./referenceData";

type ReferencePreviewProps = {
  componentId: string | null;
  frameworkId: DocsFrameworkId;
};

const unresolvedPaths = new Set([
  "pending",
  "requires-verification",
  "not-applicable",
]);

function hasExecutablePath(path: string | null): path is string {
  return Boolean(path && !unresolvedPaths.has(path));
}

export function ReferencePreview({
  componentId,
  frameworkId,
}: ReferencePreviewProps) {
  if (!componentId) return null;

  const component = getComponentReferenceRecord(componentId);
  if (!component || !hasExecutablePath(component.playgroundPath)) {
    return null;
  }

  const previewHref = getEmbeddedPlaygroundHref(
    frameworkId,
    component.playgroundPath,
  );

  return (
    <Card className="vf-docs-preview" padding="none">
      <div className="vf-docs-preview__header">
        <div>
          <div className="vf-docs-preview__eyebrow">
            <Badge size="sm" tone="subtle" variant="success">
              Live
            </Badge>
            <Text size="sm" tone="muted">
              Executable reference
            </Text>
          </div>
          <Heading level={3} size="md">
            {component.displayName} preview
          </Heading>
        </div>
        <a
          className="vf-docs-preview__open"
          href={previewHref.replace("embed=reference&", "")}
          rel="noreferrer"
          target="_blank"
        >
          Open full example
        </a>
      </div>
      <div className="vf-docs-preview__stage">
        <iframe
          className="vf-docs-preview__frame"
          key={previewHref}
          loading="lazy"
          src={previewHref}
          title={`${component.displayName} executable preview`}
        />
      </div>
      <div className="vf-docs-preview__footer">
        <Text size="sm" tone="muted">
          This preview reuses the canonical Playground route and selected
          framework context; it does not maintain a second demo implementation.
        </Text>
      </div>
    </Card>
  );
}
