import { readFileSync } from 'node:fs';
import { Extractor, ExtractorConfig } from '@microsoft/api-extractor';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const packageNames = ['core', 'web', 'icons', 'react', 'angular', 'vue', 'elements'];
const localBuild = process.argv.includes('--local');
let failed = false;

function reportFirstDifference(name, packageRoot) {
  const expectedPath = path.join(packageRoot, 'etc', `${name}.api.md`);
  const actualPath = path.join(packageRoot, 'temp', `${name}.api.md`);
  const expected = readFileSync(expectedPath, 'utf8').split(/\r?\n/);
  const actual = readFileSync(actualPath, 'utf8').split(/\r?\n/);
  const length = Math.max(expected.length, actual.length);
  let index = 0;
  while (index < length && expected[index] === actual[index]) index += 1;
  if (index >= length) return;
  const start = Math.max(0, index - 3);
  const end = Math.min(length, index + 4);
  console.error(`API report first difference for ${name} at line ${index + 1}:`);
  for (let line = start; line < end; line += 1) {
    console.error(`  ${line + 1} expected: ${expected[line] ?? '<missing>'}`);
    console.error(`  ${line + 1} actual:   ${actual[line] ?? '<missing>'}`);
  }
}

for (const name of packageNames) {
  const packageRoot = path.join(root, 'packages', name);
  const manifest = JSON.parse(readFileSync(path.join(packageRoot, 'package.json'), 'utf8'));
  if (typeof manifest.types !== 'string') {
    throw new Error(`${manifest.name} must declare its public type entrypoint before API extraction`);
  }
  const typeEntry = manifest.types.replace(/^\.\//, '');
  const config = ExtractorConfig.prepare({
    configObject: {
      projectFolder: packageRoot,
      mainEntryPointFilePath: `<projectFolder>/${typeEntry}`,
      compiler: { tsconfigFilePath: '<projectFolder>/tsconfig.json' },
      apiReport: {
        enabled: true,
        reportFolder: '<projectFolder>/etc',
        reportTempFolder: '<projectFolder>/temp',
        reportFileName: `${name}.api.md`,
      },
      docModel: { enabled: false },
      dtsRollup: { enabled: false },
      messages: {
        compilerMessageReporting: { default: { logLevel: 'warning' } },
        extractorMessageReporting: {
          default: { logLevel: 'warning' },
          'ae-missing-release-tag': { logLevel: 'none' },
        },
        tsdocMessageReporting: { default: { logLevel: 'none' } },
      },
    },
    configObjectFullPath: path.join(packageRoot, 'api-extractor.json'),
    packageJsonFullPath: path.join(packageRoot, 'package.json'),
  });

  const result = Extractor.invoke(config, {
    localBuild,
    showVerboseMessages: false,
  });

  if (!localBuild && result.apiReportChanged) reportFirstDifference(name, packageRoot);

  // API Extractor reports `succeeded: false` when warnings are emitted. Warnings
  // remain visible for follow-up cleanup, but the contract gate should fail only
  // for extraction errors or an unaccepted API report change.
  failed ||= result.errorCount > 0 || (!localBuild && result.apiReportChanged);
}

if (failed) process.exitCode = 1;
