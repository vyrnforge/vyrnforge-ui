import type { HTMLAttributes, ReactNode } from "react";

export type PanelProps = HTMLAttributes<HTMLElement> & {
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
};
