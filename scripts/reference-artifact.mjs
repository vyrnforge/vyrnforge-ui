import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

export const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

const artifactManifestName = "reference-artifact.json";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function copyDirectory(source, destination) {
  assert(existsSync(source), `Reference artifact input is missing: ${source}`);
  mkdirSync(destination, { recursive: true });
  cpSync(source, destination, { recursive: true });
}

function requireFile(directory, relativePath) {
  const absolutePath = path.join(directory, relativePath);
  assert(
    existsSync(absolutePath),
    `Reference artifact is missing ${relativePath}`,
  );
  return absolutePath;
}

function normalizeRunId(ciRunId) {
  const value = String(ciRunId ?? "").trim();
  assert(/^\d+$/u.test(value), "Reference artifact CI run id must be numeric");
  return value;
}

function normalizeCommit(sourceCommit) {
  const value = String(sourceCommit ?? "").trim();
  assert(
    /^[0-9a-f]{7,40}$/iu.test(value),
    "Reference artifact source commit must be a Git SHA",
  );
  return value;
}

export function writeReferenceArtifactManifest({
  directory,
  kind,
  sourceCommit,
  ciRunId,
  eventName,
}) {
  assert(
    kind === "preview" || kind === "production",
    "Reference artifact kind must be preview or production",
  );
  const manifest = {
    schemaVersion: 1,
    artifact: {
      kind,
      deployable: kind === "production",
      immutable: true,
    },
    source: {
      commit: normalizeCommit(sourceCommit),
      ciRunId: normalizeRunId(ciRunId),
      event: eventName,
    },
    surfaces: {
      docsPath: "/",
    },
  };

  mkdirSync(directory, { recursive: true });
  writeFileSync(
    path.join(directory, artifactManifestName),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );
  return manifest;
}

export function assembleReferencePreview({
  root = repositoryRoot,
  outputDirectory = path.join(root, "reference-preview"),
  sourceCommit,
  ciRunId,
}) {
  rmSync(outputDirectory, { recursive: true, force: true });
  mkdirSync(outputDirectory, { recursive: true });
  copyDirectory(path.join(root, "apps/docs/dist"), outputDirectory);
  writeFileSync(path.join(outputDirectory, ".nojekyll"), "");
  writeReferenceArtifactManifest({
    directory: outputDirectory,
    kind: "preview",
    sourceCommit,
    ciRunId,
    eventName: "pull_request",
  });
  return outputDirectory;
}

export function verifyReferenceArtifact({
  directory,
  expectedKind,
  expectedCommit,
  expectedCiRunId,
}) {
  requireFile(directory, "index.html");
  requireFile(directory, ".nojekyll");
  const manifest = JSON.parse(
    readFileSync(requireFile(directory, artifactManifestName), "utf8"),
  );

  assert(manifest.schemaVersion === 1, "Unsupported reference artifact schema");
  assert(
    manifest.artifact?.kind === expectedKind,
    `Reference artifact kind must be ${expectedKind}`,
  );
  assert(
    manifest.artifact?.immutable === true,
    "Reference artifact must be immutable",
  );
  assert(
    manifest.artifact?.deployable === (expectedKind === "production"),
    `Reference artifact deployable flag is invalid for ${expectedKind}`,
  );
  assert(
    manifest.source?.commit === normalizeCommit(expectedCommit),
    "Reference artifact source commit does not match expected commit",
  );
  assert(
    manifest.source?.ciRunId === normalizeRunId(expectedCiRunId),
    "Reference artifact CI run id does not match expected run",
  );
  assert(
    manifest.surfaces?.docsPath === "/",
    "Reference artifact surface path is invalid",
  );

  if (expectedKind === "production") {
    const catalog = JSON.parse(
      readFileSync(requireFile(directory, "vyrnforge-versions.json"), "utf8"),
    );
    assert(
      catalog.current?.commit === manifest.source.commit,
      "Production reference catalog commit does not match artifact lineage",
    );
  }

  return manifest;
}

function parseArguments(values) {
  const parsed = {};
  for (let index = 0; index < values.length; index += 1) {
    const value = values[index];
    if (!value.startsWith("--")) continue;
    const key = value.slice(2);
    const next = values[index + 1];
    assert(next && !next.startsWith("--"), `Missing value for --${key}`);
    parsed[key] = next;
    index += 1;
  }
  return parsed;
}

function runCli() {
  const [command, ...rest] = process.argv.slice(2);
  const args = parseArguments(rest);
  const sourceCommit = args["source-commit"];
  const ciRunId = args["ci-run-id"];

  if (command === "assemble-preview") {
    const directory = path.resolve(
      repositoryRoot,
      args.directory ?? "reference-preview",
    );
    assembleReferencePreview({
      outputDirectory: directory,
      sourceCommit,
      ciRunId,
    });
    verifyReferenceArtifact({
      directory,
      expectedKind: "preview",
      expectedCommit: sourceCommit,
      expectedCiRunId: ciRunId,
    });
    console.log(`Prepared immutable reference preview at ${directory}.`);
    return;
  }

  if (command === "write-production-manifest") {
    const directory = path.resolve(repositoryRoot, args.directory ?? "site");
    writeReferenceArtifactManifest({
      directory,
      kind: "production",
      sourceCommit,
      ciRunId,
      eventName: "push",
    });
    console.log(`Bound production reference artifact at ${directory}.`);
    return;
  }

  if (command === "verify") {
    const directory = path.resolve(repositoryRoot, args.directory ?? "site");
    const kind = args.kind;
    verifyReferenceArtifact({
      directory,
      expectedKind: kind,
      expectedCommit: sourceCommit,
      expectedCiRunId: ciRunId,
    });
    console.log(`Verified ${kind} reference artifact at ${directory}.`);
    return;
  }

  throw new Error(
    "Usage: reference-artifact.mjs <assemble-preview|write-production-manifest|verify> --source-commit <sha> --ci-run-id <id> [--directory <path>] [--kind <preview|production>]",
  );
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : "";
if (invokedPath === fileURLToPath(import.meta.url)) runCli();
