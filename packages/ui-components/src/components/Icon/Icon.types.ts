import type { CSSProperties, SVGProps } from "react";

export type IconName =
  | "Search"
  | "Filter"
  | "Columns"
  | "Settings"
  | "Refresh"
  | "Export"
  | "Import"
  | "Download"
  | "Upload"
  | "MoreHorizontal"
  | "MoreVertical"
  | "ChevronDown"
  | "ChevronUp"
  | "ChevronLeft"
  | "ChevronRight"
  | "Close"
  | "Check"
  | "Warning"
  | "Info"
  | "Error"
  | "Success"
  | "Star"
  | "Plus"
  | "Minus"
  | "Edit"
  | "Delete"
  | "Reset"
  | "SortAsc"
  | "SortDesc"
  | "DragHandle"
  | "Resize"
  | "Eye"
  | "EyeOff";

export type IconSize = "xs" | "sm" | "md" | "lg" | number;

export type IconProps = Omit<SVGProps<SVGSVGElement>, "name" | "ref"> & {
  name: IconName;
  size?: IconSize;
  decorative?: boolean;
  title?: string;
  className?: string;
  style?: CSSProperties;
};
