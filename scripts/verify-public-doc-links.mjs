import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { documentationCurrentPaths } from "./verify-documentation-current.mjs";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

function stripCodeFences(content) {
  return content.replace(/\`\`\`[\\s\\S]*?\`\`\`/gu, "");
}

function normalizeDestination(raw) {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const unwrapped =
    trimmed.startsWith("<") && trimmed.includes(">")
      ? trimmed.slice(1, trimmed.indexOf(">"))
      : trimmed.split(/\s+/u)[0];

  if (
    !unwrapped ||
    unwrapped.startsWith("#") ||
    /^(?:https?:|mailto:|tel:|data:|javascript:|\/\/)/iu.test(unwrapped) ||
    unwrapped.includes("{")
  ) {
    return null;
  }

  const withoutFragment = unwrapped.split("#", 1)[0];
  const withoutQuery = withoutFragment.split("?", 1)[0];
  if (!withoutQuery) return null;

  try {
    return decodeURIComponent(withoutQuery);
  } catch {
    return withoutQuery;
  }
}

export function verifyPublicDocumentationLinks({
  root = repositoryRoot,
  paths = documentationCurrentPaths,
} = {}) {
  const failures = [];

  for (const relativePath of paths.filter((entry) => entry.endsWith(".md"))) {
    const absolutePath = path.join(root, relativePath);
    if (!existsSync(absolutePath)) {
      failures.push(`${relativePath}: documentation source is missing`);
      continue;
    }

    const content = stripCodeFences(readFileSync(absolutePath, "utf8"));
    const linkPattern = /!?\[[^\]]*\]\(([^)]+)\)/gu;

    for (const match of content.matchAll(linkPattern)) {
      const destination = normalizeDestination(match[1]);
      if (!destination) continue;

      const target = destination.startsWith("/")
        ? path.join(root, destination.replace(/^\/+/, ""))
        : path.resolve(path.dirname(absolutePath), destination);

      if (!target.startsWith(root)) {
        failures.push(
          `${relativePath}: relative documentation link escapes repository root: ${destination}`,
        );
        continue;
      }

      if (!existsSync(target)) {
        failures.push(
          `${relativePath}: broken relative documentation link: ${destination}`,
        );
      }
    }
  }

  return failures.sort();
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const failures = verifyPublicDocumentationLinks();
  if (failures.length > 0) {
    console.error("Documentation link verification failed:");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exitCode = 1;
  } else {
    console.log("Documentation link verification passed.");
  }
}
