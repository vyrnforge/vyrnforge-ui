import { execFileSync } from 'node:child_process';

function canResolve(ref) {
  try {
    execFileSync('git', ['rev-parse', '--verify', ref], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

const explicit = process.env.CHANGESETS_BASE_REF;
const baseRef = explicit || (canResolve('main') ? 'main' : canResolve('origin/main') ? 'origin/main' : null);
if (!baseRef) {
  throw new Error('Changesets status requires a resolvable main/origin/main base. Fetch repository history or set CHANGESETS_BASE_REF.');
}

const pnpm = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
execFileSync(pnpm, ['exec', 'changeset', 'status', '--since', baseRef], {
  stdio: 'inherit',
  env: process.env,
});
