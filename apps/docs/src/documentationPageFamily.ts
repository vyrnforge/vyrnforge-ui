import type { DocsRoute } from "./referenceRoutes";

export type DocumentationPageFamily =
  | "landing"
  | "reading"
  | "catalog"
  | "reference"
  | "showcase"
  | "dedicated"
  | "legacy";

type ReferenceRecordSelection = {
  domain: string;
  id: string;
} | null;

/**
 * Reader-facing content families describe presentation shape, not semantic
 * ownership. Canonical document type, route identity, and record ownership stay
 * in generated Reference metadata.
 *
 * Data & Grid intentionally remains on the legacy path while the basic
 * VyrnForge content UI is standardized. Future advanced modules should consume
 * the stable content families rather than forcing module concerns into them.
 */
export function getDocumentationPageFamily(
  route: DocsRoute,
  referenceRecord: ReferenceRecordSelection = null,
): DocumentationPageFamily {
  if (route.section === "data-grid") return "legacy";
  if (route.id === "overview") return "landing";
  if (route.kind === "icon-reference") return "dedicated";

  if (
    route.kind === "component-reference" ||
    route.kind === "package-reference" ||
    route.kind === "discovery-reference"
  ) {
    return referenceRecord ? "reference" : "catalog";
  }

  if (route.kind === "example" || route.kind === "executable-examples") {
    return "showcase";
  }

  return "reading";
}
