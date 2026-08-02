import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildComponentReference } from "./generate-component-reference.mjs";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

const generatedPath = "docs/generated/component-reference.json";
const programMetadataPath = "docs/metadata/component-reference-program.json";

function read(root, relativePath) {
  return readFileSync(path.join(root, relativePath), "utf8");
}

export function verifyComponentReference({ root = repositoryRoot } = {}) {
  const failures = [];
  if (!existsSync(path.join(root, generatedPath))) {
    return [`generated component reference is missing: ${generatedPath}`];
  }
  if (!existsSync(path.join(root, programMetadataPath))) {
    return [
      `component reference program metadata is missing: ${programMetadataPath}`,
    ];
  }

  const program = JSON.parse(read(root, programMetadataPath));
  if (
    !["verification-ready", "evidence-complete"].includes(
      program.program?.status,
    )
  ) {
    failures.push(
      "component reference program status must be verification-ready or evidence-complete",
    );
  }
  const expectedClaim =
    program.program?.status === "evidence-complete"
      ? "multi-framework-component-reference-verified"
      : "multi-framework-component-reference-verification-ready";
  if (program.supportClaim !== expectedClaim) {
    failures.push(`component reference support claim must be ${expectedClaim}`);
  }
  for (const taskId of ["CF-7011", "CF-7012"]) {
    if (!(program.program?.tasks ?? []).some((task) => task.id === taskId)) {
      failures.push(`component reference program is missing ${taskId}`);
    }
  }

  const expected = buildComponentReference({ root });
  const actual = JSON.parse(read(root, generatedPath));

  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    failures.push(
      "generated component reference is stale; run npm run generate:component-reference",
    );
  }

  const catalog = JSON.parse(read(root, "docs/metadata/components.json"));
  const included = (catalog.components ?? []).filter(
    (component) =>
      component.frameworkParity?.betaScope === "included" &&
      component.maturity !== "internal",
  );

  if (actual.scope?.componentCount !== included.length) {
    failures.push(
      "generated component reference must cover every beta-scope component",
    );
  }

  const frameworkIds = ["react", "native-html", "angular", "vue"];
  for (const component of actual.components ?? []) {
    for (const frameworkId of frameworkIds) {
      if (!component.frameworks?.[frameworkId]) {
        failures.push(
          `${component.id}: generated framework usage is missing ${frameworkId}`,
        );
      }
    }

    const source = included.find((entry) => entry.id === component.id);
    const nativeTag = source?.frameworkParity?.native?.target;
    if (
      nativeTag &&
      component.frameworks?.angular?.status !==
        source?.frameworkParity?.angular?.status
    ) {
      failures.push(
        `${component.id}: Angular status must remain sourced from canonical component parity metadata`,
      );
    }
    if (
      nativeTag &&
      component.frameworks?.vue?.status !== source?.frameworkParity?.vue?.status
    ) {
      failures.push(
        `${component.id}: Vue status must remain sourced from canonical component parity metadata`,
      );
    }
  }

  const detailed = (actual.components ?? []).filter(
    (component) => component.contract,
  );
  if (detailed.length < 4) {
    failures.push(
      "generated reference must preserve the canonical detailed contract catalog",
    );
  }

  const docsPage = read(root, "apps/docs/src/ComponentReferencePage.tsx");
  for (const marker of [
    "component-reference.json",
    'label: "React"',
    'label: "Native HTML"',
    'label: "Angular"',
    'label: "Vue"',
    "Contract details",
  ]) {
    if (!docsPage.includes(marker)) {
      failures.push(`component reference viewer is missing ${marker}`);
    }
  }

  return failures.sort();
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const failures = verifyComponentReference();
  if (failures.length > 0) {
    console.error("Generated component reference verification failed:");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exitCode = 1;
  } else {
    console.log("Generated component reference verification passed.");
  }
}
