import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  buildDocumentationRegistry,
  serializeDocumentationRegistry,
} from "./generate-documentation-registry.mjs";

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
  return readFileSync(path.join(root, relativePath), "utf8").replace(
    /\r\n?/gu,
    "\n",
  );
}

function json(root, relativePath) {
  return JSON.parse(read(root, relativePath));
}

function duplicates(values) {
  const seen = new Set();
  const repeated = new Set();
  for (const value of values) {
    if (seen.has(value)) repeated.add(value);
    seen.add(value);
  }
  return [...repeated].sort();
}

export function validateDocumentationArchitecture({
  registry,
  routeSource,
  navSource,
  fileExists = () => true,
} = {}) {
  const failures = [];

  if (registry?.schemaVersion !== 2) {
    return ["Documentation Registry schemaVersion must be 2."];
  }

  for (const duplicate of duplicates(
    (registry.pages ?? []).map((page) => page.id),
  )) {
    failures.push(`duplicate documentation page identity: ${duplicate}`);
  }
  for (const duplicate of duplicates(
    (registry.examples ?? []).map((example) => example.id),
  )) {
    failures.push(`duplicate documentation example identity: ${duplicate}`);
  }
  for (const duplicate of duplicates(
    (registry.searchRecords ?? []).map((record) => record.id),
  )) {
    failures.push(`duplicate documentation search identity: ${duplicate}`);
  }
  for (const duplicate of duplicates(
    (registry.sitemap ?? []).map((entry) => entry.id),
  )) {
    failures.push(`duplicate documentation sitemap identity: ${duplicate}`);
  }

  const releaseLines = new Map(
    (registry.releaseLines ?? []).map((releaseLine) => [
      releaseLine.id,
      releaseLine,
    ]),
  );
  const pages = new Map((registry.pages ?? []).map((page) => [page.id, page]));
  const pageSearch = new Map(
    (registry.searchRecords ?? [])
      .filter((record) => record.kind === "page")
      .map((record) => [record.documentId, record]),
  );
  const sectionIndexes = new Map(
    (registry.indexes?.bySection ?? []).map((entry) => [
      entry.id,
      new Set(entry.documentIds),
    ]),
  );
  const typeIndexes = new Map(
    (registry.indexes?.byType ?? []).map((entry) => [
      entry.type,
      new Set(entry.documentIds),
    ]),
  );
  const relatedIds = new Set(
    (registry.relatedContentInputs ?? []).map((entry) => entry.documentId),
  );

  for (const page of registry.pages ?? []) {
    const releaseLine = releaseLines.get(page.releaseLine);
    if (!releaseLine) {
      failures.push(
        `${page.id}: documentation page references unknown release line ${page.releaseLine}`,
      );
      continue;
    }
    if (!fileExists(page.sourcePath)) {
      failures.push(
        `${page.id}: documentation source is missing: ${page.sourcePath}`,
      );
    }

    const expectedFrameworks = Object.keys(releaseLine.readiness ?? {}).sort();
    const actualFrameworks = (page.availability ?? [])
      .map((entry) => entry.framework)
      .sort();
    if (
      JSON.stringify(actualFrameworks) !== JSON.stringify(expectedFrameworks)
    ) {
      failures.push(
        `${page.id}: framework/version availability does not cover the canonical release-line readiness set`,
      );
    }

    for (const availability of page.availability ?? []) {
      const expectedStatus = releaseLine.readiness?.[availability.framework];
      if (
        availability.version !== releaseLine.version ||
        availability.status !== expectedStatus
      ) {
        failures.push(
          `${page.id}: ${availability.framework} availability contradicts release line ${page.releaseLine}`,
        );
      }

      const sitemapEntry = (registry.sitemap ?? []).find(
        (entry) =>
          entry.documentId === page.id &&
          entry.framework === availability.framework &&
          entry.version === availability.version &&
          entry.member === undefined,
      );
      if (!sitemapEntry || sitemapEntry.status !== availability.status) {
        failures.push(
          `${page.id}: canonical page deep link is missing for ${availability.framework} ${availability.version}`,
        );
      }
    }

    const searchRecord = pageSearch.get(page.id);
    if (!searchRecord || searchRecord.route !== page.route) {
      failures.push(
        `${page.id}: generated page search record is missing or stale`,
      );
    }
    if (!sectionIndexes.get(page.section)?.has(page.id)) {
      failures.push(
        `${page.id}: generated section index is missing the document`,
      );
    }
    if (!typeIndexes.get(page.type)?.has(page.id)) {
      failures.push(
        `${page.id}: generated type index is missing the document`,
      );
    }
    if (!relatedIds.has(page.id)) {
      failures.push(`${page.id}: related-content input is missing`);
    }
  }

  for (const example of registry.examples ?? []) {
    const page = pages.get(example.documentId);
    if (!page) {
      failures.push(
        `${example.id}: documentation example references missing document ${example.documentId}`,
      );
      continue;
    }

    for (const implementation of example.implementations ?? []) {
      const pageAvailability = (page.availability ?? []).find(
        (entry) =>
          entry.framework === implementation.framework &&
          entry.version === implementation.version,
      );
      if (
        !pageAvailability ||
        pageAvailability.status !== implementation.status
      ) {
        failures.push(
          `${example.id}: ${implementation.framework} example availability contradicts its document`,
        );
      }
      if (
        readyStatuses.has(implementation.status) &&
        !fileExists(implementation.sourcePath)
      ) {
        failures.push(
          `${example.id}: ready example source is missing: ${implementation.sourcePath}`,
        );
      }
    }
  }

  for (const record of (registry.searchRecords ?? []).filter(
    (candidate) => candidate.kind === "api-member",
  )) {
    if (!pages.has(record.documentId)) {
      failures.push(
        `${record.id}: API search record references missing document ${record.documentId}`,
      );
    }
    if (!record.member || !record.route?.startsWith("/")) {
      failures.push(
        `${record.id}: API search record has a broken canonical deep link`,
      );
    }
    const sitemapEntry = (registry.sitemap ?? []).find(
      (entry) =>
        entry.id === record.id &&
        entry.framework === record.framework &&
        entry.version === record.version &&
        entry.member === record.member,
    );
    if (!sitemapEntry) {
      failures.push(`${record.id}: API member is missing from the sitemap`);
    }
  }

  for (const domain of [
    "components",
    "packages",
    "tokens",
    "patterns",
    "examples",
    "accessibility",
  ]) {
    if (!(registry.recordDomains ?? []).some((entry) => entry.id === domain)) {
      failures.push(
        `generated Documentation Registry is missing public capability domain ${domain}`,
      );
    }
  }

  if (!routeSource.includes("generated/documentation-registry.json?raw")) {
    failures.push(
      "referenceRoutes.ts must consume the generated Documentation Registry",
    );
  }
  if (!routeSource.includes("registry.pages.map")) {
    failures.push(
      "referenceRoutes.ts must derive public routes from registry.pages",
    );
  }
  for (const forbidden of [
    "const docs: DocsRoute[] = [",
    'id: "component-reference"',
    'id: "token-reference"',
    'id: "package-reference"',
  ]) {
    if (routeSource.includes(forbidden)) {
      failures.push(
        `referenceRoutes.ts contains manual public route authority: ${forbidden}`,
      );
    }
  }

  for (const required of [
    "docsRoutes",
    "publicDocsSections",
    "documentationSearchRecords",
    "routeIsAvailable",
  ]) {
    if (!navSource.includes(required)) {
      failures.push(
        `DocsNav.tsx is missing registry-driven navigation marker ${required}`,
      );
    }
  }

  return failures.sort();
}

export function verifyDocumentationArchitecture({
  root = repositoryRoot,
} = {}) {
  const failures = [];
  let expectedRegistry;
  try {
    expectedRegistry = buildDocumentationRegistry({ root });
  } catch (error) {
    return [
      `canonical documentation metadata is invalid: ${
        error instanceof Error ? error.message : String(error)
      }`,
    ];
  }

  const registryPath = "docs/generated/documentation-registry.json";
  if (!existsSync(path.join(root, registryPath))) {
    return [
      `${registryPath} is missing; run npm run generate:reference to regenerate documentation outputs`,
    ];
  }

  const actualText = read(root, registryPath);
  const expectedText = serializeDocumentationRegistry(expectedRegistry).replace(
    /\r\n?/gu,
    "\n",
  );
  if (actualText !== expectedText) {
    failures.push(
      `${registryPath} is stale; run npm run generate:reference and commit the generated output`,
    );
  }

  let registry;
  try {
    registry = json(root, registryPath);
  } catch (error) {
    failures.push(
      `${registryPath} is not valid JSON: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
    return failures.sort();
  }

  failures.push(
    ...validateDocumentationArchitecture({
      registry,
      routeSource: read(root, "apps/docs/src/referenceRoutes.ts"),
      navSource: read(root, "apps/docs/src/DocsNav.tsx"),
      fileExists: (relativePath) => existsSync(path.join(root, relativePath)),
    }),
  );

  return failures.sort();
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
