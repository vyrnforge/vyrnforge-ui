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

export const dedicatedReferencePagePolicies = [
  {
    routeId: "icons",
    renderer: "icon-reference",
    frame: "standard",
    layoutMode: "catalog",
    replacesRecords: [{ domain: "components", id: "icon" }],
  },
] as const satisfies readonly DedicatedReferencePagePolicy[];

export function getDedicatedReferencePagePolicy(route: DocsRoute) {
  return (
    dedicatedReferencePagePolicies.find(
      (policy) =>
        policy.routeId === route.id && policy.renderer === route.kind,
    ) ?? null
  );
}

export function getDedicatedReferencePagePolicyForRecord(
  domain: string,
  id: string,
) {
  return (
    dedicatedReferencePagePolicies.find((policy) =>
      policy.replacesRecords.some(
        (record) => record.domain === domain && record.id === id,
      ),
    ) ?? null
  );
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
  return records.filter(
    (record) =>
      !isReferenceRecordReplacedByDedicatedPage(domain, record.id),
  );
}
