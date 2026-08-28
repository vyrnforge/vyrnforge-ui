import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
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

function verifyCleanViteBuild() {
  const tempRoot = mkdtempSync(path.join(repositoryRoot, ".tmp-vue-zero-config-"));
  const srcDir = path.join(tempRoot, "src");
  mkdirSync(srcDir);

  try {
    writeFileSync(
      path.join(tempRoot, "index.html"),
      '<div id="app"></div><script type="module" src="/src/main.ts"></script>\n',
    );
    writeFileSync(
      path.join(srcDir, "main.ts"),
      'import { createApp } from "vue";\nimport App from "./App.vue";\ncreateApp(App).mount("#app");\n',
    );
    writeFileSync(
      path.join(srcDir, "App.vue"),
      `<script setup lang="ts">\nimport { VfButton, VfDialog } from "@vyrnforge/ui-vue";\n<\/script>\n\n<template>\n  <VfDialog>\n    <VfButton>Zero config Vue</VfButton>\n  </VfDialog>\n</template>\n`,
    );
    writeFileSync(
      path.join(tempRoot, "vite.config.ts"),
      'import { defineConfig } from "vite";\nimport vue from "@vitejs/plugin-vue";\nexport default defineConfig({ plugins: [vue()] });\n',
    );

    execFileSync(
      npm,
      ["exec", "--", "vite", "build", "--config", path.join(tempRoot, "vite.config.ts")],
      {
        cwd: tempRoot,
        env: {
          ...process.env,
          NODE_PATH: path.join(repositoryRoot, "node_modules"),
        },
        stdio: "inherit",
      },
    );

    const html = readFileSync(path.join(tempRoot, "dist/index.html"), "utf8");
    assert.match(html, /src="\/assets\/index-[^"]+\.js"/);
    const config = readFileSync(path.join(tempRoot, "vite.config.ts"), "utf8");
    assert.doesNotMatch(config, /isCustomElement|compilerOptions/);
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }
}

buildRequiredPackages();
verifyCleanViteBuild();
console.log(
  "Vue zero-config verification passed: facade templates build with the standard Vue Vite plugin and no VyrnForge compiler customization.",
);
