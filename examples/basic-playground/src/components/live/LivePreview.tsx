import { LivePreview as ReactLivePreview } from "react-live";

export type LivePreviewProps = {
  minHeight?: number | string;
};

export function LivePreview({ minHeight }: LivePreviewProps) {
  return (
    <div className="dv-playground-live-preview" style={{ minHeight }}>
      <ReactLivePreview />
    </div>
  );
}
