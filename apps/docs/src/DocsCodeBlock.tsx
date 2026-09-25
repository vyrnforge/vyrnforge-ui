export function DocsCodeBlock({ code }: { code: string }) {
  return (
    <pre className="vf-docs-reference-code">
      <code>{code}</code>
    </pre>
  );
}
