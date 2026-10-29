import { expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Run the shared structural accessibility scan for browser evidence.
 *
 * This helper intentionally stays small: axe supplements, but never replaces,
 * explicit semantic, keyboard, focus, state, relationship, and interaction assertions.
 */
export async function expectNoAxeViolations(page, { include, disableRules = [] } = {}) {
  let builder = new AxeBuilder({ page });
  if (include) builder = builder.include(include);
  if (disableRules.length) builder = builder.disableRules(disableRules);
  const results = await builder.analyze();
  expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
  return results;
}
