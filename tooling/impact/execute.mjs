import { execFileSync, spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { fileURLToPath } from 'node:url';
import { componentBrowserServerManagedEnv } from '../testing/component-browser-runtime.mjs';
import { createPlan, createTierPlan, parseArg, pathsFromArgs } from './plan.mjs';
import { expandScopes } from './scopes.mjs';

const componentBrowserServerUrl = 'http://127.0.0.1:4173/next/';

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

export function isComponentBrowserScope(scope) {
  return /^component:[^:]+:[^:]+:browser(?:-cross)?$/.test(scope);
}

function durationMs(startedAt, now) { return Math.round((now() - startedAt) * 100) / 100; }
function persistReport(report, output) {
  if (!output) return;
  mkdirSync(path.dirname(output), { recursive: true });
  writeFileSync(output, `${JSON.stringify(report, null, 2)}\n`);
}
function delay(milliseconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}
async function docsServerResponds(fetchUrl = fetch) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 500);
  try {
    await fetchUrl(componentBrowserServerUrl, { signal: controller.signal });
    return true;
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

export async function startComponentBrowserServer({ env = process.env, spawnProcess = spawn, fetchUrl = fetch, timeoutMs = 15_000, pollIntervalMs = 100 } = {}) {
  const serverProcess = spawnProcess(process.execPath, ['tooling/docs/serve.mjs'], { stdio: 'inherit', env });
  let spawnError = null;
  const captureSpawnError = (error) => { spawnError = error; };
  serverProcess.once('error', captureSpawnError);
  const deadline = Date.now() + timeoutMs;
  try {
    await delay(Math.min(pollIntervalMs, 50));
    while (Date.now() < deadline) {
      if (spawnError) throw spawnError;
      if (serverProcess.exitCode !== null || serverProcess.signalCode !== null) {
        throw new Error(`Component browser docs server exited before readiness (code ${serverProcess.exitCode ?? 'none'}, signal ${serverProcess.signalCode ?? 'none'})`);
      }
      if (await docsServerResponds(fetchUrl)) return serverProcess;
      await delay(pollIntervalMs);
    }
    throw new Error(`Component browser docs server did not become ready at ${componentBrowserServerUrl} within ${timeoutMs}ms`);
  } catch (error) {
    if (serverProcess.exitCode === null && serverProcess.signalCode === null) serverProcess.kill();
    throw error;
  } finally {
    serverProcess.off('error', captureSpawnError);
  }
}

export function stopComponentBrowserServer(serverProcess) {
  if (serverProcess?.exitCode === null && serverProcess?.signalCode === null) serverProcess.kill();
}

export async function executeValidationPlan(validationPlan, {
  dryRun = false,
  output,
  runCommand = execFileSync,
  now = () => performance.now(),
  startBrowserServer = startComponentBrowserServer,
  stopBrowserServer = stopComponentBrowserServer,
} = {}) {
  const execution = createExecutionPlan(validationPlan);
  const report = { validationPlan, execution, browserSetup: null, componentBrowserServer: null, results: [] };
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  persistReport(report, output);
  if (dryRun) return execution;

  const env = {
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
      env.VF_PLAYWRIGHT_READY = '1';
    } catch (error) {
      report.browserSetup = { projects, outcome: 'failure', durationMs: durationMs(startedAt, now), exitCode: error?.status ?? null };
      persistReport(report, output);
      throw error;
    }
    persistReport(report, output);
  }

  let componentBrowserServer = null;
  let componentBrowserServerReady = false;
  try {
    for (const item of execution) {
      const componentBrowserScope = isComponentBrowserScope(item.scope);
      if (componentBrowserScope && !componentBrowserServerReady) {
        process.stdout.write(`\n[validation:component-browser-server] ${process.execPath} tooling/docs/serve.mjs\n`);
        const startedAt = now();
        try {
          componentBrowserServer = await startBrowserServer({ env });
          componentBrowserServerReady = true;
          report.componentBrowserServer = { outcome: 'success', durationMs: durationMs(startedAt, now) };
        } catch (error) {
          report.componentBrowserServer = { outcome: 'failure', durationMs: durationMs(startedAt, now), exitCode: error?.status ?? null };
          persistReport(report, output);
          throw error;
        }
        persistReport(report, output);
      }

      const [command, ...args] = item.command;
      process.stdout.write(`\n[validation:${item.scope}] ${command} ${args.join(' ')}\n`);
      const startedAt = now();
      const commandEnv = componentBrowserScope ? { ...env, [componentBrowserServerManagedEnv]: '1' } : env;
      try {
        runCommand(command, args, { stdio: 'inherit', env: commandEnv });
        report.results.push({ scope: item.scope, selected: item.selected, requiredBy: item.requiredBy, reasons: item.reasons, outcome: 'success', durationMs: durationMs(startedAt, now) });
      } catch (error) {
        report.results.push({ scope: item.scope, selected: item.selected, requiredBy: item.requiredBy, reasons: item.reasons, outcome: 'failure', durationMs: durationMs(startedAt, now), exitCode: error?.status ?? null });
        persistReport(report, output);
        throw error;
      }
      persistReport(report, output);
    }
  } finally {
    if (componentBrowserServerReady) await stopBrowserServer(componentBrowserServer);
  }
  return execution;
}

if (fileURLToPath(import.meta.url) === process.argv[1]) {
  const mode = parseArg('--mode') || 'pr';
  const validationPlan = mode === 'pr' ? createPlan(pathsFromArgs(process.argv)) : createTierPlan(mode);
  await executeValidationPlan(validationPlan, { dryRun: process.argv.includes('--dry-run'), output: parseArg('--output') });
}
