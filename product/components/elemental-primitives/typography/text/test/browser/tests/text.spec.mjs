import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const port = process.env.VF_COMPONENT_PORT || 'web';

test('Text preserves native semantics and shared typography across ports', async ({ page }) => {
  await page.goto(`/components/text/${port}.html`);

  const heading = page.locator('#heading');
  const body = page.locator('#body');
  const label = page.locator('#label');
  const overline = page.locator('#overline');
  const poster = page.locator('#poster');
  const quote = page.locator('#quote');
  const mark = page.locator('#mark');
  const time = page.locator('#time');

  await expect(heading).toHaveJSProperty('tagName', 'H2');
  await expect(body).toHaveJSProperty('tagName', 'P');
  await expect(label).toHaveJSProperty('tagName', 'SPAN');
  await expect(overline).toHaveJSProperty('tagName', 'SPAN');
  await expect(poster).toHaveJSProperty('tagName', 'P');
  await expect(quote).toHaveJSProperty('tagName', 'BLOCKQUOTE');
  await expect(mark).toHaveJSProperty('tagName', 'MARK');
  await expect(time).toHaveJSProperty('tagName', 'TIME');
  await expect(quote).toHaveAttribute('cite', 'https://example.com/source');
  await expect(time).toHaveAttribute('datetime', '2026-11-10');

  await expect(heading).toHaveAttribute('data-vf-text-variant', 'heading-md');
  await expect(body).toHaveAttribute('data-vf-text-variant', 'body-md');
  await expect(label).toHaveAttribute('data-vf-text-variant', 'label-md');
  await expect(overline).toHaveAttribute('data-vf-text-variant', 'overline');
  await expect(overline).toHaveText('Case-Sensitive Ωß');
  await expect(poster).toHaveAttribute('data-vf-text-variant', 'poster');
  await expect(quote).toHaveAttribute('data-vf-text-variant', 'body-lg');
  await expect(mark).toHaveAttribute('data-vf-text-variant', 'body-md');
  await expect(time).toHaveAttribute('data-vf-text-variant', 'caption');

  expect(await heading.evaluate((element) => getComputedStyle(element).fontSize)).toBe('30px');
  expect(await body.evaluate((element) => getComputedStyle(element).fontSize)).toBe('16px');
  expect(await label.evaluate((element) => getComputedStyle(element).fontSize)).toBe('14px');
  expect(await label.evaluate((element) => getComputedStyle(element).fontWeight)).toBe('600');
  expect(await overline.evaluate((element) => getComputedStyle(element).textTransform)).toBe('none');
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
  expect(await link.evaluate((element) => getComputedStyle(element).fontWeight)).toBe('500');
  expect(await link.evaluate((element) => getComputedStyle(element).textDecorationLine)).toContain('underline');
  expect(await link.evaluate((element) => getComputedStyle(element).color)).not.toBe('rgb(24, 24, 27)');

  const button = page.locator('#composed-button');
  await expect(button).toHaveJSProperty('tagName', 'BUTTON');
  expect(await button.evaluate((element) => getComputedStyle(element).fontSize)).toBe('15px');
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

test('React Code/Kbd reuse native component CSS and optional Text typography roles without losing semantics', async ({ page, browserName }) => {
  test.skip(port !== 'react', 'React composition integration evidence');
  await page.goto('/components/text/react.html');
  const defaultCode = page.locator('#default-code');
  const composedCode = page.locator('#composed-code');
  const block = page.locator('#composed-code-block');
  const defaultKbd = page.locator('#default-kbd');
  const composedKbd = page.locator('#composed-kbd');
  await expect(defaultCode).toHaveJSProperty('tagName', 'CODE');
  await expect(composedCode).toHaveAttribute('data-vf-code', '');
  await expect(composedCode).toHaveAttribute('data-vf-text-variant', 'body-lg');
  await expect(block).toHaveJSProperty('tagName', 'PRE');
  await expect(block.locator('code')).toHaveText('pnpm build');
  await expect(defaultKbd).toHaveJSProperty('tagName', 'KBD');
  await expect(composedKbd).toHaveAttribute('data-vf-kbd', '');
  await expect(composedKbd).toHaveAttribute('data-vf-text-variant', 'body-sm');
  expect(await defaultCode.evaluate(el => getComputedStyle(el).fontSize)).toBe('14px');
  expect(await composedCode.evaluate(el => getComputedStyle(el).fontSize)).toBe('20px');
  expect(await composedCode.evaluate(el => getComputedStyle(el).fontFamily)).toMatch(/mono/i);
  expect(await defaultKbd.evaluate(el => getComputedStyle(el).fontSize)).toBe('14px');
  expect(await composedKbd.evaluate(el => getComputedStyle(el).fontSize)).toBe('14px');
  expect(await composedKbd.evaluate(el => getComputedStyle(el).fontFamily)).toMatch(/mono/i);
  if (browserName === 'chromium') {
    await page.screenshot({ path: test.info().outputPath('text-react-code-kbd-parity.png'), fullPage: false });
  }
});

test('Text resolves scoped typography at its consumer without changing sibling scopes', async ({ page }) => {
  await page.goto(`/components/text/${port}.html`);
  await page.locator('#body').evaluate(node => {
    const scope = document.createElement('section');
    scope.setAttribute('data-vf-theme', 'local-type');
    scope.style.setProperty('--vf-font-size-md', '1.125rem');
    scope.style.setProperty('--vf-font-family-sans', 'Georgia, serif');
    node.before(scope);
    scope.append(node);
  });
  await expect(page.locator('#body')).toHaveCSS('font-size', '18px');
  await expect(page.locator('#body')).toHaveCSS('font-family', /Georgia/);
  await expect(page.locator('#label')).toHaveCSS('font-size', '14px');
});
