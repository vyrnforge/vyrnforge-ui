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
  copyable = true,
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
    <div className="vf-docs-code-block">
      <div className="vf-docs-code-block__toolbar">
        <Text className="vf-docs-code-block__language" size="sm" tone="muted">
          {language}
        </Text>
        {copyable && (
          <Button
            className="vf-docs-code-block__copy"
            onClick={copy}
            size="sm"
            variant="ghost"
          >
            {copied ? "Copied" : "Copy"}
          </Button>
        )}
      </div>
      <pre className="vf-docs-code-block__pre">
        <code>{code}</code>
      </pre>
    </div>
  );
}
