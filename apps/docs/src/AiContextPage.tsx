import { Card, Heading, Text } from "@vyrnforge/ui-components";
import { MarkdownView } from "./MarkdownView";
import type { DocsRoute } from "./referenceRoutes";

type AiContextPageProps = {
  route: DocsRoute;
};

function formatJson(content: string) {
  try {
    return JSON.stringify(JSON.parse(content), null, 2);
  } catch {
    return content;
  }
}

export function AiContextPage({ route }: AiContextPageProps) {
  if (route.kind === "json" || route.kind === "metadata") {
    return (
      <Card className="vf-docs-reference" padding="lg">
        <Heading level={3} size="md">
          Canonical machine-readable source
        </Heading>
        <Text tone="muted">
          This reader displays the owning JSON source directly. Generated
          Reference pages provide human-facing component, package, token,
          pattern, accessibility, and framework projections without duplicating
          these facts here.
        </Text>
        <pre className="vf-docs-markdown__code vf-docs-json">
          <code>{formatJson(route.content ?? "")}</code>
        </pre>
      </Card>
    );
  }

  return <MarkdownView markdown={route.content ?? ""} />;
}
