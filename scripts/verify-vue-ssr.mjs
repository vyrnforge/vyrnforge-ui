import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const npm = process.platform === "win32" ? "npm.cmd" : "npm";

function buildRequiredPackages() {
  for (const workspace of [
    "@vyrnforge/ui-core",
    "@vyrnforge/ui-behaviors",
    "@vyrnforge/ui-elements",
    "@vyrnforge/ui-vue",
  ]) {
    execFileSync(npm, ["run", "build", "--workspace", workspace], {
      cwd: repositoryRoot,
      stdio: "inherit",
    });
  }
}

function assertServerGlobalsAbsent() {
  for (const name of ["window", "document", "customElements", "HTMLElement"]) {
    assert.equal(
      name in globalThis,
      false,
      `SSR verification expects ${name} to be absent from the Node runtime`,
    );
  }
}

async function verifyDirectServerImport() {
  const entry = path.join(repositoryRoot, "packages/ui-vue/dist/index.js");
  const module = await import(`${pathToFileURL(entry).href}?ssr=${Date.now()}`);

  assert.equal(typeof module.VfButton, "object");
  assert.equal(typeof module.createVyrnForgeVue, "function");
  assert.ok(module.VyrnForgeVue);
}

function verifyViteSsrBuild() {
  const tempRoot = mkdtempSync(path.join(repositoryRoot, ".tmp-vue-ssr-"));
  const outDir = path.join(tempRoot, "dist");
  const entry = path.join(tempRoot, "entry.ts");

  try {
    writeFileSync(
      entry,
      `import { createSSRApp, h } from "vue";\nimport { renderToString } from "vue/server-renderer";\nimport { VfButton, VyrnForgeVue } from "@vyrnforge/ui-vue";\n\nconst app = createSSRApp({\n  render: () => h(VfButton, { id: "ssr-button" }, { default: () => "SSR" }),\n});\napp.use(VyrnForgeVue);\nconst html = await renderToString(app);\nif (!html.includes("vf-button") || !html.includes("SSR")) {\n  throw new Error(\`Unexpected Vue SSR output: \${html}\`);\n}\nexport { html };\n`,
      "utf8",
    );

    execFileSync(
      npm,
      [
        "exec",
        "--",
        "vite",
        "build",
        "--ssr",
        entry,
        "--outDir",
        outDir,
        "--emptyOutDir",
      ],
      {
        cwd: repositoryRoot,
        env: { ...process.env, NODE_ENV: "production" },
        stdio: "inherit",
      },
    );

    const serverEntry = path.join(outDir, "entry.mjs");
    const output = readFileSync(serverEntry, "utf8");
    assert.match(output, /@vyrnforge\/ui-vue|VfButton|vf-button/);
    execFileSync(process.execPath, [serverEntry], {
      cwd: repositoryRoot,
      env: { ...process.env, NODE_ENV: "production" },
      stdio: "inherit",
    });
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }
}

buildRequiredPackages();
assertServerGlobalsAbsent();
await verifyDirectServerImport();
verifyViteSsrBuild();

console.log(
  "Vue SSR verification passed: direct server import and Vite SSR bundle execute without browser globals.",
);
