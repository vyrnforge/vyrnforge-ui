import type { ReactNode } from "react";

import {
  dedicatedReferencePagePolicies,
  getDedicatedReferencePagePolicy,
  type DedicatedReferencePagePolicy,
} from "./dedicatedReferencePagePolicy";
import type { DocsFrameworkId } from "./docsContext";
import { IconReferencePage } from "./IconReferencePage";
import type { DocsRoute } from "./referenceRoutes";

type DedicatedReferencePageContext = {
  frameworkId: DocsFrameworkId;
  route: DocsRoute;
  version: string;
};

type DedicatedReferencePageRenderer = {
  routeId: DedicatedReferencePagePolicy["routeId"];
  render: (context: DedicatedReferencePageContext) => ReactNode;
};

const dedicatedReferencePageRenderers = [
  {
    routeId: "icons",
    render: ({ frameworkId }) => (
      <IconReferencePage frameworkId={frameworkId} />
    ),
  },
] as const satisfies readonly DedicatedReferencePageRenderer[];

export function getDedicatedReferencePage(route: DocsRoute) {
  const policy = getDedicatedReferencePagePolicy(route);
  if (!policy) return null;

  const renderer = dedicatedReferencePageRenderers.find(
    (candidate) => candidate.routeId === policy.routeId,
  );
  if (!renderer) {
    throw new Error(
      `Dedicated Reference page ${policy.routeId} has no renderer binding.`,
    );
  }

  return { policy, renderer };
}

export function verifyDedicatedReferencePageBindings() {
  for (const policy of dedicatedReferencePagePolicies) {
    if (
      !dedicatedReferencePageRenderers.some(
        (renderer) => renderer.routeId === policy.routeId,
      )
    ) {
      throw new Error(
        `Dedicated Reference page ${policy.routeId} has no renderer binding.`,
      );
    }
  }
}

export function renderDedicatedReferencePage(
  definition: NonNullable<ReturnType<typeof getDedicatedReferencePage>>,
  context: DedicatedReferencePageContext,
) {
  return definition.renderer.render(context);
}
