function stripNumericPrefix(value: string) {
  return value.replace(/^\d+-/u, "").replace(/^adr-\d+-/u, "");
}

function readmeRouteId(path: string) {
  const parentPath = path
    .slice("docs/".length, -"/README.md".length)
    .replace(/\//gu, "-");
  return `readme-${parentPath}`;
}

export function slugFromSourcePath(path: string) {
  if (path === "docs/README.md") return "overview";
  if (path === "docs/api/README.md") return "api-overview";
  if (path === "docs/release/README.md") return "release-docs";
  if (/^docs\/.+\/README\.md$/u.test(path)) return readmeRouteId(path);
  if (path === "docs/generated/ai-context/index.json") {
    return "ai-consumer-context";
  }
  if (path === "AGENTS.md") return "agent-rules";

  const withoutExtension = path.replace(/\.(?:md|json)$/u, "");
  if (withoutExtension.startsWith("docs/metadata/")) {
    return `metadata-${withoutExtension.slice("docs/metadata/".length)}`;
  }
  if (withoutExtension.startsWith("docs/generated/ai-context/")) {
    return `ai-context-${withoutExtension
      .slice("docs/generated/ai-context/".length)
      .replace(/\//gu, "-")}`;
  }

  const basename = withoutExtension.slice(
    withoutExtension.lastIndexOf("/") + 1,
  );
  return stripNumericPrefix(basename);
}
