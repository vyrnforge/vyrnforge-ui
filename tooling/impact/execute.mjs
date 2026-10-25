import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { fileURLToPath } from 'node:url';
import { createPlan, createTierPlan, parseArg, pathsFromArgs } from './plan.mjs';
import { expandScopes } from './scopes.mjs';

export function createExecutionPlan(validationPlan) {
  return expandScopes(validationPlan.validationScopes).map((item) => ({
    ...item,
    reasons: item.selected
      ? (validationPlan.scopeReasons?.[item.scope] ?? ['selected validation scope'])
      : item.requiredBy.map((scope) => `prerequisite for ${scope}`),
  }));
}

export function browserProjectsForExecution(execution) {
  const browserScopes = execution.map((item) => item.scope).filter((scope) => scope.includes('browser'));
  if (browserScopes.length === 0) return [];
  if (browserScopes.some((scope) => scope.endsWith('browser-cross') || scope === 'browser-docs-cross')) return ['chromium', 'firefox', 'webkit'];
  return ['chromium'];
}

function durationMs(startedAt, now) { return Math.round((now() - startedAt) * 100) / 100; }
function persistReport(report, output) {
  if (!output) return;
  mkdirSync(path.dirname(output), { recursive: true });
  writeFileSync(output, `${JSON.stringify(report, null, 2)}\n`);
}

export function executeValidationPlan(validationPlan, { dryRun = false, output, runCommand = execFileSync, now = () => performance.now() } = {}) {
  const execution = createExecutionPlan(validationPlan);
  const report = { validationPlan, execution, browserSetup: null, results: [] };
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  persistReport(report, output);
  if (dryRun) return execution;

  let env = {
    ...process.env,
    VF_VALIDATION_MODE: validationPlan.mode,
    VF_CHANGED_PATHS: JSON.stringify(validationPlan.changedPaths ?? [])
  };

  const projects = browserProjectsForExecution(execution);
  if (projects.length) {
    const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx';
    process.stdout.write(`\n[validation:browser-setup] ${npx} playwright install --with-deps ${projects.join(' ')}\n`);
    const startedAt = now();
    try {
      runCommand(npx, ['playwright', 'install', '--with-deps', ...projects], { stdio: 'inherit', env });
      report.browserSetup = { projects, outcome: 'success', durationMs: durationMs(startedAt, now) };
      env = { ...env, VF_PLAYWRIGHT_READY: '1' };
    } catch (error) {
      report.browserSetup = { projects, outcome: 'failure', durationMs: durationMs(startedAt, now), exitCode: error?.status ?? null };
      persistReport(report, output);
      throw error;
    }
    persistReport(report, output);
  }

  for (const item of execution) {
    const [command, ...args] = item.command;
    process.stdout.write(`\n[validation:${item.scope}] ${command} ${args.join(' ')}\n`);
    const startedAt = now();
    try {
      runCommand(command, args, { stdio: 'inherit', env });
      report.results.push({ scope: item.scope, selected: item.selected, requiredBy: item.requiredBy, reasons: item.reasons, outcome: 'success', durationMs: durationMs(startedAt, now) });
    } catch (error) {
      report.results.push({ scope: item.scope, selected: item.selected, requiredBy: item.requiredBy, reasons: item.reasons, outcome: 'failure', durationMs: durationMs(startedAt, now), exitCode: error?.status ?? null });
      persistReport(report, output);
      throw error;
    }
    persistReport(report, output);
  }
  return execution;
}

if (fileURLToPath(import.meta.url) === process.argv[1]) {
  const mode = parseArg('--mode') || 'pr';
  const validationPlan = mode === 'pr' ? createPlan(pathsFromArgs(process.argv)) : createTierPlan(mode);
  executeValidationPlan(validationPlan, { dryRun: process.argv.includes('--dry-run'), output: parseArg('--output') });
}
