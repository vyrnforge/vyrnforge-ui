import type { ReactNode } from "react";

import type { DocsFrameworkId } from "./docsContext";
import { IconReferencePage } from "./IconReferencePage";
import type { DocsRoute, DocsRouteKind } from "./referenceRoutes";

export type DedicatedReferenceLayoutMode =
  | "reading"
  | "reference"
  | "catalog"
  | "example"
  | "wide";

export type DedicatedReferencePageFrame = "standard" | "standalone";

export type DedicatedReferenceRecord = {
  domain: string;
  id: string;
};

type DedicatedReferencePageContext = {
  frameworkId: DocsFrameworkId;
  route: DocsRoute;
  version: string;
};

export type DedicatedReferencePageDefinition = {
  routeId: string;
  renderer: DocsRouteKind;
  frame: DedicatedReferencePageFrame;
  layoutMode: DedicatedReferenceLayoutMode;
  replacesRecords: readonly DedicatedReferenceRecord[];
  render: (context: DedicatedReferencePageContext) => ReactNode;
};

export const dedicatedReferencePages = [
  {
    routeId: "icons",
    renderer: "icon-reference",
    frame: "standard",
    layoutMode: "catalog",
    replacesRecords: [{ domain: "components", id: "icon" }],
    render: ({ frameworkId }) => (
      <IconReferencePage frameworkId={frameworkId} />
    ),
  },
] as const satisfies readonly DedicatedReferencePageDefinition[];

export function getDedicatedReferencePage(route: DocsRoute) {
  return (
    dedicatedReferencePages.find(
      (definition) =>
        definition.routeId === route.id && definition.renderer === route.kind,
    ) ?? null
  );
}

export function getDedicatedReferencePageForRecord(
  domain: string,
  id: string,
) {
  return (
    dedicatedReferencePages.find((definition) =>
      definition.replacesRecords.some(
        (record) => record.domain === domain && record.id === id,
      ),
    ) ?? null
  );
}

export function isReferenceRecordReplacedByDedicatedPage(
  domain: string,
  id: string,
) {
  return Boolean(getDedicatedReferencePageForRecord(domain, id));
}

export function excludeDedicatedReferenceRecords<T extends { id: string }>(
  domain: string,
  records: readonly T[],
) {
  return records.filter(
    (record) =>
      !isReferenceRecordReplacedByDedicatedPage(domain, record.id),
  );
}

export function renderDedicatedReferencePage(
  definition: DedicatedReferencePageDefinition,
  context: DedicatedReferencePageContext,
) {
  return definition.render(context);
}
