import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { build } from 'esbuild';
import { loadNativeControlContract } from './native-control-contract.mjs';

const supportedPorts = new Set(['web', 'react', 'angular', 'vue']);

function page(componentId, body, script = '') {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><link rel="stylesheet" href="./${componentId}.css"><title>${componentId} fixture</title></head><body><main><h1>${componentId} fixture</h1>${body}</main>${script}</body></html>`;
}

async function writeClient(outDir, fileName, source, root) {
  await build({ stdin: { resolveDir: root, sourcefile: fileName, contents: source }, bundle: true, format: 'esm', platform: 'browser', outfile: path.join(outDir, fileName.replace(/\.ts$/, '.js')) });
}

async function writeSharedStyles({ componentId, contract, outDir, root }) {
  const tokensCss = await readFile(path.join(root, 'packages/web/dist/styles/tokens.css'), 'utf8');
  let componentCss = await readFile(path.join(root, `packages/web/dist/components/${componentId}/${componentId}.css`), 'utf8');
  componentCss = componentCss.replace('@import "../../styles/tokens.css";\n', '');
  let dependencyCss = '';
  for (const dependency of contract.styleDependencies ?? []) {
    dependencyCss += `${(await readFile(path.join(root, `packages/web/dist/components/${dependency}/${dependency}.css`), 'utf8')).replace('@import "../../styles/tokens.css";\n', '')}\n`;
    componentCss = componentCss.replace(`@import "../${dependency}/${dependency}.css";\n`, '');
  }
  await writeFile(path.join(outDir, `${componentId}.css`), `${tokensCss}\n${dependencyCss}\n${componentCss}`);
}

export async function buildNativeControlBrowserFixture(componentId, port) {
  if (!supportedPorts.has(port)) throw new Error(`Unsupported native-control browser port: ${port}`);
  const contract = await loadNativeControlContract(componentId);
  const root = process.cwd();
  const outDir = path.join(root, `dist/browser-fixtures/components/${componentId}`);
  await mkdir(outDir, { recursive: true });
  await writeSharedStyles({ componentId, contract, outDir, root });

  const adapter = await import(`./native-control-adapters/${port}.mjs`);
  await adapter.buildNativeControlPortFixture({
    componentId,
    contract,
    outDir,
    page,
    writeClient,
    writeFile,
    root,
  });
}
