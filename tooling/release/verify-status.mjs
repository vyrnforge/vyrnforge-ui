import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

function git(args, options = {}) {
  const result = execFileSync('git', args, { encoding: 'utf8', ...options });
  return typeof result === 'string' ? result.trim() : '';
}

function canResolve(ref) {
  try {
    git(['rev-parse', '--verify', ref], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function isShallow() {
  try {
    return git(['rev-parse', '--is-shallow-repository']) === 'true';
  } catch {
    return false;
  }
}

const config = JSON.parse(readFileSync(new URL('../../.changeset/config.json', import.meta.url), 'utf8'));
const configuredBase = config.baseBranch || 'main';
const explicit = process.env.CHANGESETS_BASE_REF;

let baseRef = explicit || (canResolve(configuredBase) ? configuredBase : canResolve(`origin/${configuredBase}`) ? `origin/${configuredBase}` : null);
if (!baseRef || isShallow()) {
  const args = ['fetch', '--no-tags'];
  if (isShallow()) args.push('--unshallow');
  args.push('origin', `${configuredBase}:refs/remotes/origin/${configuredBase}`);
  git(args, { stdio: 'inherit' });
  baseRef = explicit || (canResolve(configuredBase) ? configuredBase : canResolve(`origin/${configuredBase}`) ? `origin/${configuredBase}` : null);
}

if (!baseRef) {
  throw new Error(`Changesets status requires a resolvable ${configuredBase} base. Fetch repository history or set CHANGESETS_BASE_REF.`);
}

const pnpm = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
execFileSync(pnpm, ['exec', 'changeset', 'status', '--since', baseRef], {
  stdio: 'inherit',
  env: process.env,
});
