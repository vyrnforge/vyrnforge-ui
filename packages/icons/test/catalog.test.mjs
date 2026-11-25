import { describe, expect, test } from 'vitest';
import * as catalog from '@vyrnforge/icons';
import { cameraIcon } from '@vyrnforge/icons/camera';
import { chevronDownIcon } from '@vyrnforge/icons/chevron-down';
import { searchIcon } from '@vyrnforge/icons/search';
import { arrowDownIcon } from '@vyrnforge/icons/arrow-down';
import { arrowLeftIcon } from '@vyrnforge/icons/arrow-left';
import { arrowRightIcon } from '@vyrnforge/icons/arrow-right';
import { checkCircleIcon } from '@vyrnforge/icons/check-circle';
import { microphoneOffIcon } from '@vyrnforge/icons/microphone-off';

import { alignLeftIcon } from '@vyrnforge/icons/align-left';
import { alignCenterIcon } from '@vyrnforge/icons/align-center';
import { alignRightIcon } from '@vyrnforge/icons/align-right';
import { boldIcon } from '@vyrnforge/icons/bold';
import { italicIcon } from '@vyrnforge/icons/italic';
import { underlineIcon } from '@vyrnforge/icons/underline';
import { strikethroughIcon } from '@vyrnforge/icons/strikethrough';
import { wrapTextIcon } from '@vyrnforge/icons/wrap-text';

describe('@vyrnforge/icons catalog', () => {
  test('exports every catalog entry as a complete shared IconDefinition', () => {
    const definitions = Object.entries(catalog).filter(([name]) => name.endsWith('Icon'));
    expect(definitions).toHaveLength(101);

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

  test('cardinal arrowheads remain inside the 24-unit viewBox in rounded and sharp artwork', () => {
    const arrowheads = [
      [arrowDownIcon, 'M6 13l6 6 6-6'],
      [arrowLeftIcon, 'M11 6l-6 6 6 6'],
      [arrowRightIcon, 'M13 6l6 6-6 6'],
    ];
    for (const [icon, expected] of arrowheads) {
      for (const shape of ['rounded', 'sharp']) {
        expect(icon.variants.outlined[shape].paths[1].d, icon.name + ':' + shape)
          .toBe(expected);
      }
    }
  });

  test('outlined status circle is closed and disabled microphone remains within its viewBox', () => {
    expect(checkCircleIcon.variants.outlined.rounded.paths[1].d)
      .toBe('M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z');
    for (const shape of ['rounded', 'sharp']) {
      const path = microphoneOffIcon.variants.filled[shape].paths[0].d;
      expect(path).toContain('V21H17v2H7v-2h3.5');
      expect(path).not.toContain('V22H17v2H7v-2h3.5');
    }
  });

  test('granular subpaths expose the same reusable definition contract', () => {
    expect(searchIcon.name).toBe('search');
    expect(chevronDownIcon.name).toBe('chevron-down');
    expect(cameraIcon.name).toBe('camera');
    expect(alignLeftIcon).toBe(catalog.alignLeftIcon);
    expect(alignCenterIcon).toBe(catalog.alignCenterIcon);
    expect(alignRightIcon).toBe(catalog.alignRightIcon);
    expect(boldIcon).toBe(catalog.boldIcon);
    expect(italicIcon).toBe(catalog.italicIcon);
    expect(underlineIcon).toBe(catalog.underlineIcon);
    expect(strikethroughIcon).toBe(catalog.strikethroughIcon);
    expect(wrapTextIcon).toBe(catalog.wrapTextIcon);
  });
});
