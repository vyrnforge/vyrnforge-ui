import { vyrnForgeIconDefinitions } from "@vyrnforge/ui-core";
import { createElement, Fragment, type ReactNode } from "react";
import type { IconName } from "./Icon.types";

export const iconPaths: Record<IconName, ReactNode> = Object.fromEntries(
  Object.entries(vyrnForgeIconDefinitions).map(([name, nodes]) => [
    name,
    createElement(
      Fragment,
      null,
      ...nodes.map((node, index) =>
        createElement(node.element, {
          ...node.attributes,
          key: `${name}-${index}`,
        }),
      ),
    ),
  ]),
) as Record<IconName, ReactNode>;
