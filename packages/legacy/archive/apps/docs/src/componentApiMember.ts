import {
  getReferenceLocationHref,
  getReferenceRecordRoute,
} from "../../../docs/reference/referenceRuntime";
import { referenceModel, type DocsFrameworkId } from "./docsContext";

export type ComponentApiMemberKind = "property" | "event" | "slot" | "method";

export function componentApiMemberAnchor(
  kind: ComponentApiMemberKind,
  name: string,
) {
  return `api-${kind}-${name
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, "-")
    .replace(/^-|-$/gu, "")}`;
}

export function componentReferenceTargetHref(
  componentId: string,
  frameworkId: DocsFrameworkId,
  targetId: string,
) {
  return getReferenceLocationHref(referenceModel, {
    frameworkId,
    pathname: getReferenceRecordRoute(
      referenceModel,
      "components",
      componentId,
    ),
    member: targetId,
  });
}
