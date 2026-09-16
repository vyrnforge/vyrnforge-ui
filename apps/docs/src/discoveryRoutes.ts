import type { DocsRoute } from "./docsRegistry";

export const discoveryRoutes: DocsRoute[] = [
  {
    id: "search",
    title: "Reference Search",
    group: "Start Here",
    description:
      "Search generated and canonical VyrnForge reference records across setup, packages, components, tokens, patterns, accessibility, and executable examples.",
    sourcePath: "docs/generated/reference-model.json",
    aiPurpose:
      "Use this derived index to find the owning reference surface; search results do not own facts.",
    tags: ["search", "generated", "reference"],
  },
  {
    id: "token-reference",
    title: "Design Tokens",
    group: "Foundations",
    description:
      "Explore canonical VyrnForge semantic token categories and stable CSS custom-property names.",
    sourcePath: "docs/metadata/design-tokens.json",
    aiPurpose:
      "Use this reader to discover token categories; canonical token metadata and runtime styles remain authoritative.",
    tags: ["tokens", "theme", "foundations", "generated-reader"],
  },
  {
    id: "pattern-reference",
    title: "Patterns",
    group: "Foundations",
    description:
      "Discover reusable VyrnForge application composition patterns and their component relationships.",
    sourcePath: "docs/metadata/patterns.json",
    aiPurpose:
      "Use this reader to choose existing VyrnForge composition patterns before creating one-off application UI.",
    tags: ["patterns", "composition", "foundations", "generated-reader"],
  },
  {
    id: "accessibility-reference",
    title: "Accessibility & Keyboard",
    group: "Accessibility",
    description:
      "Discover component accessibility contracts, keyboard expectations, limitations, and canonical accessibility guidance.",
    sourcePath: "docs/generated/consumer-knowledge.json",
    aiPurpose:
      "Use this reader to find component accessibility contracts and then follow the canonical accessibility standards and evidence sources.",
    tags: ["accessibility", "keyboard", "contracts", "generated-reader"],
  },
];

export function getDiscoveryRouteById(id: string) {
  return discoveryRoutes.find((route) => route.id === id);
}
