import { describe, expect, test } from 'vitest';
import * as catalog from '@vyrnforge/icons';
import { cameraIcon } from '@vyrnforge/icons/camera';
import { chevronDownIcon } from '@vyrnforge/icons/chevron-down';
import { searchIcon } from '@vyrnforge/icons/search';

describe('@vyrnforge/icons catalog', () => {
  test('exports every catalog entry as a complete shared IconDefinition', () => {
    const definitions = Object.entries(catalog).filter(([name]) => name.endsWith('Icon'));
    expect(definitions).toHaveLength(93);

    for (const [exportName, icon] of definitions) {
      expect(icon.name, exportName).toBeTruthy();
      expect(icon.viewBox, exportName).toBeTruthy();

      for (const variant of ['outlined', 'filled']) {
        for (const shape of ['rounded', 'sharp']) {
          const glyph = icon.variants[variant][shape];
          expect(glyph.paths.length, exportName + ':' + variant + ':' + shape).toBeGreaterThan(0);
          for (const path of glyph.paths) {
            expect(path.d.trim(), exportName + ':' + variant + ':' + shape).not.toBe('');
          }
        }
      }
    }
  });

  test('granular subpaths expose the same reusable definition contract', () => {
    expect(searchIcon.name).toBe('search');
    expect(chevronDownIcon.name).toBe('chevron-down');
    expect(cameraIcon.name).toBe('camera');
  });
});
