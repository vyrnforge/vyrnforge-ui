import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { executeValidationPlan } from './execute.mjs';
import { createPlan, parseArg } from './plan.mjs';

function gitLines(args, cwd) {
  return execFileSync('git', ['-C', cwd, ...args], { encoding: 'utf8' })
    .split('\n')
    .map((value) => value.trim())
    .filter(Boolean);
}

export function localChangedPaths({ cwd = process.cwd(), baseRef = process.env.VF_BASE_REF || 'origin/main' } = {}) {
  let mergeBase;
  try {
    [mergeBase] = gitLines(['merge-base', 'HEAD', baseRef], cwd);
  } catch {
    throw new Error(`Unable to resolve local validation base ${baseRef}. Set VF_BASE_REF or pass --base-ref to a reachable ref.`);
  }

  const paths = new Set([
    ...gitLines(['diff', '--name-only', `${mergeBase}...HEAD`], cwd),
    ...gitLines(['diff', '--name-only', 'HEAD'], cwd),
    ...gitLines(['ls-files', '--others', '--exclude-standard'], cwd),
  ]);

  return [...paths].sort();
}

if (fileURLToPath(import.meta.url) === process.argv[1]) {
  const baseRef = parseArg('--base-ref') || process.env.VF_BASE_REF || 'origin/main';
  const changedPaths = localChangedPaths({ baseRef });

  if (changedPaths.length === 0) {
    process.stdout.write(`No changes detected relative to ${baseRef}; targeted validation is not required.\n`);
    process.exit(0);
  }

  const plan = createPlan(changedPaths);
  executeValidationPlan(plan, {
    dryRun: process.argv.includes('--dry-run'),
    output: parseArg('--output'),
  });
}
