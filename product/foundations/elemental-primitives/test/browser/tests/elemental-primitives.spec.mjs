import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const port = process.env.VF_COMPONENT_PORT || 'web';

test('Elemental primitives preserve native semantics and shared presentation', async ({ page }) => {
  test.skip(port !== 'web', `Elemental primitives have no ${port} browser surface to validate.`);

  await page.goto(`/components/elemental-primitives/${port}.html`);

  await expect(page.locator('#code')).toHaveJSProperty('tagName', 'CODE');
  await expect(page.locator('#kbd')).toHaveJSProperty('tagName', 'KBD');
  await expect(page.locator('#mark')).toHaveJSProperty('tagName', 'MARK');
  await expect(page.locator('#image')).toHaveJSProperty('tagName', 'IMG');
  await expect(page.locator('#skeleton')).toHaveAttribute('aria-hidden', 'true');
  await expect(page.locator('#swatch')).toHaveAttribute('aria-label', 'Brand blue');

  expect(await page.locator('#code').evaluate((el) => getComputedStyle(el).fontFamily)).toMatch(/mono/i);
  expect(await page.locator('#code').evaluate((el) => getComputedStyle(el).backgroundColor)).not.toBe('rgba(0, 0, 0, 0)');
  expect(await page.locator('#kbd').evaluate((el) => getComputedStyle(el).display)).toBe('inline-block');
  expect(await page.locator('#image').evaluate((el) => getComputedStyle(el).maxInlineSize)).toBe('100%');
  expect(await page.locator('#skeleton').evaluate((el) => getComputedStyle(el).animationName)).toBe('vf-skeleton-pulse');
  expect(await page.locator('#swatch').evaluate((el) => getComputedStyle(el).width)).toBe('20px');
  expect(await page.locator('#prose h2').evaluate((el) => getComputedStyle(el).fontWeight)).toBe('600');
  expect(await page.locator('#prose blockquote').evaluate((el) => getComputedStyle(el).borderInlineStartWidth)).toBe('3px');
  expect(await page.locator('#checkmark').evaluate((el) => getComputedStyle(el).width)).toBe('8px');
  expect(await page.locator('#radiomark').evaluate((el) => getComputedStyle(el).borderRadius)).not.toBe('0px');
  expect(await page.locator('#selection').evaluate((el) => getComputedStyle(el).backgroundColor)).not.toBe('rgba(0, 0, 0, 0)');

  for (const tag of ['blockquote', 'q', 'figure', 'figcaption', 'ul', 'li', 'strong', 'em', 'small', 'sub', 'sup', 'abbr', 'address', 'cite', 'time']) {
    await expect(page.locator(`#prose ${tag}`).first()).toHaveJSProperty('tagName', tag.toUpperCase());
  }

  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);

  await page.emulateMedia({ reducedMotion: 'reduce' });
  expect(await page.locator('#skeleton').evaluate((el) => getComputedStyle(el).animationName)).toBe('none');
});
test('Elemental primitives keep native attributes, scoped tokens, and accessible loading context', async ({ page }) => {
  test.skip(port !== 'web', `Elemental primitives have no ${port} browser surface to validate.`);

  await page.goto('/components/elemental-primitives/web.html');

  const image = page.locator('#image');
  await expect(image).toHaveAttribute('alt', 'Sample placeholder');
  await expect(image).toHaveAttribute('width', '16');
  await expect(image).toHaveAttribute('height', '16');
  await expect(image).toHaveAttribute('loading', 'lazy');
  await expect(image).toHaveAttribute('decoding', 'async');

  await expect(page.locator('#loading-region')).toHaveAttribute('aria-busy', 'true');
  await expect(page.locator('#skeleton')).toHaveAttribute('aria-hidden', 'true');
  await expect(page.locator('#loading-announcement')).toHaveAttribute('role', 'status');
  await expect(page.locator('#loading-announcement')).toHaveText('Loading latest activity');
  await expect(page.locator('#swatch')).toHaveAttribute('aria-label', 'Brand blue');

  const scopedHeadingWeight = await page.locator('#prose h2').evaluate((el) => getComputedStyle(el).fontWeight);
  const unscopedHeadingWeight = await page.locator('#unscoped-heading').evaluate((el) => getComputedStyle(el).fontWeight);
  expect(scopedHeadingWeight).toBe('600');
  expect(unscopedHeadingWeight).not.toBe(scopedHeadingWeight);
  expect(await page.locator('#unscoped-quote').evaluate((el) => getComputedStyle(el).borderInlineStartWidth)).toBe('0px');
  expect(await page.locator('#scoped-mark').evaluate((el) => getComputedStyle(el).backgroundColor)).toBe('rgb(200, 225, 255)');
});

test('Elemental primitives retain high-contrast mark emphasis and visible native boundaries', async ({ page }) => {
  test.skip(port !== 'web', `Elemental primitives have no ${port} browser surface to validate.`);

  await page.emulateMedia({ forcedColors: 'active' });
  await page.goto('/components/elemental-primitives/web.html');

  const colors = await page.evaluate(() => {
    const probe = document.createElement('span');
    probe.style.backgroundColor = 'Highlight';
    probe.style.color = 'HighlightText';
    document.body.append(probe);
    const expectedBackground = getComputedStyle(probe).backgroundColor;
    const expectedText = getComputedStyle(probe).color;
    probe.remove();

    const mark = getComputedStyle(document.querySelector('#mark'));
    const kbd = getComputedStyle(document.querySelector('#kbd'));
    const codeBlock = getComputedStyle(document.querySelector('#code-block'));
    return {
      markBackground: mark.backgroundColor,
      markText: mark.color,
      expectedBackground,
      expectedText,
      kbdBorderStyle: kbd.borderTopStyle,
      codeBlockBorderStyle: codeBlock.borderTopStyle,
    };
  });

  expect(colors.markBackground).toBe(colors.expectedBackground);
  expect(colors.markText).toBe(colors.expectedText);
  expect(colors.kbdBorderStyle).toBe('solid');
  expect(colors.codeBlockBorderStyle).toBe('solid');
});
