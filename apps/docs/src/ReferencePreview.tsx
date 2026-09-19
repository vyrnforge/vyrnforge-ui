import { Badge, Card, Heading, Text } from "@vyrnforge/ui-components";
import type { DocsFrameworkId } from "./docsContext";
import {
  getEmbeddedPlaygroundHref,
  getPlaygroundRouteHref,
} from "./deploymentLinks";
import {
  getComponentReferenceRecord,
  type ReferenceFrameworkUsage,
} from "./referenceData";

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

function hasSnippet(value: string) {
  return Boolean(value && !unresolvedPaths.has(value));
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
            Example code
          </Heading>
        </div>
        <Badge size="sm" tone="subtle">
          {usage.status}
        </Badge>
      </div>

      {usage.package && (
        <Text size="sm" tone="muted">
          Package: <code>{usage.package}</code>
        </Text>
      )}

      {hasSetup && (
        <div className="vf-docs-preview__snippet">
          <Text size="sm" tone="muted">
            Setup
          </Text>
          <pre className="vf-docs-preview__code">
            <code>{usage.setup}</code>
          </pre>
        </div>
      )}

      {hasExample && (
        <div className="vf-docs-preview__snippet">
          <Text size="sm" tone="muted">
            Example
          </Text>
          <pre className="vf-docs-preview__code">
            <code>{usage.example}</code>
          </pre>
        </div>
      )}

      {!hasSetup && !hasExample && (
        <Text size="sm" tone="muted">
          No example code is available for this component on the selected
          framework.
        </Text>
      )}

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
  if (!component || !hasExecutablePath(component.playgroundPath)) {
    return null;
  }

  const previewHref = getEmbeddedPlaygroundHref(
    frameworkId,
    component.playgroundPath,
  );
  const fullExampleHref = getPlaygroundRouteHref(
    frameworkId,
    component.playgroundPath,
  );
  const frameworkUsage = component.frameworks[frameworkId];

  return (
    <Card className="vf-docs-preview" padding="none">
      <div className="vf-docs-preview__header">
        <div>
          <div className="vf-docs-preview__eyebrow">
            <Badge size="sm" tone="subtle" variant="success">
              Live
            </Badge>
            <Text size="sm" tone="muted">
              Preview
            </Text>
          </div>
          <Heading level={3} size="md">
            {component.displayName} preview
          </Heading>
        </div>
        <a
          className="vf-docs-preview__open"
          href={fullExampleHref}
          rel="noreferrer"
          target="_blank"
        >
          Open full example
        </a>
      </div>
      <div className="vf-docs-preview__body">
        <div className="vf-docs-preview__stage">
          <iframe
            className="vf-docs-preview__frame"
            key={previewHref}
            loading="lazy"
            src={previewHref}
            title={`${component.displayName} executable preview`}
          />
        </div>
        <FrameworkCode usage={frameworkUsage} />
      </div>

    </Card>
  );
}
