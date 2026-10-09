import type { ReactNode } from "react";

import type { DocsFrameworkId } from "./docsContext";
import { IconReferencePage } from "./IconReferencePage";
import type { DocsRouteKind } from "./referenceRoutes";

export type CustomReferenceRendererKind = Extract<
  DocsRouteKind,
  "icon-reference"
>;

type CustomReferenceRendererContext = {
  frameworkId: DocsFrameworkId;
};

type CustomReferenceRenderer = (
  context: CustomReferenceRendererContext,
) => ReactNode;

const customReferenceRenderers = {
  "icon-reference": ({ frameworkId }) => (
    <IconReferencePage frameworkId={frameworkId} />
  ),
} satisfies Record<CustomReferenceRendererKind, CustomReferenceRenderer>;

export function getCustomReferenceRenderer(
  kind: DocsRouteKind,
): CustomReferenceRenderer | undefined {
  return customReferenceRenderers[kind as CustomReferenceRendererKind];
}
