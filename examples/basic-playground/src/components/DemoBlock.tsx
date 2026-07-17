import { useState, type ReactNode } from "react";
import { Button, Panel } from "@vyrnforge/ui-components";
import { CodeBlock } from "./CodeBlock";

export type DemoBlockProps = {
  title: string;
  description?: string;
  preview: ReactNode;
  code: string;
  defaultCodeVisible?: boolean;
};

export function DemoBlock({
  title,
  description,
  preview,
  code,
  defaultCodeVisible = false
}: DemoBlockProps) {
  const [codeVisible, setCodeVisible] = useState(defaultCodeVisible);

  return (
    <Panel
      actions={
        <Button
          aria-expanded={codeVisible}
          onClick={() => setCodeVisible((visible) => !visible)}
          size="sm"
          variant="ghost"
        >
          {codeVisible ? "Hide code" : "Show code"}
        </Button>
      }
      className="dv-playground-demo-block"
      description={description}
      title={title}
    >
      <div className="dv-playground-demo-block__preview">{preview}</div>
      {codeVisible && <CodeBlock code={code} />}
    </Panel>
  );
}
