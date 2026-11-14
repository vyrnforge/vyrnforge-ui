import { test, expect } from '@playwright/test';
import { expectNoAxeViolations } from '../../../../../../../../tooling/testing/accessibility.mjs';

const port = process.env.VF_COMPONENT_PORT || 'react';

test('carousel exposes exactly the selected slide before client activation', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto(`/components/carousel/${port}.html`);
    const root = page.locator('#root');
    await expect(root).toHaveAttribute('aria-roledescription', 'carousel');
    await expect(root.getByText('First slide')).toBeVisible();
    await expect(root.getByText('Second slide')).toBeHidden();
    await expect(page.locator('#prev')).toHaveAttribute('aria-disabled', 'true');
    if (port !== 'web') {
      const controlled = page.locator('#controlled');
      await expect(controlled.getByText('First slide')).toBeHidden();
      await expect(controlled.getByText('Second slide')).toBeVisible();
      await expect(page.locator('#controlled-next')).toHaveAttribute('aria-disabled', 'true');
      for (const [id, label] of [
        ['composed', 'Composed'],
        ['wrapped', 'Wrapped'],
      ]) {
        const carousel = page.locator(`#${id}`);
        await expect(carousel.getByText(`${label} first`)).toBeHidden();
        await expect(carousel.getByText(`${label} second`)).toBeVisible();
        await expect(page.locator(`#${id}-next`)).toHaveAttribute('aria-disabled', 'true');
      }
    }
  } finally {
    await context.close();
  }
});

test('public carousel port preserves bounded native keyboard navigation and focus', async ({ page }) => {
  test.skip(port === 'web', 'Web supplies authored semantic markup and shared CSS, not a carousel runtime.');
  await page.goto(`/components/carousel/${port}.html`);
  const root = page.locator('#root');
  const next = page.locator('#next');
  const previous = page.locator('#prev');

  await next.focus();
  await next.press('Enter');
  await expect(root.getByText('First slide')).toBeHidden();
  await expect(root.getByText('Second slide')).toBeVisible();
  await expect(root).toHaveAttribute('data-requested-index', '1');
  await expect(next).toHaveAttribute('aria-disabled', 'true');
  await expect(next).toBeFocused();
  await root.evaluate((element) => element.removeAttribute('data-requested-index'));
  await next.press('Space');
  await expect(root).not.toHaveAttribute('data-requested-index');
  await expect(root.getByText('Second slide')).toBeVisible();

  await previous.focus();
  await previous.press('Space');
  await expect(root.getByText('First slide')).toBeVisible();
  await expect(root.getByText('Second slide')).toBeHidden();
  await expect(previous).toHaveAttribute('aria-disabled', 'true');
  await expect(previous).toBeFocused();
  expect((await expectNoAxeViolations(page)).violations).toEqual([]);
});

test('controlled carousel requests a change without committing rejected state', async ({ page }) => {
  test.skip(port === 'web', 'No Web-owned carousel runtime.');
  await page.goto(`/components/carousel/${port}.html`);
  const root = page.locator('#controlled');
  await page.locator('#controlled-prev').click();
  await expect(root).toHaveAttribute('data-requested-index', '0');
  await expect(root.getByText('Second slide')).toBeVisible();
  await expect(root.getByText('First slide')).toBeHidden();
  await expect(page.locator('#controlled-next')).toHaveAttribute('aria-disabled', 'true');
});

test('one ordered carousel collection navigates multiple and wrapped viewports', async ({ page }) => {
  test.skip(port === 'web', 'No Web-owned carousel runtime.');
  await page.goto(`/components/carousel/${port}.html`);
  for (const [id, label] of [
    ['composed', 'Composed'],
    ['wrapped', 'Wrapped'],
  ]) {
    const root = page.locator(`#${id}`);
    const previous = page.locator(`#${id}-prev`);
    const next = page.locator(`#${id}-next`);
    await previous.focus();
    await previous.press('Enter');
    await expect(root.getByText(`${label} first`)).toBeVisible();
    await expect(root.getByText(`${label} second`)).toBeHidden();
    await expect(previous).toHaveAttribute('aria-disabled', 'true');
    await expect(previous).toBeFocused();
    await next.focus();
    await next.press('Space');
    await expect(root.getByText(`${label} second`)).toBeVisible();
    await expect(root.getByText(`${label} first`)).toBeHidden();
    await expect(next).toHaveAttribute('aria-disabled', 'true');
  }
});

test('public Carousel CSS resolves canonical spacing and control radius in light and dark themes', async ({ page }) => {
  test.skip(port !== 'web', 'Public CSS resolution evidence is owned by the Web lane.');
  await page.goto('/components/carousel/web.html');
  const root = page.locator('#root');
  const next = page.locator('#next');
  for (const theme of ['light', 'dark']) {
    await page.locator('html').evaluate((element, value) => element.setAttribute('data-vf-theme', value), theme);
    await expect(root).toHaveCSS('gap', '8px');
    await expect(next).toHaveCSS('border-top-left-radius', '6px');
    await expect(next).toHaveCSS('border-top-right-radius', '6px');
  }
});
