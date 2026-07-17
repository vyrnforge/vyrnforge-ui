import { useState } from "react";
import { Button, Text } from "@vyrnforge/ui-components";

export type CodeBlockProps = {
  code: string;
  language?: string;
  copyable?: boolean;
};

export function CodeBlock({
  code,
  language = "tsx",
  copyable = true
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    if (!navigator.clipboard) {
      return;
    }

    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="dv-playground-code-block">
      <div className="dv-playground-code-block__toolbar">
        <Text size="sm" tone="muted">{language}</Text>
        {copyable && (
          <Button onClick={copy} size="sm" variant="ghost">
            {copied ? "Copied" : "Copy"}
          </Button>
        )}
      </div>
      <pre className="dv-playground-code-block__pre">
        <code>{code}</code>
      </pre>
    </div>
  );
}
