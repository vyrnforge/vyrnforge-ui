import { describe, expect, it } from 'vitest';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { documentationCoverage } from './documentation-coverage.mjs';

const root = path.resolve(fileURLToPath(new URL('../../', import.meta.url)));

describe('documentation framework coverage', () => {
  it('keeps every canonical component surface documented and executable', () => {
    const coverage = documentationCoverage(root);
    expect(coverage.problems).toEqual([]);
    expect(coverage.cells).toHaveLength(19);

    const frameworksByComponent = Object.groupBy(
      coverage.cells,
      (cell) => cell.component,
    );

    expect(frameworksByComponent.button.map((cell) => cell.framework).sort()).toEqual(
      ['angular', 'native-web', 'react', 'vue'],
    );
    for (const component of ['dialog', 'icon', 'tabs']) {
      expect(frameworksByComponent[component].map((cell) => cell.framework).sort()).toEqual(
        ['angular', 'elements', 'native-web', 'react', 'vue'],
      );
    }
  });

  it('keeps legacy component pages visible as compatibility debt instead of canonical coverage', () => {
    const coverage = documentationCoverage(root);
    expect(coverage.legacyComponents.length).toBeGreaterThan(0);
    expect(coverage.legacyComponents).toContain('text');
  });
});
