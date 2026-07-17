import { LivePreview as ReactLivePreview } from "react-live";

export type LivePreviewProps = {
  minHeight?: number | string;
};

export function LivePreview({ minHeight }: LivePreviewProps) {
  return (
    <div className="vf-playground-live-preview" style={{ minHeight }}>
      <ReactLivePreview />
    </div>
  );
}
