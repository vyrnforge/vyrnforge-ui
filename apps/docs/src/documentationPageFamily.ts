import { getDedicatedReferencePagePolicy } from "./dedicatedReferencePagePolicy";
import type { DocumentationPageFamily } from "./DocumentationPageTemplate";
import type { DocsRoute } from "./referenceRoutes";

type ReferenceRecord = {
  domain: string;
  id: string;
} | null;

export function getDocumentationPageFamily(
  route: DocsRoute,
  referenceRecord: ReferenceRecord,
): DocumentationPageFamily {
  if (getDedicatedReferencePagePolicy(route)) return "dedicated";
  if (route.kind === "overview") return "landing";
  if (route.kind === "example" || route.kind === "executable-examples") {
    return "showcase";
  }

  if (route.kind === "component-reference") {
    return referenceRecord?.domain === "components" ? "reference" : "catalog";
  }

  if (route.kind === "package-reference") {
    return referenceRecord?.domain === "packages" ? "reference" : "catalog";
  }

  if (route.kind === "discovery-reference") {
    return referenceRecord?.domain === route.recordDomain ? "reference" : "catalog";
  }

  return "reading";
}
