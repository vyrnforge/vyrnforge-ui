import { mkdir, writeFile } from 'node:fs/promises';
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
  // Bundle the actual projected CSS dependency graph instead of concatenating
  // component files whose nested imports resolve relative to a different path.
  const styles = ['styles/tokens.css', ...(contract.styleDependencies ?? []).map(id => 'components/' + id + '/' + id + '.css'), 'components/' + componentId + '/' + componentId + '.css'];
  await build({
    stdin: {
      contents: styles.map(file => '@import "./' + file + '";').join('\n'),
      resolveDir: path.join(root, 'packages/web/dist'),
      loader: 'css',
    },
    bundle: true,
    outfile: path.join(outDir, componentId + '.css'),
  });
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
