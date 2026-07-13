import { useState, type ReactNode } from "react";
import { Badge, Button, Panel, SegmentedControl } from "@dravyn/ui-components";
import { CodeBlock } from "./CodeBlock";

export type DemoExampleProps = {
  id: string;
  title: string;
  description?: string;
  preview: ReactNode;
  code: string;
  language?: "tsx" | "ts" | "css" | "bash";
  defaultView?: "preview" | "code" | "split";
};

export function DemoExample({
  id,
  title,
  description,
  preview,
  code,
  language = "tsx",
  defaultView = "preview"
}: DemoExampleProps) {
  const [view, setView] = useState(defaultView === "split" ? "preview" : defaultView);
  const split = defaultView === "split";

  return (
    <Panel
      actions={
        <div className="dv-playground-demo-example__actions">
          <Badge size="sm" tone="subtle">{language}</Badge>
          {!split && (
            <SegmentedControl
              aria-label={`${title} view`}
              onChange={(nextView) => setView(nextView as "preview" | "code")}
              options={[{ label: "Preview", value: "preview" }, { label: "Code", value: "code" }]}
              size="sm"
              value={view}
            />
          )}
        </div>
      }
      className="dv-playground-demo-example"
      description={description}
      title={title}
    >
      <div className={split ? "dv-playground-demo-example__split" : "dv-playground-demo-example__content"} id={id}>
        {(split || view === "preview") && <div className="dv-playground-demo-example__preview">{preview}</div>}
        {(split || view === "code") && <CodeBlock code={code} language={language} />}
      </div>
      {!split && view === "preview" && (
        <Button className="dv-playground-demo-example__copy" onClick={() => setView("code")} size="sm" variant="ghost">
          View code
        </Button>
      )}
    </Panel>
  );
}
