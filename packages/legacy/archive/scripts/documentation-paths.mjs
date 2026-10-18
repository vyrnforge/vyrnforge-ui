import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

function collectMarkdown(root, relativeDirectory) {
  const absoluteDirectory = path.join(root, relativeDirectory);
  if (!existsSync(absoluteDirectory)) return [];

  const results = [];
  for (const entry of readdirSync(absoluteDirectory, { withFileTypes: true })) {
    const relativePath = path.posix.join(relativeDirectory, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectMarkdown(root, relativePath));
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      results.push(relativePath);
    }
  }
  return results;
}

export function discoverDocumentationMarkdownPaths({
  root = repositoryRoot,
} = {}) {
  const paths = new Set();

  for (const entry of readdirSync(root, { withFileTypes: true })) {
    if (entry.isFile() && entry.name.endsWith(".md")) {
      paths.add(entry.name);
    }
  }

  for (const relativePath of collectMarkdown(root, ".ai")) {
    paths.add(relativePath);
  }

  for (const relativePath of collectMarkdown(root, "docs")) {
    paths.add(relativePath);
  }

  const packagesRoot = path.join(root, "packages");
  if (existsSync(packagesRoot)) {
    for (const entry of readdirSync(packagesRoot, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const relativePath = path.posix.join("packages", entry.name, "README.md");
      if (existsSync(path.join(root, relativePath))) paths.add(relativePath);
    }
  }

  return [...paths].sort();
}
