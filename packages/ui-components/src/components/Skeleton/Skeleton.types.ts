import type { HTMLAttributes } from "react";

export type SkeletonProps = HTMLAttributes<HTMLSpanElement> & {
  height?: number | string;
  width?: number | string;
};
