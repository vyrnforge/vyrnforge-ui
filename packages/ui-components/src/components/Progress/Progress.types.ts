import type { ProgressHTMLAttributes } from "react";

export type ProgressRef = HTMLProgressElement;

export type ProgressProps = Omit<
  ProgressHTMLAttributes<HTMLProgressElement>,
  "value"
> & {
  value?: number | null;
};
