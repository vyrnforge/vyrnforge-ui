import { Badge, Panel, Text } from "@vyrnforge/ui-components";
import { LiveProvider } from "react-live";
import type { LiveExampleProps } from "./LiveExample.types";
import { LiveCodeEditor } from "./LiveCodeEditor";
import { LiveError } from "./LiveError";
import { LivePreview } from "./LivePreview";

export function LiveExample({
  id,
  title,
  description,
  initialCode,
  imports,
  scope,
  minPreviewHeight,
  editorHeight = 180,
  resetKey
}: LiveExampleProps) {
  return (
    <Panel className="vf-playground-live-example" title={title} description={description} actions={<Badge size="sm" tone="subtle">Live</Badge>}>
      {imports && (
        <div className="vf-playground-live-import">
          <Text size="sm" tone="muted">Import</Text>
          <pre><code>{imports}</code></pre>
        </div>
      )}
      <LiveProvider code={initialCode} key={resetKey ?? id} language="tsx" noInline={initialCode.includes("render(")} scope={scope}>
        <LivePreview minHeight={minPreviewHeight} />
        <LiveError />
        <LiveCodeEditor editorHeight={editorHeight} imports={imports} initialCode={initialCode} />
      </LiveProvider>
    </Panel>
  );
}
