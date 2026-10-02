import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { verifyDocumentationRegistry } from "./generate-documentation-registry.mjs";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

const readyStatuses = new Set([
  "stable",
  "preview",
  "maintenance",
  "deprecated",
]);

function read(root, relativePath) {
  return readFileSync(path.join(root, relativePath), "utf8");
}

function json(root, relativePath) {
  return JSON.parse(read(root, relativePath));
}

function duplicateIds(records, label, failures) {
  const seen = new Set();
  for (const record of records ?? []) {
    if (seen.has(record.id)) {
      failures.push(`${label} has duplicate id ${record.id}`);
    }
    seen.add(record.id);
  }
}

export function validateDocumentationArchitecture({
  registry,
  componentCatalog,
  consumerKnowledge,
  referenceRoutesSource = "",
  docsNavSource = "",
}) {
  const failures = [];

  duplicateIds(registry.pages, "documentation pages", failures);
  duplicateIds(registry.examples, "documentation examples", failures);
  duplicateIds(registry.searchRecords, "documentation search", failures);
  duplicateIds(registry.sitemap, "documentation sitemap", failures);

  const pageById = new Map(
    (registry.pages ?? []).map((page) => [page.id, page]),
  );
  const releaseLineById = new Map(
    (registry.releaseLines ?? []).map((releaseLine) => [
      releaseLine.id,
      releaseLine,
    ]),
  );
  const frameworks = [
    ...new Set(
      (registry.releaseLines ?? []).flatMap((releaseLine) =>
        Object.keys(releaseLine.readiness ?? {}),
      ),
    ),
  ];

  for (const page of registry.pages ?? []) {
    const releaseLine = releaseLineById.get(page.releaseLine);
    if (!releaseLine) {
      failures.push(
        `${page.id}: documentation page references unknown release line ${page.releaseLine}`,
      );
      continue;
    }

    for (const framework of frameworks) {
      const matches = (page.availability ?? []).filter(
        (entry) =>
          entry.framework === framework &&
          entry.releaseLine === page.releaseLine &&
          entry.version === releaseLine.version,
      );
      if (matches.length !== 1) {
        failures.push(
          `${page.id}: expected one ${framework} availability record for ${page.releaseLine} ${releaseLine.version}, found ${matches.length}`,
        );
        continue;
      }
      if (matches[0].status !== releaseLine.readiness[framework]) {
        failures.push(
          `${page.id}: ${framework} readiness ${matches[0].status} contradicts release-line readiness ${releaseLine.readiness[framework]}`,
        );
      }
    }
  }

  const knowledgeIds = new Set(
    (consumerKnowledge.components ?? []).map((component) => component.id),
  );
  const componentDomain = (registry.recordDomains ?? []).find(
    (domain) => domain.id === "components",
  );
  if (!componentDomain) {
    failures.push(
      "generated Documentation Registry is missing the components record domain",
    );
  }

  for (const component of componentCatalog.components ?? []) {
    if (
      component.publicExport !== true ||
      component.frameworkParity?.betaScope !== "included" ||
      component.maturity === "internal"
    ) {
      continue;
    }
    if (!knowledgeIds.has(component.id)) {
      failures.push(
        `${component.id}: public beta-scope component is missing generated documentation knowledge`,
      );
    }
  }

  for (const example of registry.examples ?? []) {
    if (!pageById.has(example.documentId)) {
      failures.push(
        `${example.id}: documentation example references unknown document ${example.documentId}`,
      );
    }
  }

  for (const record of registry.searchRecords ?? []) {
    const parent = pageById.get(record.documentId);
    if (!parent) {
      failures.push(
        `${record.id}: search record references unknown document ${record.documentId}`,
      );
      continue;
    }
    if (record.kind === "api-member") {
      const availability = (parent.availability ?? []).find(
        (entry) =>
          entry.framework === record.framework &&
          entry.version === record.version,
      );
      if (!availability) {
        failures.push(
          `${record.id}: API search record has no parent availability for ${record.framework} ${record.version}`,
        );
      } else if (availability.status !== record.status) {
        failures.push(
          `${record.id}: API search readiness ${record.status} contradicts parent readiness ${availability.status}`,
        );
      }
    }
  }

  const sitemapIds = new Set(
    (registry.sitemap ?? []).map((entry) => entry.id),
  );
  for (const page of registry.pages ?? []) {
    for (const availability of page.availability ?? []) {
      const id = `page:${availability.framework}:${availability.version}:${page.id}`;
      if (!sitemapIds.has(id)) {
        failures.push(`${page.id}: sitemap is missing ${id}`);
      }
    }
  }
  for (const record of registry.searchRecords ?? []) {
    if (record.kind === "api-member" && !sitemapIds.has(record.id)) {
      failures.push(`${record.id}: sitemap is missing API-member deep link`);
    }
  }

  const relatedIds = new Set(
    (registry.relatedContentInputs ?? []).map((entry) => entry.documentId),
  );
  for (const page of registry.pages ?? []) {
    if (!relatedIds.has(page.id)) {
      failures.push(
        `${page.id}: related-content inputs are missing the document`,
      );
    }
  }
  for (const entry of registry.relatedContentInputs ?? []) {
    if (!pageById.has(entry.documentId)) {
      failures.push(
        `${entry.documentId}: related-content input references unknown document`,
      );
    }
  }

  if (/const\s+docsRoutes\s*=\s*\[/u.test(referenceRoutesSource)) {
    failures.push(
      "referenceRoutes.ts contains a manual public route array; use the generated Documentation Registry",
    );
  }
  if (/framework-api-reference\.json\?raw/u.test(docsNavSource)) {
    failures.push(
      "DocsNav.tsx reads generated API facts directly; search must come from the Documentation Registry",
    );
  }
  if (/componentReferenceRecords/u.test(docsNavSource)) {
    failures.push(
      "DocsNav.tsx rebuilds component discovery outside the Documentation Registry",
    );
  }

  return failures.sort();
}

export function verifyDocumentationArchitecture({
  root = repositoryRoot,
} = {}) {
  const failures = [];

  try {
    verifyDocumentationRegistry({ root });
  } catch (error) {
    failures.push(
      `documentation registry: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  if (
    !existsSync(path.join(root, "docs/generated/documentation-registry.json"))
  ) {
    return failures.sort();
  }

  const registry = json(root, "docs/generated/documentation-registry.json");
  failures.push(
    ...validateDocumentationArchitecture({
      registry,
      componentCatalog: json(root, "docs/metadata/components.json"),
      consumerKnowledge: json(root, "docs/generated/consumer-knowledge.json"),
      referenceRoutesSource: read(root, "apps/docs/src/referenceRoutes.ts"),
      docsNavSource: read(root, "apps/docs/src/DocsNav.tsx"),
    }),
  );

  for (const example of registry.examples ?? []) {
    for (const implementation of example.implementations ?? []) {
      if (
        readyStatuses.has(implementation.status) &&
        !existsSync(path.join(root, implementation.sourcePath))
      ) {
        failures.push(
          `${example.id}: ${implementation.framework} ${implementation.version} is documentation-ready but source is missing: ${implementation.sourcePath}`,
        );
      }
    }
  }

  return [...new Set(failures)].sort();
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const failures = verifyDocumentationArchitecture();
  if (failures.length > 0) {
    console.error("Documentation architecture verification failed:");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exitCode = 1;
  } else {
    console.log("Documentation architecture verification passed.");
  }
}
