import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

const scriptExtensionPattern = /\.(?:cjs|js|mjs|ts|tsx)$/u;
const scriptPathPattern =
  /\bscripts\/[A-Za-z0-9_./-]+\.(?:cjs|js|mjs|ts|tsx)\b/gu;
const quotedRelativePattern =
  /["'`]((?:\.\.\/|\.\/)[^"'`]+\.(?:cjs|js|mjs|ts|tsx))["'`]/gu;

function toPosix(relativePath) {
  return relativePath.split(path.sep).join("/");
}

function collectFiles(root, relativeDirectory, predicate) {
  const absoluteDirectory = path.join(root, relativeDirectory);
  if (!existsSync(absoluteDirectory)) return [];

  const results = [];
  for (const entry of readdirSync(absoluteDirectory, { withFileTypes: true })) {
    const relativePath = path.join(relativeDirectory, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectFiles(root, relativePath, predicate));
    } else if (entry.isFile() && predicate(entry.name)) {
      results.push(toPosix(relativePath));
    }
  }
  return results.sort();
}

function collectScriptReferences(content, currentPath) {
  const references = new Set();

  for (const match of content.matchAll(scriptPathPattern)) {
    references.add(path.posix.normalize(match[0]));
  }

  for (const match of content.matchAll(quotedRelativePattern)) {
    const resolved = path.posix.normalize(
      path.posix.join(path.posix.dirname(currentPath), match[1]),
    );
    if (resolved.startsWith("scripts/")) references.add(resolved);
  }

  return references;
}

function read(root, relativePath) {
  return readFileSync(path.join(root, relativePath), "utf8");
}

export function analyzeScriptReachability({ root = repositoryRoot } = {}) {
  const scriptFiles = collectFiles(root, "scripts", (name) =>
    scriptExtensionPattern.test(name),
  );
  const scriptSet = new Set(scriptFiles);
  const fixtureFiles = new Set(
    scriptFiles.filter((relativePath) =>
      relativePath.startsWith("scripts/fixtures/"),
    ),
  );

  const graph = new Map();
  for (const relativePath of scriptFiles) {
    const references = [
      ...collectScriptReferences(read(root, relativePath), relativePath),
    ]
      .filter((reference) => scriptSet.has(reference))
      .sort();
    graph.set(relativePath, references);
  }

  const entrypoints = new Set();
  const rootPackagePath = "package.json";
  if (existsSync(path.join(root, rootPackagePath))) {
    for (const reference of collectScriptReferences(
      read(root, rootPackagePath),
      rootPackagePath,
    )) {
      if (scriptSet.has(reference)) entrypoints.add(reference);
    }
  }

  for (const workflowPath of collectFiles(root, ".github/workflows", (name) =>
    /\.ya?ml$/u.test(name),
  )) {
    for (const reference of collectScriptReferences(
      read(root, workflowPath),
      workflowPath,
    )) {
      if (scriptSet.has(reference)) entrypoints.add(reference);
    }
  }

  const reachable = new Set();
  const queue = [...entrypoints].sort();
  while (queue.length > 0) {
    const current = queue.shift();
    if (!current || reachable.has(current)) continue;
    reachable.add(current);
    for (const dependency of graph.get(current) ?? []) {
      if (!reachable.has(dependency)) queue.push(dependency);
    }
  }

  const orphans = scriptFiles.filter(
    (relativePath) =>
      !reachable.has(relativePath) && !fixtureFiles.has(relativePath),
  );

  return {
    entrypoints: [...entrypoints].sort(),
    fixtureFiles: [...fixtureFiles].sort(),
    orphans,
    reachable: [...reachable].sort(),
    scriptFiles,
  };
}

export function verifyScriptReachability(options) {
  const analysis = analyzeScriptReachability(options);
  return analysis.orphans.map(
    (relativePath) =>
      `${relativePath}: script is unreachable from root npm/workflow entrypoints and is not an intentional scripts/fixtures file`,
  );
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const analysis = analyzeScriptReachability();
  if (analysis.orphans.length > 0) {
    console.error("Script reachability verification failed:");
    for (const orphan of analysis.orphans) console.error(`- ${orphan}`);
    process.exitCode = 1;
  } else {
    console.log(
      `Script reachability passed: ${analysis.reachable.length} reachable scripts and ${analysis.fixtureFiles.length} intentional fixture files.`,
    );
  }
}
