export const vyrnForgeIconNames = [
  "Search",
  "Filter",
  "Columns",
  "Settings",
  "Sun",
  "Moon",
  "Menu",
  "GitHub",
  "VyrnForgeMark",
  "Refresh",
  "Export",
  "Import",
  "Download",
  "Upload",
  "MoreHorizontal",
  "MoreVertical",
  "ChevronDown",
  "ChevronUp",
  "ChevronLeft",
  "ChevronRight",
  "Close",
  "Check",
  "Warning",
  "Info",
  "Error",
  "Success",
  "Star",
  "Plus",
  "Minus",
  "Edit",
  "Delete",
  "Reset",
  "SortAsc",
  "SortDesc",
  "DragHandle",
  "Resize",
  "Eye",
  "EyeOff",
] as const;

export type VyrnForgeIconName = (typeof vyrnForgeIconNames)[number];
export type VyrnForgeIconSizeName = "xs" | "sm" | "md" | "lg";
export type VyrnForgeIconSize = VyrnForgeIconSizeName | number;
export type VyrnForgeIconElementName = "circle" | "path" | "rect";

export type VyrnForgeIconAttributeValue = number | string;

export type VyrnForgeIconNode = Readonly<{
  element: VyrnForgeIconElementName;
  attributes: Readonly<Record<string, VyrnForgeIconAttributeValue>>;
}>;

export type VyrnForgeIconDefinition = readonly VyrnForgeIconNode[];

export const vyrnForgeIconSizePixels: Readonly<
  Record<VyrnForgeIconSizeName, number>
> = Object.freeze({
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
});

const path = (d: string): VyrnForgeIconNode => ({
  element: "path",
  attributes: { d },
});

const filledPath = (d: string): VyrnForgeIconNode => ({
  element: "path",
  attributes: { d, fill: "currentColor", stroke: "none" },
});

const circle = (cx: number, cy: number, r: number): VyrnForgeIconNode => ({
  element: "circle",
  attributes: { cx, cy, r },
});

const rect = (
  x: number,
  y: number,
  width: number,
  height: number,
  rx?: number,
): VyrnForgeIconNode => ({
  element: "rect",
  attributes: {
    x,
    y,
    width,
    height,
    ...(rx === undefined ? {} : { rx }),
  },
});

export const vyrnForgeIconDefinitions: Readonly<
  Record<VyrnForgeIconName, VyrnForgeIconDefinition>
> = Object.freeze({
  Search: [circle(10, 10, 5), path("m14 14 4 4")],
  Filter: [path("M4 6h16l-6 7v5l-4 2v-7z")],
  Columns: [rect(4, 5, 16, 14, 2), path("M9 5v14M15 5v14")],
  Settings: [
    circle(12, 12, 3),
    path(
      "M12 3v3M12 18v3M3 12h3M18 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2",
    ),
  ],
  Sun: [
    circle(12, 12, 4),
    path(
      "M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42",
    ),
  ],
  Moon: [path("M20 15.5A8.5 8.5 0 1 1 8.5 4 7 7 0 0 0 20 15.5z")],
  Menu: [path("M4 7h16M4 12h16M4 17h16")],
  GitHub: [
    filledPath(
      "M12 2.75a9.25 9.25 0 0 0-2.92 18.03c.46.08.63-.2.63-.44v-1.72c-2.57.56-3.11-1.09-3.11-1.09-.42-1.07-1.03-1.35-1.03-1.35-.84-.57.06-.56.06-.56.93.07 1.42.96 1.42.96.83 1.42 2.17 1.01 2.7.77.08-.6.32-1.01.59-1.24-2.05-.23-4.21-1.03-4.21-4.57 0-1.01.36-1.84.96-2.49-.1-.23-.42-1.18.09-2.46 0 0 .78-.25 2.54.95A8.84 8.84 0 0 1 12 7.23a8.8 8.8 0 0 1 2.31.31c1.76-1.2 2.54-.95 2.54-.95.51 1.28.19 2.23.09 2.46.6.65.96 1.48.96 2.49 0 3.55-2.16 4.33-4.22 4.56.33.29.63.85.63 1.72v2.52c0 .24.17.52.64.44A9.25 9.25 0 0 0 12 2.75Z",
    ),
  ],
  VyrnForgeMark: [
    filledPath("M2.5 4h5.1L12 13.6 16.4 4h5.1L12 21 2.5 4Z"),
    filledPath("M8.15 4h3.35L12 5.1 12.5 4h3.35L12 12.25 8.15 4Z"),
  ],
  Refresh: [path("M18 8a7 7 0 1 0 1 6M18 4v4h-4")],
  Export: [path("M12 4v10"), path("m8 8 4-4 4 4"), path("M5 14v4h14v-4")],
  Import: [path("M12 4v10"), path("m8 10 4 4 4-4"), path("M5 18h14")],
  Download: [path("M12 4v10"), path("m8 10 4 4 4-4"), path("M5 19h14")],
  Upload: [path("M12 20V10"), path("m8 14 4-4 4 4"), path("M5 5h14")],
  MoreHorizontal: [circle(6, 12, 1), circle(12, 12, 1), circle(18, 12, 1)],
  MoreVertical: [circle(12, 6, 1), circle(12, 12, 1), circle(18, 12, 1)],
  ChevronDown: [path("m6 9 6 6 6-6")],
  ChevronUp: [path("m6 15 6-6 6 6")],
  ChevronLeft: [path("m15 6-6 6 6 6")],
  ChevronRight: [path("m9 6 6 6-6 6")],
  Close: [path("m6 6 12 12M18 6 6 18")],
  Check: [path("m5 12 5 5L19 7")],
  Warning: [path("M12 4 3 20h18z"), path("M12 9v4M12 17h.01")],
  Info: [circle(12, 12, 9), path("M12 11v5M12 8h.01")],
  Error: [circle(12, 12, 9), path("m8 8 8 8M16 8l-8 8")],
  Success: [circle(12, 12, 9), path("m8 12 3 3 5-6")],
  Star: [
    path(
      "m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9z",
    ),
  ],
  Plus: [path("M12 5v14M5 12h14")],
  Minus: [path("M5 12h14")],
  Edit: [path("M5 19h4l10-10-4-4L5 15z"), path("m14 6 4 4")],
  Delete: [path("M5 7h14"), path("M9 7V5h6v2"), path("M7 7l1 12h8l1-12")],
  Reset: [path("M6 8a7 7 0 1 1-1 6"), path("M6 4v4h4")],
  SortAsc: [
    path("M7 17V7"),
    path("m4 10 3-3 3 3"),
    path("M13 9h6M13 13h4M13 17h2"),
  ],
  SortDesc: [
    path("M7 7v10"),
    path("m4 14 3 3 3-3"),
    path("M13 7h2M13 11h4M13 15h6"),
  ],
  DragHandle: [path("M9 5h.01M15 5h.01M9 12h.01M15 12h.01M9 19h.01M15 19h.01")],
  Resize: [path("M7 17 17 7"), path("M10 17h7v-7")],
  Eye: [path("M3 12s3-6 9-6 9 6 9 6-3 6-9 6-9-6-9-6z"), circle(12, 12, 2.5)],
  EyeOff: [
    path("M3 12s3-6 9-6c2 0 3.7.7 5.1 1.6"),
    path("M21 12s-3 6-9 6c-2 0-3.7-.7-5.1-1.6"),
    path("m4 4 16 16"),
  ],
});

export function resolveVyrnForgeIconSize(size: VyrnForgeIconSize): number {
  if (typeof size === "number") return Math.max(1, size);
  return vyrnForgeIconSizePixels[size];
}

export function getVyrnForgeIconDefinition(
  name: VyrnForgeIconName,
): VyrnForgeIconDefinition {
  return vyrnForgeIconDefinitions[name];
}

function escapeXml(value: VyrnForgeIconAttributeValue) {
  return String(value)
    .replace(/&/gu, "&amp;")
    .replace(/"/gu, "&quot;")
    .replace(/</gu, "&lt;")
    .replace(/>/gu, "&gt;");
}

export function getVyrnForgeIconMarkup(name: VyrnForgeIconName): string {
  return getVyrnForgeIconDefinition(name)
    .map((node) => {
      const attributes = Object.entries(node.attributes)
        .map(([attribute, value]) => `${attribute}="${escapeXml(value)}"`)
        .join(" ");
      return `<${node.element} ${attributes}/>`;
    })
    .join("");
}

export function getVyrnForgeIconSvg(
  name: VyrnForgeIconName,
  size: VyrnForgeIconSize = "md",
): string {
  const resolvedSize = resolveVyrnForgeIconSize(size);
  return `<svg aria-hidden="true" fill="none" focusable="false" height="${resolvedSize}" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" width="${resolvedSize}" xmlns="http://www.w3.org/2000/svg">${getVyrnForgeIconMarkup(name)}</svg>`;
}
