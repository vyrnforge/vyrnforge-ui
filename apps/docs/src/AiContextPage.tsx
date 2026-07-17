import { Card, Heading, Text } from "@vyrnforge/ui-components";
import type { DocsRoute } from "./docsRegistry";
import { MarkdownView } from "./MarkdownView";

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
  if (route.kind === "json") {
    return (
      <Card className="dv-docs-reference" padding="lg">
        <Heading level={3} size="md">
          Machine-readable component metadata
        </Heading>
        <Text tone="muted">
          This JSON is intended for tools and AI agents. Human-facing component
          guidance remains in the markdown docs and reference page.
        </Text>
        <pre className="dv-docs-markdown__code dv-docs-json">
          <code>{formatJson(route.content ?? "")}</code>
        </pre>
      </Card>
    );
  }

  return <MarkdownView markdown={route.content ?? ""} />;
}
