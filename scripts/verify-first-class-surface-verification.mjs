import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

const policyPath = "docs/metadata/first-class-surface-verification.json";
const expectedSurfaces = ["react", "native-html", "angular", "vue"];
const requiredPackageScripts = ["build", "lint", "typecheck", "test"];
const rootScriptByObligation = {
  build: "build:packages",
  lint: "lint",
  typecheck: "typecheck",
  test: "test",
};

function readJson(root, relativePath) {
  return JSON.parse(readFileSync(path.join(root, relativePath), "utf8"));
}

function addFailure(failures, message) {
  failures.push(message);
}

function verifyEvidencePath(root, failures, label, relativePath) {
  if (typeof relativePath !== "string" || relativePath.length === 0) {
    addFailure(failures, `${label} must declare an evidence path`);
    return;
  }
  if (!existsSync(path.join(root, relativePath))) {
    addFailure(failures, `${label} evidence is missing: ${relativePath}`);
  }
}

function verifySharedConsumerCoverage(root, failures, policy) {
  const browser = readJson(root, policy.sharedEvidence.browser);
  const accessibility = readJson(root, policy.sharedEvidence.accessibility);
  const ssr = readJson(root, policy.sharedEvidence.ssrServerSafe);
  const packed = readJson(root, policy.sharedEvidence.packedConsumers);

  for (const [label, values] of [
    ["browser", browser.consumers],
    ["accessibility", accessibility.consumers],
  ]) {
    const actual = new Set(values ?? []);
    for (const surface of expectedSurfaces) {
      if (!actual.has(surface)) {
        addFailure(
          failures,
          `${label} verification evidence is missing first-class surface ${surface}`,
        );
      }
    }
  }

  const ssrConsumers = new Set(
    (ssr.bundlerMatrix ?? []).map((entry) => entry.consumer),
  );
  for (const surface of expectedSurfaces) {
    if (!ssrConsumers.has(surface)) {
      addFailure(
        failures,
        `SSR/bundler evidence is missing first-class surface ${surface}`,
      );
    }
  }

  const packedConsumers = new Set(
    (packed.consumerFixtures ?? []).map((entry) => entry.id),
  );
  for (const surface of expectedSurfaces) {
    if (!packedConsumers.has(surface)) {
      addFailure(
        failures,
        `packed consumer evidence is missing first-class surface ${surface}`,
      );
    }
  }
}

export function verifyFirstClassSurfaceVerification({
  root = repositoryRoot,
} = {}) {
  const failures = [];
  if (!existsSync(path.join(root, policyPath))) {
    return [`first-class verification policy is missing: ${policyPath}`];
  }

  const policy = readJson(root, policyPath);
  const architecture = readJson(root, "docs/metadata/multi-framework.json");
  const rootPackage = readJson(root, "package.json");

  const architectureSupport = new Map(
    (architecture.frameworks ?? []).map((entry) => [
      entry.id,
      entry.supportLevel,
    ]),
  );
  const surfaces = new Map(
    (policy.surfaces ?? []).map((entry) => [entry.id, entry]),
  );

  if (policy.supportLevel !== "first-class") {
    addFailure(failures, "verification policy supportLevel must be first-class");
  }
  if (surfaces.size !== expectedSurfaces.length) {
    addFailure(
      failures,
      `verification policy must contain exactly ${expectedSurfaces.length} first-class surfaces`,
    );
  }

  for (const surfaceId of expectedSurfaces) {
    const surface = surfaces.get(surfaceId);
    if (!surface) {
      addFailure(
        failures,
        `verification policy is missing first-class surface ${surfaceId}`,
      );
      continue;
    }
    if (architectureSupport.get(surfaceId) !== "first-class") {
      addFailure(
        failures,
        `${surfaceId} architecture support must remain first-class`,
      );
    }

    verifyEvidencePath(
      root,
      failures,
      `${surfaceId} packed consumer`,
      surface.fixture,
    );
    verifyEvidencePath(
      root,
      failures,
      `${surfaceId} package directory`,
      surface.packageDirectory,
    );

    const packageJsonPath = path.join(surface.packageDirectory, "package.json");
    if (!existsSync(path.join(root, packageJsonPath))) {
      addFailure(
        failures,
        `${surfaceId} package manifest is missing: ${packageJsonPath}`,
      );
      continue;
    }
    const packageJson = readJson(root, packageJsonPath);
    if (packageJson.name !== surface.package) {
      addFailure(
        failures,
        `${surfaceId} package identity mismatch: expected ${surface.package}`,
      );
    }

    for (const scriptName of requiredPackageScripts) {
      if (typeof packageJson.scripts?.[scriptName] !== "string") {
        addFailure(
          failures,
          `${surfaceId} package is missing ${scriptName} verification`,
        );
      }
      const rootScript =
        rootPackage.scripts?.[rootScriptByObligation[scriptName]];
      if (
        typeof rootScript !== "string" ||
        !rootScript.includes(`--workspace ${surface.package}`)
      ) {
        addFailure(
          failures,
          `${surfaceId} is omitted from root ${rootScriptByObligation[scriptName]} verification`,
        );
      }
    }

    const coverage = surface.coverage ?? {};
    if (coverage.mode === "instrumented") {
      if (typeof packageJson.scripts?.[coverage.script] !== "string") {
        addFailure(
          failures,
          `${surfaceId} instrumented coverage script ${String(coverage.script)} is missing`,
        );
      }
      const rootCoverage = rootPackage.scripts?.["test:coverage"];
      if (
        typeof rootCoverage !== "string" ||
        !rootCoverage.includes(`--workspace ${surface.package}`)
      ) {
        addFailure(
          failures,
          `${surfaceId} instrumented coverage is omitted from root test:coverage`,
        );
      }
    } else if (coverage.mode === "equivalent") {
      if (
        typeof coverage.rationale !== "string" ||
        coverage.rationale.length < 80
      ) {
        addFailure(
          failures,
          `${surfaceId} coverage-equivalent mode requires a concrete rationale`,
        );
      }
      if (!Array.isArray(coverage.evidence) || coverage.evidence.length === 0) {
        addFailure(
          failures,
          `${surfaceId} coverage-equivalent mode requires evidence`,
        );
      }
      for (const evidencePath of coverage.evidence ?? []) {
        verifyEvidencePath(
          root,
          failures,
          `${surfaceId} coverage-equivalent`,
          evidencePath,
        );
      }
    } else {
      addFailure(
        failures,
        `${surfaceId} coverage mode must be instrumented or equivalent`,
      );
    }
  }

  for (const [label, evidencePath] of Object.entries(
    policy.sharedEvidence ?? {},
  )) {
    verifyEvidencePath(root, failures, `shared ${label}`, evidencePath);
  }
  if (failures.length === 0) {
    verifySharedConsumerCoverage(root, failures, policy);
  }

  if (
    typeof policy.benchmarkingPolicy !== "string" ||
    !policy.benchmarkingPolicy.includes("workload-driven")
  ) {
    addFailure(
      failures,
      "benchmarking policy must remain workload-driven rather than framework-ranked",
    );
  }

  return failures.sort();
}

export function assertFirstClassSurfaceVerification(options) {
  const failures = verifyFirstClassSurfaceVerification(options);
  if (failures.length > 0) {
    throw new Error(
      `First-class surface verification failed:\n- ${failures.join("\n- ")}`,
    );
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  assertFirstClassSurfaceVerification();
  console.log(
    "First-class surface verification passed for Native HTML, React, Angular, and Vue.",
  );
}
