import { readFileSync } from 'node:fs';
import { Extractor, ExtractorConfig } from '@microsoft/api-extractor';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const packageNames = ['core', 'web', 'icons', 'react', 'angular', 'vue', 'elements'];
const localBuild = process.argv.includes('--local');
let failed = false;

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
  failed ||= !result.succeeded;
}

if (failed) process.exitCode = 1;
