import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";

const packageRoot = path.resolve(process.argv[2] ?? ".");
const distDir = path.join(packageRoot, "dist");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolutePath = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(absolutePath) : [absolutePath];
  });
}

function declarationTargetExists(fromFile, specifier) {
  const base = path.resolve(path.dirname(fromFile), specifier);
  const candidates = [
    `${base}.d.ts`,
    path.join(base, "index.d.ts"),
    base.endsWith(".js") ? `${base.slice(0, -3)}.d.ts` : null,
    base.endsWith(".mjs") ? `${base.slice(0, -4)}.d.ts` : null,
    base.endsWith(".cjs") ? `${base.slice(0, -4)}.d.ts` : null
  ].filter(Boolean);

  return candidates.some((candidate) => existsSync(candidate) && statSync(candidate).isFile());
}

assert(existsSync(distDir), `declaration output directory is missing: ${distDir}`);

const declarationFiles = walk(distDir).filter((file) => file.endsWith(".d.ts"));
assert(declarationFiles.length > 0, `no declaration files were emitted under ${distDir}`);
assert(existsSync(path.join(distDir, "index.d.ts")), "package declaration entry dist/index.d.ts is missing");

for (const file of declarationFiles) {
  const relativePath = path.relative(packageRoot, file).replaceAll("\\", "/");
  assert(!/(?:^|\/)(?:__tests__|tests?)(?:\/|$)/.test(relativePath), `test declaration leaked into package output: ${relativePath}`);
  assert(!/\.(?:test|spec)\.d\.ts$/.test(relativePath), `test declaration leaked into package output: ${relativePath}`);

  const original = readFileSync(file, "utf8");
  const normalized = original
    .replace(/^import\s+["'][^"']+\.css["'];?\s*$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trimStart();

  if (normalized !== original) {
    writeFileSync(file, normalized.endsWith("\n") ? normalized : `${normalized}\n`);
  }

  for (const match of normalized.matchAll(/\b(?:from\s+|import\s*\()(["'])(\.[^"']+)\1/g)) {
    const specifier = match[2];
    assert(
      declarationTargetExists(file, specifier),
      `${relativePath}: unresolved declaration reference ${specifier}`
    );
  }
}

const declarationMaps = walk(distDir).filter((file) => file.endsWith(".d.ts.map"));
assert(declarationMaps.length === 0, "declaration maps are not part of the published package payload");

console.log(
  `Prepared ${declarationFiles.length} TypeScript declaration files for ${path.relative(process.cwd(), packageRoot) || "."}`
);
