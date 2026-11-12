import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
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

  if (!localBuild && result.apiReportChanged) {
    const acceptedReport = path.join(packageRoot, 'etc', `${name}.api.md`);
    const generatedReport = path.join(packageRoot, 'temp', `${name}.api.md`);
    const diff = spawnSync(
      'git',
      ['diff', '--no-index', '--no-color', '--', acceptedReport, generatedReport],
      { encoding: 'utf8' },
    );
    const output = [diff.stdout, diff.stderr].filter(Boolean).join('');
    if (output) {
      console.error(`\nAPI report diff for ${manifest.name}:\n${output}`);
    }
  }

  // API Extractor reports `succeeded: false` when warnings are emitted. Warnings
  // remain visible for follow-up cleanup, but the contract gate should fail only
  // for extraction errors or an unaccepted API report change.
  failed ||= result.errorCount > 0 || (!localBuild && result.apiReportChanged);
}

if (failed) process.exitCode = 1;
