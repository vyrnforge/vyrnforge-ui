import type { ReactNode } from "react";
import type { IconName } from "./Icon.types";

export const iconPaths: Record<IconName, ReactNode> = {
  Search: (
    <>
      <circle cx="10" cy="10" r="5" />
      <path d="m14 14 4 4" />
    </>
  ),
  Filter: <path d="M4 6h16l-6 7v5l-4 2v-7z" />,
  Columns: (
    <>
      <rect x="4" y="5" width="16" height="14" rx="2" />
      <path d="M9 5v14M15 5v14" />
    </>
  ),
  Settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" />
    </>
  ),
  Refresh: <path d="M18 8a7 7 0 1 0 1 6M18 4v4h-4" />,
  Export: (
    <>
      <path d="M12 4v10" />
      <path d="m8 8 4-4 4 4" />
      <path d="M5 14v4h14v-4" />
    </>
  ),
  Import: (
    <>
      <path d="M12 4v10" />
      <path d="m8 10 4 4 4-4" />
      <path d="M5 18h14" />
    </>
  ),
  Download: (
    <>
      <path d="M12 4v10" />
      <path d="m8 10 4 4 4-4" />
      <path d="M5 19h14" />
    </>
  ),
  Upload: (
    <>
      <path d="M12 20V10" />
      <path d="m8 14 4-4 4 4" />
      <path d="M5 5h14" />
    </>
  ),
  MoreHorizontal: (
    <>
      <circle cx="6" cy="12" r="1" />
      <circle cx="12" cy="12" r="1" />
      <circle cx="18" cy="12" r="1" />
    </>
  ),
  MoreVertical: (
    <>
      <circle cx="12" cy="6" r="1" />
      <circle cx="12" cy="12" r="1" />
      <circle cx="12" cy="18" r="1" />
    </>
  ),
  ChevronDown: <path d="m6 9 6 6 6-6" />,
  ChevronUp: <path d="m6 15 6-6 6 6" />,
  ChevronLeft: <path d="m15 6-6 6 6 6" />,
  ChevronRight: <path d="m9 6 6 6-6 6" />,
  Close: <path d="m6 6 12 12M18 6 6 18" />,
  Check: <path d="m5 12 5 5L19 7" />,
  Warning: (
    <>
      <path d="M12 4 3 20h18z" />
      <path d="M12 9v4M12 17h.01" />
    </>
  ),
  Info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 8h.01" />
    </>
  ),
  Error: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m8 8 8 8M16 8l-8 8" />
    </>
  ),
  Success: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12 3 3 5-6" />
    </>
  ),
  Plus: <path d="M12 5v14M5 12h14" />,
  Minus: <path d="M5 12h14" />,
  Edit: (
    <>
      <path d="M5 19h4l10-10-4-4L5 15z" />
      <path d="m14 6 4 4" />
    </>
  ),
  Delete: (
    <>
      <path d="M5 7h14" />
      <path d="M9 7V5h6v2" />
      <path d="M7 7l1 12h8l1-12" />
    </>
  ),
  Reset: (
    <>
      <path d="M6 8a7 7 0 1 1-1 6" />
      <path d="M6 4v4h4" />
    </>
  ),
  SortAsc: (
    <>
      <path d="M7 17V7" />
      <path d="m4 10 3-3 3 3" />
      <path d="M13 9h6M13 13h4M13 17h2" />
    </>
  ),
  SortDesc: (
    <>
      <path d="M7 7v10" />
      <path d="m4 14 3 3 3-3" />
      <path d="M13 7h2M13 11h4M13 15h6" />
    </>
  ),
  DragHandle: (
    <>
      <path d="M9 5h.01M15 5h.01M9 12h.01M15 12h.01M9 19h.01M15 19h.01" />
    </>
  ),
  Resize: (
    <>
      <path d="M7 17 17 7" />
      <path d="M10 17h7v-7" />
    </>
  ),
  Eye: (
    <>
      <path d="M3 12s3-6 9-6 9 6 9 6-3 6-9 6-9-6-9-6z" />
      <circle cx="12" cy="12" r="2.5" />
    </>
  ),
  EyeOff: (
    <>
      <path d="M3 12s3-6 9-6c2 0 3.7.7 5.1 1.6" />
      <path d="M21 12s-3 6-9 6c-2 0-3.7-.7-5.1-1.6" />
      <path d="m4 4 16 16" />
    </>
  )
};
