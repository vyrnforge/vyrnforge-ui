import type { SVGProps } from "react";

export type DataGridIconName =
  | "alert"
  | "arrowDown"
  | "arrowUp"
  | "chevronLeft"
  | "chevronRight"
  | "chevronDown"
  | "columns"
  | "densityComfortable"
  | "densityCompact"
  | "densityStandard"
  | "empty"
  | "gripVertical"
  | "moreHorizontal"
  | "reset"
  | "search"
  | "sortAsc"
  | "sortDesc"
  | "sortNone"
  | "x";

export type DataGridIconProps = SVGProps<SVGSVGElement> & {
  name: DataGridIconName;
};

const iconPaths: Record<DataGridIconName, string> = {
  alert:
    "M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z",
  arrowDown: "M12 5v14m7-7-7 7-7-7",
  arrowUp: "M12 19V5m-7 7 7-7 7 7",
  chevronLeft: "m15 18-6-6 6-6",
  chevronRight: "m9 18 6-6-6-6",
  chevronDown: "m6 9 6 6 6-6",
  columns: "M4 5h16v14H4V5Zm5 0v14m6-14v14",
  densityComfortable: "M4 6h16M4 12h16M4 18h16",
  densityCompact: "M4 8h16M4 12h16M4 16h16",
  densityStandard: "M4 7h16M4 12h16M4 17h16",
  empty:
    "M4 7h16M4 7l2-3h12l2 3M4 7v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7M9 12h6",
  gripVertical: "M9 5h.01M9 12h.01M9 19h.01M15 5h.01M15 12h.01M15 19h.01",
  moreHorizontal: "M5 12h.01M12 12h.01M19 12h.01",
  reset: "M3 12a9 9 0 1 0 3-6.71M3 4v6h6",
  search: "m21 21-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z",
  sortAsc: "m7 14 5-5 5 5",
  sortDesc: "m7 10 5 5 5-5",
  sortNone: "m8 9 4-4 4 4m0 6-4 4-4-4",
  x: "M18 6 6 18M6 6l12 12"
};

export function DataGridIcon({
  name,
  className,
  ...props
}: DataGridIconProps) {
  return (
    <svg
      aria-hidden="true"
      className={["udg-icon", className].filter(Boolean).join(" ")}
      fill="none"
      focusable="false"
      viewBox="0 0 24 24"
      {...props}
    >
      <path
        d={iconPaths[name]}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}
