import { describe, expect, it } from 'vitest';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { documentationCoverage } from './documentation-coverage.mjs';

const root = path.resolve(fileURLToPath(new URL('../../', import.meta.url)));

describe('documentation framework coverage', () => {
  it('keeps every canonical component surface documented and executable', () => {
    const coverage = documentationCoverage(root);
    expect(coverage.problems).toEqual([]);
    expect(coverage.cells.length).toBeGreaterThan(0);
    expect(coverage.cells.every((cell) => cell.overlay && cell.example && cell.publicEntrypoint)).toBe(true);
  });

  it('keeps legacy component pages outside canonical coverage enforcement', () => {
    const coverage = documentationCoverage(root);
    expect(coverage.legacyComponents.length).toBeGreaterThan(0);
    expect(new Set(coverage.cells.map((cell) => cell.component)).size).toBeGreaterThan(0);
  });
});
