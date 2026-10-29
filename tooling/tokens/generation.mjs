export function assertGeneratedOutputCurrent(actual, expected) {
  if (actual !== expected) {
    throw new Error('packages/web/src/styles/tokens.css is stale; run pnpm generate:tokens --write');
  }
}
