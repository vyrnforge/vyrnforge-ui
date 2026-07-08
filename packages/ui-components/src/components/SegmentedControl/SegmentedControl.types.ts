import type { ReactNode } from "react";

export type SegmentedControlSize = "sm" | "md";

export type SegmentedControlOption = {
  value: string;
  label: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
};

export type SegmentedControlProps = {
  value: string;
  onChange: (value: string) => void;
  options: SegmentedControlOption[];
  size?: SegmentedControlSize;
  "aria-label": string;
  className?: string;
};
