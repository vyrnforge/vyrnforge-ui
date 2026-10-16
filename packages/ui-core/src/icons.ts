export const vyrnForgeIconNames = [
  "Search",
  "Filter",
  "Columns",
  "Settings",
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
  "Home",
  "Box",
  "Palette",
  "Layers",
  "Play",
  "BookOpen",
  "Package",
  "Code",
  "GitHub",
  "Sun",
  "Moon",
  "Menu",
  "VyrnForgeMark",
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
  Refresh: [path("M18 8a7 7 0 1 0 1 6M18 4v4h-4")],
  Export: [path("M12 4v10"), path("m8 8 4-4 4 4"), path("M5 14v4h14v-4")],
  Import: [path("M12 4v10"), path("m8 10 4 4 4-4"), path("M5 18h14")],
  Download: [path("M12 4v10"), path("m8 10 4 4 4-4"), path("M5 19h14")],
  Upload: [path("M12 20V10"), path("m8 14 4-4 4 4"), path("M5 5h14")],
  MoreHorizontal: [circle(6, 12, 1), circle(12, 12, 1), circle(18, 12, 1)],
  MoreVertical: [circle(12, 6, 1), circle(12, 12, 1), circle(12, 18, 1)],
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
  Home: [
    path("m3 11 9-7 9 7"),
    path("M5 10v10h14V10M9 20v-6h6v6"),
  ],
  Box: [
    path("m4 7 8-4 8 4-8 4z"),
    path("m4 7 8 4 8-4v10l-8 4-8-4z"),
    path("M12 11v10"),
  ],
  Palette: [
    path(
      "M12 3a9 9 0 0 0 0 18h1.5a1.5 1.5 0 0 0 0-3H12a2 2 0 0 1 0-4h3a6 6 0 0 0 0-12z",
    ),
    circle(7.5, 10, 0.75),
    circle(10, 7, 0.75),
    circle(14, 7, 0.75),
    circle(16.5, 10, 0.75),
  ],
  Layers: [
    path("m12 3 9 5-9 5-9-5z"),
    path("m3 12 9 5 9-5"),
    path("m3 16 9 5 9-5"),
  ],
  Play: [circle(12, 12, 9), path("m10 8 6 4-6 4z")],
  BookOpen: [
    path("M4 5.5A3.5 3.5 0 0 1 7.5 2H11v17H7.5A3.5 3.5 0 0 0 4 22z"),
    path("M20 5.5A3.5 3.5 0 0 0 16.5 2H13v17h3.5A3.5 3.5 0 0 1 20 22z"),
  ],
  Package: [
    path("m4 7 8-4 8 4-8 4z"),
    path("M4 7v10l8 4 8-4V7"),
    path("M12 11v10"),
    path("m8 5 8 4"),
  ],
  Code: [
    path("m9 7-5 5 5 5"),
    path("m15 7 5 5-5 5"),
    path("m14 4-4 16"),
  ],
  GitHub: [
    path(
      "M15 22v-4a4.8 4.8 0 0 0-1-3.5c3.3-.4 6.8-1.6 6.8-7.4A5.8 5.8 0 0 0 19.3 3a5.4 5.4 0 0 0-.1-4S18-1.4 15 1.5a13.4 13.4 0 0 0-7 0C5-1.4 3.8-1 3.8-1a5.4 5.4 0 0 0-.1 4A5.8 5.8 0 0 0 2.2 7.1c0 5.8 3.5 7 6.8 7.4A4.8 4.8 0 0 0 8 18v4",
    ),
    path("M8 19c-3 .9-3-1.5-4-2"),
  ],
  Sun: [
    circle(12, 12, 4),
    path(
      "M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4",
    ),
  ],
  Moon: [
    path("M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5 8.5 8.5 0 1 0 20.5 14.2z"),
  ],
  Menu: [path("M4 7h16M4 12h16M4 17h16")],
  VyrnForgeMark: [path("M4 5l8 14L20 5"), path("M8 5l4 7 4-7")],
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
