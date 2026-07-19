import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const expected = Object.freeze({
  nodePin: "24.18.0",
  nodeRange: ">=24.18 <25",
  npmPin: "11.16.0",
  npmRange: ">=11.16 <12",
  typescript: "7.0.2",
  publishedNodeRange: ">=22.12 <25",
  publishedNpmRange: ">=10 <12"
});

const workspaceManifests = [
  "apps/docs/package.json",
  "examples/basic-playground/package.json",
  "packages/ui-core/package.json",
  "packages/ui-components/package.json",
  "packages/ui-data-grid/package.json"
];

const publishableManifests = [
  "packages/ui-core/package.json",
  "packages/ui-components/package.json",
  "packages/ui-data-grid/package.json"
];

const packageBuildContracts = [
  [
    "packages/ui-core/package.json",
    "packages/ui-core/tsconfig.build.json",
    "packages/ui-core/tsup.config.ts"
  ],
  [
    "packages/ui-components/package.json",
    "packages/ui-components/tsconfig.build.json",
    "packages/ui-components/tsup.config.ts"
  ],
  [
    "packages/ui-data-grid/package.json",
    "packages/ui-data-grid/tsconfig.build.json",
    "packages/ui-data-grid/tsup.config.ts"
  ]
];

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function read(relativePath) {
  const absolutePath = path.join(root, relativePath);

  assert(
    existsSync(absolutePath),
    `missing required toolchain file: ${relativePath}`
  );

  return readFileSync(absolutePath, "utf8").replaceAll("\r\n", "\n");
}

function readJson(relativePath) {
  return JSON.parse(read(relativePath));
}

function parseVersion(version) {
  const match = /^(\d+)\.(\d+)\.(\d+)/.exec(version.trim());

  assert(match, `invalid semantic version: ${version}`);

  return match.slice(1).map(Number);
}

function atLeast(actual, minimum) {
  for (let index = 0; index < 3; index += 1) {
    if (actual[index] > minimum[index]) {
      return true;
    }

    if (actual[index] < minimum[index]) {
      return false;
    }
  }

  return true;
}

/**
 * Resolves the npm version in a cross-platform way.
 *
 * Resolution order:
 * 1. Read npm_config_user_agent when running through `npm run`.
 * 2. Execute npm's JavaScript CLI through the active Node executable.
 * 3. Fall back to cmd.exe on Windows or the npm executable on other systems.
 */
function resolveNpmVersion() {
  const npmUserAgent = process.env.npm_config_user_agent ?? "";
  const userAgentMatch = /(?:^|\s)npm\/([^\s]+)/.exec(npmUserAgent);

  if (userAgentMatch) {
    return userAgentMatch[1];
  }

  const npmExecPath = process.env.npm_execpath;

  if (npmExecPath && existsSync(npmExecPath)) {
    return execFileSync(
      process.execPath,
      [npmExecPath, "--version"],
      {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
        windowsHide: true
      }
    ).trim();
  }

  if (process.platform === "win32") {
    const commandProcessor = process.env.ComSpec ?? "cmd.exe";

    return execFileSync(
      commandProcessor,
      ["/d", "/s", "/c", "npm --version"],
      {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
        windowsHide: true
      }
    ).trim();
  }

  return execFileSync(
    "npm",
    ["--version"],
    {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"]
    }
  ).trim();
}

const nodeVersion = parseVersion(process.versions.node);

assert(
  nodeVersion[0] === 24 && atLeast(nodeVersion, [24, 18, 0]),
  `Node.js 24.18.0 or newer within Node 24 is required; received ${process.versions.node}`
);

const npmVersion = resolveNpmVersion();
const parsedNpmVersion = parseVersion(npmVersion);

assert(
  parsedNpmVersion[0] === 11 && atLeast(parsedNpmVersion, [11, 16, 0]),
  `npm 11.16.0 or newer within npm 11 is required; received ${npmVersion}`
);

const rootManifest = readJson("package.json");

assert(
  rootManifest.packageManager === `npm@${expected.npmPin}`,
  "root packageManager pin mismatch"
);

assert(
  rootManifest.engines?.node === expected.nodeRange,
  "root Node engine range mismatch"
);

assert(
  rootManifest.engines?.npm === expected.npmRange,
  "root npm engine range mismatch"
);

assert(
  rootManifest.devDependencies?.typescript === expected.typescript,
  "root TypeScript pin mismatch"
);

assert(
  rootManifest.allowScripts?.["esbuild@0.27.7"] === true,
  "reviewed esbuild install script approval mismatch"
);

assert(
  read(".nvmrc").trim() === expected.nodePin,
  ".nvmrc Node pin mismatch"
);

assert(
  read(".node-version").trim() === expected.nodePin,
  ".node-version Node pin mismatch"
);

for (const manifestPath of workspaceManifests) {
  const manifest = readJson(manifestPath);

  assert(
    manifest.devDependencies?.typescript === expected.typescript,
    `${manifestPath}: TypeScript must be pinned exactly to ${expected.typescript}`
  );
}

for (const manifestPath of publishableManifests) {
  const manifest = readJson(manifestPath);

  assert(
    manifest.engines?.node === expected.publishedNodeRange,
    `${manifestPath}: published Node compatibility range changed unexpectedly`
  );

  assert(
    manifest.engines?.npm === expected.publishedNpmRange,
    `${manifestPath}: published npm compatibility range changed unexpectedly`
  );
}

for (
  const [
    manifestPath,
    declarationConfigPath,
    tsupConfigPath
  ] of packageBuildContracts
) {
  const manifest = readJson(manifestPath);
  const build = manifest.scripts?.build ?? "";

  assert(
    build.includes("tsup"),
    `${manifestPath}: package build must continue to emit JavaScript/CSS through tsup`
  );

  assert(
    build.includes("tsc -p tsconfig.build.json"),
    `${manifestPath}: package build must emit declarations with the native TypeScript compiler`
  );

  assert(
    build.includes("prepare-package-declarations.mjs"),
    `${manifestPath}: package build must validate and normalize declaration output`
  );

  const declarationConfig = readJson(declarationConfigPath);

  assert(
    declarationConfig.compilerOptions?.emitDeclarationOnly === true,
    `${declarationConfigPath}: emitDeclarationOnly must remain enabled`
  );

  assert(
    declarationConfig.compilerOptions?.declaration === true,
    `${declarationConfigPath}: declaration output must remain enabled`
  );

  assert(
    declarationConfig.compilerOptions?.declarationMap === false,
    `${declarationConfigPath}: declaration maps must remain disabled`
  );

  assert(
    declarationConfig.compilerOptions?.stripInternal === true,
    `${declarationConfigPath}: stripInternal must remain enabled`
  );

  const tsupConfig = read(tsupConfigPath);

  assert(
    /\bdts\s*:\s*false\b/.test(tsupConfig),
    `${tsupConfigPath}: tsup declaration generation must remain disabled under TypeScript 7`
  );
}

const lockfile = readJson("package-lock.json");

assert(
  lockfile.packages?.[""]?.engines?.node === expected.nodeRange,
  "lockfile root Node engine mismatch"
);

assert(
  lockfile.packages?.[""]?.engines?.npm === expected.npmRange,
  "lockfile root npm engine mismatch"
);

assert(
  lockfile.packages?.[""]?.devDependencies?.typescript === expected.typescript,
  "lockfile root TypeScript pin mismatch"
);

assert(
  lockfile.packages?.["node_modules/typescript"]?.version ===
  expected.typescript,
  `lockfile must resolve TypeScript ${expected.typescript}`
);

const workflowFiles = [
  ".github/workflows/ci.yml",
  ".github/workflows/nightly.yml",
  ".github/workflows/pages.yml",
  ".github/workflows/release.yml",
  ".github/workflows/_quality.yml",
  ".github/workflows/_packages.yml",
  ".github/workflows/_consumer.yml",
  ".github/workflows/_docs.yml"
];

for (const workflowPath of workflowFiles) {
  const workflow = read(workflowPath);

  assert(
    !workflow.includes('node-version: "22"'),
    `${workflowPath}: Node 22 is not the development baseline`
  );

  assert(
    !workflow.includes('default: "22"'),
    `${workflowPath}: reusable workflow default must not use Node 22`
  );
}

console.log(
  `Toolchain contracts passed: Node ${process.versions.node}, npm ${npmVersion}, TypeScript ${expected.typescript}`
);