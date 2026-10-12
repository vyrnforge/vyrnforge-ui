import type { ReferenceRecordSelection } from "./App";
import type { DocumentationContentLayout } from "./DocumentationContentFrame";
import { getDedicatedReferencePagePolicy } from "./dedicatedReferencePagePolicy";
import type { DocsRoute } from "./referenceRoutes";

export function getDocumentationContentLayout(
  route: DocsRoute,
  referenceRecord: ReferenceRecordSelection | null,
): DocumentationContentLayout {
  const dedicatedPage = getDedicatedReferencePagePolicy(route);
  if (dedicatedPage) return dedicatedPage.layoutMode;
  if (route.kind === "example" || route.kind === "executable-examples") {
    return "example";
  }
  if (route.template === "advanced-module") return "wide";
  if (
    route.kind === "discovery-reference" ||
    route.kind === "component-reference" ||
    route.kind === "package-reference"
  ) {
    return referenceRecord ? "reference" : "catalog";
  }
  if (route.template === "package") return "reference";
  return "reading";
}
