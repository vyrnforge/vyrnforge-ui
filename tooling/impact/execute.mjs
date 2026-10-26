import { execFileSync, spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { fileURLToPath } from 'node:url';
import { componentBrowserServerManagedEnv } from '../testing/component-browser-runtime.mjs';
import { createPlan, createTierPlan, parseArg, pathsFromArgs } from './plan.mjs';
import { expandScopes } from './scopes.mjs';

const componentBrowserServerUrl = 'http://127.0.0.1:4173/next/';
const defaultComponentBrowserConcurrency = 4;

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

export function componentBrowserOwner(scope) {
  return /^component:([^:]+):[^:]+:browser(?:-cross)?$/.exec(scope)?.[1] ?? null;
}

export function isComponentBrowserScope(scope) {
  return componentBrowserOwner(scope) !== null;
}

export function componentBrowserConcurrencyFromEnv(env = process.env) {
  const raw = env.VF_COMPONENT_BROWSER_CONCURRENCY;
  if (raw === undefined || raw === '') return defaultComponentBrowserConcurrency;
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 1) throw new Error(`VF_COMPONENT_BROWSER_CONCURRENCY must be a positive integer, got ${raw}`);
  return value;
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

export function runCommandAsync(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, options);
    let settled = false;
    child.once('error', (error) => {
      if (settled) return;
      settled = true;
      reject(error);
    });
    child.once('exit', (code, signal) => {
      if (settled) return;
      settled = true;
      if (code === 0) {
        resolve();
        return;
      }
      const error = new Error(`${command} ${args.join(' ')} exited with ${code ?? `signal ${signal}`}`);
      error.status = code;
      error.signal = signal;
      reject(error);
    });
  });
}

async function executeComponentBrowserBatch(items, { concurrency, runItem }) {
  const pending = items.map((item, index) => ({ item, index, component: componentBrowserOwner(item.scope) }));
  const active = new Map();
  const activeComponents = new Set();
  let firstFailure = null;

  while (pending.length > 0 || active.size > 0) {
    while (!firstFailure && active.size < concurrency) {
      const pendingIndex = pending.findIndex((task) => !activeComponents.has(task.component));
      if (pendingIndex < 0) break;
      const [task] = pending.splice(pendingIndex, 1);
      activeComponents.add(task.component);
      const promise = Promise.resolve()
        .then(() => runItem(task.item))
        .then(
          () => ({ index: task.index, component: task.component, error: null }),
          (error) => ({ index: task.index, component: task.component, error }),
        );
      active.set(task.index, promise);
    }

    if (active.size === 0) break;
    const settled = await Promise.race(active.values());
    active.delete(settled.index);
    activeComponents.delete(settled.component);
    if (settled.error && !firstFailure) firstFailure = settled.error;
  }

  if (firstFailure) throw firstFailure;
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
  runBrowserCommand,
  now = () => performance.now(),
  startBrowserServer = startComponentBrowserServer,
  stopBrowserServer = stopComponentBrowserServer,
  componentBrowserConcurrency,
} = {}) {
  const execution = createExecutionPlan(validationPlan);
  const hasComponentBrowserScopes = execution.some((item) => isComponentBrowserScope(item.scope));
  const browserConcurrency = hasComponentBrowserScopes
    ? (componentBrowserConcurrency ?? componentBrowserConcurrencyFromEnv())
    : null;
  if (browserConcurrency !== null && (!Number.isInteger(browserConcurrency) || browserConcurrency < 1)) {
    throw new Error(`componentBrowserConcurrency must be a positive integer, got ${browserConcurrency}`);
  }
  const report = {
    validationPlan,
    execution,
    browserSetup: null,
    componentBrowserServer: null,
    componentBrowserExecution: hasComponentBrowserScopes ? { concurrency: browserConcurrency, isolation: 'component' } : null,
    results: [],
  };
  const executionOrder = new Map(execution.map((item, index) => [item.scope, index]));
  const recordResult = (result) => {
    report.results.push(result);
    report.results.sort((a, b) => executionOrder.get(a.scope) - executionOrder.get(b.scope));
    persistReport(report, output);
  };
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  persistReport(report, output);
  if (dryRun) return execution;

  const env = {
    ...process.env,
    VF_VALIDATION_MODE: validationPlan.mode,
    VF_CHANGED_PATHS: JSON.stringify(validationPlan.changedPaths ?? [])
  };
  const browserCommandRunner = runBrowserCommand
    ?? (runCommand === execFileSync ? runCommandAsync : async (...args) => runCommand(...args));

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
  const ensureComponentBrowserServer = async () => {
    if (componentBrowserServerReady) return;
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
  };
  const runExecutionItem = async (item, componentBrowserScope = false) => {
    const [command, ...args] = item.command;
    process.stdout.write(`\n[validation:${item.scope}] ${command} ${args.join(' ')}\n`);
    const startedAt = now();
    const commandEnv = componentBrowserScope ? { ...env, [componentBrowserServerManagedEnv]: '1' } : env;
    try {
      if (componentBrowserScope) await browserCommandRunner(command, args, { stdio: 'inherit', env: commandEnv });
      else await runCommand(command, args, { stdio: 'inherit', env: commandEnv });
      recordResult({ scope: item.scope, selected: item.selected, requiredBy: item.requiredBy, reasons: item.reasons, outcome: 'success', durationMs: durationMs(startedAt, now) });
    } catch (error) {
      recordResult({ scope: item.scope, selected: item.selected, requiredBy: item.requiredBy, reasons: item.reasons, outcome: 'failure', durationMs: durationMs(startedAt, now), exitCode: error?.status ?? null });
      throw error;
    }
  };

  try {
    for (let index = 0; index < execution.length;) {
      const item = execution[index];
      if (!isComponentBrowserScope(item.scope)) {
        await runExecutionItem(item);
        index += 1;
        continue;
      }

      await ensureComponentBrowserServer();
      const batch = [];
      while (index < execution.length && isComponentBrowserScope(execution[index].scope)) {
        batch.push(execution[index]);
        index += 1;
      }
      await executeComponentBrowserBatch(batch, {
        concurrency: browserConcurrency,
        runItem: (browserItem) => runExecutionItem(browserItem, true),
      });
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
