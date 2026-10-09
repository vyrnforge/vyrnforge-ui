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

export type DedicatedReferencePagePolicy = {
  routeId: string;
  renderer: DocsRouteKind;
  frame: DedicatedReferencePageFrame;
  layoutMode: DedicatedReferenceLayoutMode;
  replacesRecords: readonly DedicatedReferenceRecord[];
};

const iconsPolicy: DedicatedReferencePagePolicy = {
  routeId: "icons",
  renderer: "icon-reference",
  frame: "standard",
  layoutMode: "catalog",
  replacesRecords: [{ domain: "components", id: "icon" }],
};

export const dedicatedReferencePagePolicies = [iconsPolicy] as const;

export function getDedicatedReferencePagePolicy(route: DocsRoute) {
  for (const policy of dedicatedReferencePagePolicies) {
    if (policy.routeId === route.id && policy.renderer === route.kind) {
      return policy;
    }
  }
  return null;
}

export function getDedicatedReferencePagePolicyForRecord(
  domain: string,
  id: string,
) {
  for (const policy of dedicatedReferencePagePolicies) {
    for (const record of policy.replacesRecords) {
      if (record.domain === domain && record.id === id) {
        return policy;
      }
    }
  }
  return null;
}

export function isReferenceRecordReplacedByDedicatedPage(
  domain: string,
  id: string,
) {
  return Boolean(getDedicatedReferencePagePolicyForRecord(domain, id));
}

export function excludeDedicatedReferenceRecords<T extends { id: string }>(
  domain: string,
  records: readonly T[],
) {
  const visibleRecords: T[] = [];
  for (const record of records) {
    if (!isReferenceRecordReplacedByDedicatedPage(domain, record.id)) {
      visibleRecords.push(record);
    }
  }
  return visibleRecords;
}
