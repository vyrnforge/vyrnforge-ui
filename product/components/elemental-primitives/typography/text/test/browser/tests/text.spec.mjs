import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const port = process.env.VF_COMPONENT_PORT || 'web';

test('Text preserves native semantics and shared typography across ports', async ({ page }) => {
  await page.goto(`/components/text/${port}.html`);

  const heading = page.locator('#heading');
  const body = page.locator('#body');
  const label = page.locator('#label');
  const poster = page.locator('#poster');

  await expect(heading).toHaveJSProperty('tagName', 'H2');
  await expect(body).toHaveJSProperty('tagName', 'P');
  await expect(label).toHaveJSProperty('tagName', 'SPAN');
  await expect(poster).toHaveJSProperty('tagName', 'P');

  await expect(heading).toHaveAttribute('data-vf-text-variant', 'heading-md');
  await expect(body).toHaveAttribute('data-vf-text-variant', 'body-md');
  await expect(label).toHaveAttribute('data-vf-text-variant', 'label-md');
  await expect(poster).toHaveAttribute('data-vf-text-variant', 'poster');

  expect(await heading.evaluate((element) => getComputedStyle(element).fontSize)).toBe('30px');
  expect(await body.evaluate((element) => getComputedStyle(element).fontSize)).toBe('16px');
  expect(await label.evaluate((element) => getComputedStyle(element).fontSize)).toBe('14px');
  expect(await label.evaluate((element) => getComputedStyle(element).fontWeight)).toBe('600');
  expect(await poster.evaluate((element) => getComputedStyle(element).fontSize)).toBe('42px');
  expect(await poster.evaluate((element) => getComputedStyle(element).fontWeight)).toBe('700');

  
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test('Native Web composes Text typography with semantic and component hooks on one element', async ({ page, browserName }) => {
  test.skip(port !== 'web', 'Native Web composition evidence');

  await page.goto('/components/text/web.html');

  const semanticHeading = page.locator('#semantic-heading');
  await expect(semanticHeading).toHaveJSProperty('tagName', 'H1');
  expect(await semanticHeading.evaluate((element) => getComputedStyle(element).fontSize)).toBe('14px');
  expect(await semanticHeading.evaluate((element) => getComputedStyle(element).fontWeight)).toBe('400');

  const link = page.locator('#composed-link');
  await expect(link).toHaveJSProperty('tagName', 'A');
  await expect(link).toHaveAttribute('href', '#target');
  expect(await link.evaluate((element) => getComputedStyle(element).fontSize)).toBe('14px');
  expect(await link.evaluate((element) => getComputedStyle(element).fontWeight)).toBe('400');
  expect(await link.evaluate((element) => getComputedStyle(element).textDecorationLine)).toContain('underline');
  expect(await link.evaluate((element) => getComputedStyle(element).color)).not.toBe('rgb(24, 24, 27)');

  const button = page.locator('#composed-button');
  await expect(button).toHaveJSProperty('tagName', 'BUTTON');
  expect(await button.evaluate((element) => getComputedStyle(element).fontSize)).toBe('12px');
  expect(await button.evaluate((element) => getComputedStyle(element).fontWeight)).toBe('600');
  expect(await button.evaluate((element) => getComputedStyle(element).backgroundColor)).not.toBe('rgba(0, 0, 0, 0)');
  expect(await button.evaluate((element) => getComputedStyle(element).color)).not.toBe('rgb(24, 24, 27)');

  const defaultCode = page.locator('#default-code');
  const composedCode = page.locator('#composed-code');
  expect(await defaultCode.evaluate((element) => getComputedStyle(element).fontSize)).toBe('14px');
  expect(await composedCode.evaluate((element) => getComputedStyle(element).fontSize)).toBe('20px');
  expect(await composedCode.evaluate((element) => getComputedStyle(element).fontFamily)).toMatch(/mono/i);

  const defaultKbd = page.locator('#default-kbd');
  const composedKbd = page.locator('#composed-kbd');
  expect(await defaultKbd.evaluate((element) => getComputedStyle(element).fontSize)).toBe('14px');
  expect(await composedKbd.evaluate((element) => getComputedStyle(element).fontSize)).toBe('14px');
  expect(await composedKbd.evaluate((element) => getComputedStyle(element).fontFamily)).toMatch(/mono/i);

  const mark = page.locator('#composed-mark');
  await expect(mark).toHaveJSProperty('tagName', 'MARK');
  expect(await mark.evaluate((element) => getComputedStyle(element).fontSize)).toBe('20px');
  expect(await mark.evaluate((element) => getComputedStyle(element).backgroundColor)).not.toBe('rgba(0, 0, 0, 0)');

  const proseHeading = page.locator('#prose-heading');
  const proseExplicit = page.locator('#prose-explicit');
  await expect(proseHeading).toHaveJSProperty('tagName', 'H1');
  await expect(proseExplicit).toHaveJSProperty('tagName', 'H2');
  expect(await proseHeading.evaluate((element) => getComputedStyle(element).fontSize)).toBe('36px');
  expect(await proseExplicit.evaluate((element) => getComputedStyle(element).fontSize)).toBe('14px');

  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);

  if (browserName === 'chromium') {
    await page.screenshot({
      path: test.info().outputPath('text-native-composition.png'),
      fullPage: true,
    });
  }
});

test('React Link and Button project Text composition onto one native element', async ({ page, browserName }) => {
  test.skip(port !== 'react', 'React typography composition evidence');

  await page.goto('/components/text/react.html');

  const link = page.locator('#react-composed-link');
  await expect(link).toHaveJSProperty('tagName', 'A');
  await expect(link).toHaveAttribute('href', '#react-target');
  await expect(link).toHaveAttribute('data-vf-link', '');
  await expect(link).toHaveAttribute('data-vf-text', '');
  await expect(link).toHaveAttribute('data-vf-text-variant', 'body-sm');
  expect(await link.evaluate((element) => getComputedStyle(element).fontSize)).toBe('14px');
  expect(await link.evaluate((element) => getComputedStyle(element).fontWeight)).toBe('400');
  expect(await link.evaluate((element) => getComputedStyle(element).textDecorationLine)).toContain('underline');

  const defaultLink = page.locator('#react-default-link');
  await expect(defaultLink).toHaveAttribute('data-vf-link', '');
  await expect(defaultLink).not.toHaveAttribute('data-vf-text', '');
  await expect(defaultLink).not.toHaveAttribute('data-vf-text-variant', 'body-sm');
  expect(await defaultLink.evaluate((element) => getComputedStyle(element).fontWeight)).toBe('500');

  const button = page.locator('#react-composed-button');
  await expect(button).toHaveJSProperty('tagName', 'BUTTON');
  await expect(button).toHaveAttribute('type', 'button');
  await expect(button).toHaveAttribute('data-vf-button', '');
  await expect(button).toHaveAttribute('data-vf-text', '');
  await expect(button).toHaveAttribute('data-vf-text-variant', 'label-sm');
  expect(await button.evaluate((element) => getComputedStyle(element).fontSize)).toBe('12px');
  expect(await button.evaluate((element) => getComputedStyle(element).fontWeight)).toBe('600');

  const defaultButton = page.locator('#react-default-button');
  await expect(defaultButton).toHaveAttribute('data-vf-button', '');
  await expect(defaultButton).not.toHaveAttribute('data-vf-text', '');
  await expect(defaultButton).not.toHaveAttribute('data-vf-text-variant', 'label-sm');

  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);

  if (browserName === 'chromium') {
    await page.screenshot({
      path: test.info().outputPath('text-react-composition.png'),
      fullPage: true,
    });
  }
});
