import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createPlan, createTierPlan, parseArg, pathsFromArgs } from './plan.mjs';
import { expandScopes } from './scopes.mjs';

export function createExecutionPlan(validationPlan) { return expandScopes(validationPlan.validationScopes); }

export function executeValidationPlan(validationPlan, { dryRun = false, output } = {}) {
  const execution = createExecutionPlan(validationPlan);
  const report = { validationPlan, execution };
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  if (output) {
    mkdirSync(path.dirname(output), { recursive: true });
    writeFileSync(output, `${JSON.stringify(report, null, 2)}\n`);
  }
  if (dryRun) return execution;
  const env = {
    ...process.env,
    VF_VALIDATION_MODE: validationPlan.mode,
    VF_CHANGED_PATHS: JSON.stringify(validationPlan.changedPaths ?? [])
  };
  for (const item of execution) {
    const [command, ...args] = item.command;
    process.stdout.write(`\n[validation:${item.scope}] ${command} ${args.join(' ')}\n`);
    try {
      execFileSync(command, args, { stdio: 'inherit', env });
    } catch (error) {
      if (output) {
        report.failedScope = item.scope;
        writeFileSync(output, `${JSON.stringify(report, null, 2)}\n`);
      }
      throw error;
    }
  }
  return execution;
}

if (fileURLToPath(import.meta.url) === process.argv[1]) {
  const mode = parseArg('--mode') || 'pr';
  const validationPlan = mode === 'pr' ? createPlan(pathsFromArgs(process.argv)) : createTierPlan(mode);
  executeValidationPlan(validationPlan, { dryRun: process.argv.includes('--dry-run'), output: parseArg('--output') });
}
