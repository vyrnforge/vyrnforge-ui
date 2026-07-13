import type { ReactNode } from "react";

export type LiveExampleProps = {
  id: string;
  title: string;
  description?: string;
  initialCode: string;
  imports?: string;
  scope: Record<string, unknown>;
  minPreviewHeight?: number | string;
  editorHeight?: number | string;
  resetKey?: string;
  children?: ReactNode;
};
