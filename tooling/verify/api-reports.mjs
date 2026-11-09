import { readFileSync, writeFileSync } from 'node:fs';
import { Extractor, ExtractorConfig } from '@microsoft/api-extractor';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { publicPackageNames } from './public-package-model.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const localBuild = process.argv.includes('--local');

function arg(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function selectedPackages() {
  const raw = arg('--packages') ?? process.env.VF_PACKAGE_SCOPE ?? '';
  if (!raw.trim()) return [...publicPackageNames];
  const selected = [...new Set(raw.split(',').map((value) => value.trim()).filter(Boolean))].sort();
  const unknown = selected.filter((name) => !publicPackageNames.includes(name));
  if (unknown.length) throw new Error(`Unknown API report package scope: ${unknown.join(', ')}`);
  return selected;
}

let failed = false;
for (const name of selectedPackages()) {
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

  if (!localBuild && name === 'react' && result.apiReportChanged) {
    const generated = readFileSync(path.join(packageRoot, 'temp', 'react.api.md'), 'utf8');
    for (const marker of ['export interface ButtonProps', 'export interface LinkProps', 'export type LinkProps']) {
      const index = generated.indexOf(marker);
      if (index >= 0) {
        console.error(`API REPORT DIAGNOSTIC [${marker}]\n${generated.slice(Math.max(0, index - 120), index + 700)}`);
      }
    }

    const committed = readFileSync(path.join(packageRoot, 'etc', 'react.api.md'), 'utf8');
    const eolStats = (value) => ({
      length: value.length,
      crlf: (value.match(/\\r\\n/g) ?? []).length,
      bareLf: (value.match(/(^|[^\\r])\\n/g) ?? []).length,
      finalCodes: [...value.slice(-8)].map((char) => char.charCodeAt(0)),
    });
    console.error('API REPORT EOL DIAGNOSTIC', JSON.stringify({
      generated: eolStats(generated),
      committed: eolStats(committed),
    }));

    const normalize = (value) => value.replace(/\\r\\n/g, '\\n').replace(/\\r/g, '\\n');
    const generatedNormalized = normalize(generated);
    const committedNormalized = normalize(committed);
    let firstDiff = -1;
    const maxLength = Math.max(generatedNormalized.length, committedNormalized.length);
    for (let i = 0; i < maxLength; i += 1) {
      if (generatedNormalized[i] !== committedNormalized[i]) {
        firstDiff = i;
        break;
      }
    }
    console.error('API REPORT FIRST DIFF', JSON.stringify({
      firstDiff,
      generatedLength: generatedNormalized.length,
      committedLength: committedNormalized.length,
      generatedContext: firstDiff >= 0 ? generatedNormalized.slice(Math.max(0, firstDiff - 240), firstDiff + 480) : '',
      committedContext: firstDiff >= 0 ? committedNormalized.slice(Math.max(0, firstDiff - 240), firstDiff + 480) : '',
    }));
    writeFileSync(path.join(root, 'test-results', 'generated-react.api.md'), generated);
  }

  // API Extractor reports `succeeded: false` when warnings are emitted. Warnings
  // remain visible for follow-up cleanup, but the contract gate should fail only
  // for extraction errors or an unaccepted API report change.
  failed ||= result.errorCount > 0 || (!localBuild && result.apiReportChanged);
}

if (failed) process.exitCode = 1;
