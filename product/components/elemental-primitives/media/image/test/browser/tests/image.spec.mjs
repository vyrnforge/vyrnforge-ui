import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const imagePort = process.env.VF_COMPONENT_PORT === 'react' ? 'react' : 'web';
const imageFixtureUrl = '/components/image/' + imagePort + '.html';


test('Image preserves native img semantics and responsive presentation', async ({ page }) => {
  await page.goto(imageFixtureUrl);
  const image = page.locator('#image');

  await expect(image).toHaveJSProperty('tagName', 'IMG');
  await expect(image).toHaveAttribute('alt', 'Sample placeholder');
  await expect(image).toHaveAttribute('width', '16');
  await expect(image).toHaveAttribute('height', '16');
  await expect(image).toHaveAttribute('loading', 'lazy');
  await expect(image).toHaveAttribute('decoding', 'async');
  await expect(image).toHaveAttribute('fetchpriority', 'low');
  await expect(image).toHaveAttribute('referrerpolicy', 'no-referrer');
  await expect(image).toHaveAttribute('sizes', '16px');

  expect(await image.evaluate((el) => getComputedStyle(el).display)).toBe('block');
  expect(await image.evaluate((el) => getComputedStyle(el).maxInlineSize)).toBe('100%');
  expect(await image.evaluate((el) => getComputedStyle(el).blockSize)).toBe('16px');

  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test('Image shrinks inside a narrow container without distorting intrinsic ratio', async ({ page }) => {
  await page.goto(imageFixtureUrl);

  const image = page.locator('#responsive-image');
  await expect(image).toHaveAttribute('width', '640');
  await expect(image).toHaveAttribute('height', '320');
  await expect(image).toHaveAttribute('alt', 'Pale blue rectangle');

  const dimensions = await image.evaluate((el) => {
    const rect = el.getBoundingClientRect();
    return { width: rect.width, height: rect.height };
  });
  expect(dimensions.width).toBeGreaterThan(0);
  expect(dimensions.width).toBeLessThanOrEqual(120);
  expect(Math.abs(dimensions.height - dimensions.width / 2)).toBeLessThan(1);
});

test('Image keeps decorative alt and native figure caption semantics', async ({ page }) => {
  await page.goto(imageFixtureUrl);

  const decorative = page.locator('#decorative-image');
  await expect(decorative).toHaveAttribute('alt', '');
  await expect(decorative).toHaveJSProperty('tabIndex', -1);
  expect(await decorative.getAttribute('role')).toBeNull();
  expect(await decorative.getAttribute('aria-hidden')).toBeNull();

  const figure = page.locator('#captioned-figure');
  await expect(figure).toHaveJSProperty('tagName', 'FIGURE');
  await expect(figure.locator('img')).toHaveAttribute('alt', 'Blue circle on a light background');
  await expect(figure.locator('figcaption')).toHaveText('Simple geometric study');
});

test('React Image keeps a real image DOM ref after hydration', async ({ page }) => {
  test.skip(imagePort !== 'react', 'This ref integration applies to the React port only');
  await page.goto(imageFixtureUrl);
  await expect(page.locator('body')).toHaveAttribute('data-image-ref-attached', 'true');
  await expect(page.locator('#image')).toHaveJSProperty('tagName', 'IMG');
  await expect(page.locator('img[data-vf-image]')).toHaveCount(4);
});
