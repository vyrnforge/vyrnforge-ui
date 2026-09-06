import {
  ComponentsCatalogPage,
  NativeElementsCatalogPage,
  PackagesVersionsCatalogPage,
} from "../pages/reference/MetadataCatalogPages";
import type { PlaygroundRoute } from "./routes";

export const referenceCatalogRoutes: PlaygroundRoute[] = [
  {
    id: "component-catalog",
    label: "Component Catalog",
    title: "Component Catalog",
    description:
      "Canonical component identity, package ownership, maturity, availability, and purpose.",
    group: "Overview",
    path: "/reference/components",
    Component: ComponentsCatalogPage,
  },
  {
    id: "native-elements",
    label: "Native Elements",
    title: "Native Elements",
    description:
      "Canonical Custom Element tags grouped by family and implementation wave.",
    group: "Overview",
    path: "/reference/native-elements",
    Component: NativeElementsCatalogPage,
  },
  {
    id: "packages-versions",
    label: "Packages & Versions",
    title: "Packages and Versions",
    description:
      "Package roles, runtimes, release tracks, and versions from canonical release metadata.",
    group: "Overview",
    path: "/reference/packages",
    Component: PackagesVersionsCatalogPage,
  },
];
