import { spawn } from 'node:child_process';
import { availableParallelism } from 'node:os';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { discoverProductUnits } from './discover-product-units.mjs';

const discovery = discoverProductUnits();
const evidence = [];
for (const component of discovery.components) {
  if (component.conformanceTypes) evidence.push({ component: component.component, owner: 'conformance', source: component.conformanceTypes });
  for (const [owner, config] of Object.entries(component.ports)) {
    if (config.types) evidence.push({ component: component.component, owner, source: config.types });
  }
}

if (!evidence.length) throw new Error('No discovered component type evidence to validate');

const outputDir = path.resolve('test-results/types');
mkdirSync(outputDir, { recursive: true });
const baseConfig = path.relative(outputDir, path.resolve('tsconfig.base.json')).replaceAll('\\', '/');

const jobs = evidence.map(({ component, owner, source }) => {
  const configPath = path.join(outputDir, `${component}-${owner}.tsconfig.json`);
  const sourcePath = path.relative(outputDir, path.resolve(source)).replaceAll('\\', '/');
  writeFileSync(configPath, `${JSON.stringify({
    extends: baseConfig,
    compilerOptions: { noEmit: true, declaration: false, declarationMap: false, sourceMap: false },
    include: [sourcePath]
  }, null, 2)}\n`);
  return { component, owner, configPath };
});

const concurrency = Math.max(1, Math.min(4, availableParallelism()));
process.stdout.write(`component type batch: ${jobs.length} isolated evidence programs, concurrency ${concurrency}\n`);

let cursor = 0;
let failed = false;

async function worker() {
  while (!failed) {
    const index = cursor++;
    if (index >= jobs.length) return;
    const job = jobs[index];
    try {
      await new Promise((resolve, reject) => {
        const child = spawn(process.execPath, ['node_modules/typescript/bin/tsc', '-p', job.configPath], { stdio: 'inherit' });
        child.once('error', reject);
        child.once('exit', (code, signal) => {
          if (code === 0) {
            resolve();
            return;
          }
          reject(new Error(`Type evidence failed for ${job.component}/${job.owner}${signal ? ` (signal ${signal})` : ` (exit ${code})`}`));
        });
      });
    } catch (error) {
      failed = true;
      throw error;
    }
  }
}

await Promise.all(Array.from({ length: concurrency }, () => worker()));
