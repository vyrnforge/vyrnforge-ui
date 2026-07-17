import { useContext, useState, type CSSProperties } from "react";
import { Button, Inline } from "@vyrnforge/ui-components";
import { LiveContext, LiveEditor } from "react-live";

export type LiveCodeEditorProps = {
  initialCode: string;
  imports?: string;
  editorHeight?: number | string;
};

export function LiveCodeEditor({ initialCode, imports, editorHeight }: LiveCodeEditorProps) {
  const { code, onChange } = useContext(LiveContext);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    if (!navigator.clipboard) {
      return;
    }

    await navigator.clipboard.writeText(imports ? `${imports}\n\n${code}` : code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="vf-playground-live-editor" style={{ "--vf-playground-live-editor-height": editorHeight } as CSSProperties}>
      <LiveEditor className="vf-playground-live-editor__surface" onChange={onChange} tabMode="indentation" />
      <Inline className="vf-playground-live-toolbar" justify="end">
        <Button onClick={copy} size="sm" variant="ghost">{copied ? "Copied" : imports ? "Copy full example" : "Copy"}</Button>
        <Button onClick={() => onChange(initialCode)} size="sm" variant="subtle">Reset</Button>
      </Inline>
    </div>
  );
}
