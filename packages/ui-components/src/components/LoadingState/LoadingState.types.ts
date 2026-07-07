import type { HTMLAttributes, ReactNode } from "react";

export type LoadingStateProps = HTMLAttributes<HTMLDivElement> & {
  title?: ReactNode;
  description?: ReactNode;
};
