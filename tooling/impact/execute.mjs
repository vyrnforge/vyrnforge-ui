import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createPlan, createTierPlan, parseArg, pathsFromArgs } from './plan.mjs';
import { expandScopes } from './scopes.mjs';

export function createExecutionPlan(validationPlan) {
  return expandScopes(validationPlan.validationScopes);
}

export function executeValidationPlan(validationPlan, { dryRun = false } = {}) {
  const execution = createExecutionPlan(validationPlan);
  process.stdout.write(`${JSON.stringify({ validationPlan, execution }, null, 2)}\n`);
  if (dryRun) return execution;

  for (const item of execution) {
    const [command, ...args] = item.command;
    process.stdout.write(`\n[validation:${item.scope}] ${command} ${args.join(' ')}\n`);
    execFileSync(command, args, { stdio: 'inherit', env: process.env });
  }
  return execution;
}

if (fileURLToPath(import.meta.url) === process.argv[1]) {
  const mode = parseArg('--mode') || 'pr';
  const validationPlan = mode === 'pr' ? createPlan(pathsFromArgs(process.argv)) : createTierPlan(mode);
  executeValidationPlan(validationPlan, { dryRun: process.argv.includes('--dry-run') });
}
