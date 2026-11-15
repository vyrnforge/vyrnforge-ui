import { test, expect } from '@playwright/test';
import { expectNoAxeViolations } from '../../../../../../../../tooling/testing/accessibility.mjs';

const port = process.env.VF_COMPONENT_PORT || 'web';

test.describe('Tabs Web semantic and styling contract', () => {
  test.skip(port !== 'web', 'Web owns canonical Tabs CSS and semantic styling evidence.');

  test('focus, disabled, accessibility, reduced motion, forced colors, and direction remain usable', async ({
    page,
    browserName,
  }) => {
    await page.goto('/components/tabs/web.html');
    const root = page.locator('#web-tabs');
    const selected = page.locator('#web-tabs-tab-overview');
    const disabled = page.locator('#web-tabs-tab-billing');
    await expect(selected).toHaveAttribute('aria-selected', 'true');
    await expect(selected).not.toHaveAttribute('data-vf-selected', '');
    await expect(page.locator('#web-tabs-panel-overview')).not.toHaveAttribute('data-vf-selected', '');
    await expect(disabled).toBeDisabled();
    await expect(disabled).toHaveAttribute('aria-disabled', 'true');
    await expect(disabled).not.toHaveAttribute('data-vf-disabled', '');
    await selected.focus();
    expect(await selected.evaluate((element) => getComputedStyle(element).outlineStyle)).not.toBe('none');
    if (browserName === 'chromium') {
      await expect(root).toHaveScreenshot('tabs-focus-visible.png');
    }

    await expectNoAxeViolations(page);

    await page.evaluate(() => {
      document.documentElement.dir = 'rtl';
    });
    expect(await selected.evaluate((element) => getComputedStyle(element).direction)).toBe('rtl');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    expect(await selected.evaluate((element) => getComputedStyle(element).transitionDuration)).toBe('0s');
    await page.emulateMedia({ reducedMotion: 'reduce', forcedColors: 'active' });
    expect(await page.evaluate(() => matchMedia('(forced-colors: active)').matches)).toBe(true);
    await expect(selected).toBeVisible();
    if (browserName === 'chromium') {
      await expect(root).toHaveScreenshot('tabs-forced-colors-rtl.png');
    }
  });
});

test.describe('Tabs port interaction and client activation', () => {
  for (const framework of ['react', 'angular', 'vue', 'elements']) {
    test(`${framework} supports RTL automatic navigation, wrapping, disabled skipping, Home/End, and client activation`, async ({
      page,
    }) => {
      test.skip(port !== framework, `Running ${port} evidence only`);
      const errors = [];
      page.on('console', (message) => {
        if (message.type() === 'error') errors.push(message.text());
      });
      await page.goto(`/components/tabs/${framework}.html`);

      const root = page.locator(`#${framework}-tabs`);
      const overview = page.locator(`#${framework}-tabs-tab-overview`);
      const billing = page.locator(`#${framework}-tabs-tab-billing`);
      const security = page.locator(`#${framework}-tabs-tab-security`);
      const activity = page.locator(`#${framework}-tabs-tab-activity`);
      await expect(root).toHaveAttribute('data-vf-tabs-root', '');
      await expect(root).toHaveAttribute('dir', 'rtl');
      await expect(overview).toHaveAttribute('aria-selected', 'true');
      await expect(overview).not.toHaveAttribute('data-vf-selected', '');
      await expect(page.locator(`#${framework}-tabs-panel-overview`)).not.toHaveAttribute('data-vf-selected', '');
      await expect(billing).toBeDisabled();
      await expect(billing).toHaveAttribute('aria-disabled', 'true');
      await expect(billing).not.toHaveAttribute('data-vf-disabled', '');

      if (framework === 'elements') {
        await billing.evaluate((element) => element.removeAttribute('disabled'));
        await expect(billing).not.toHaveAttribute('aria-disabled', 'true');
        await billing.evaluate((element) => element.setAttribute('disabled', ''));
        await expect(billing).toHaveAttribute('aria-disabled', 'true');
        await expect(billing).not.toHaveAttribute('data-vf-disabled', '');
      }

      await overview.focus();
      await page.keyboard.press('ArrowLeft');
      await expect(security).toBeFocused();
      await expect(security).toHaveAttribute('aria-selected', 'true');
      await expect(security).not.toHaveAttribute('data-vf-selected', '');
      await expect(page.locator(`#${framework}-tabs-panel-security`)).toBeVisible();
      await expect(page.locator('body')).toHaveAttribute('data-value', 'security');

      await page.keyboard.press('ArrowLeft');
      await expect(activity).toBeFocused();
      await page.keyboard.press('ArrowLeft');
      await expect(overview).toBeFocused();
      await page.keyboard.press('End');
      await expect(activity).toBeFocused();
      await page.keyboard.press('Home');
      await expect(overview).toBeFocused();

      expect(errors.filter((error) => /hydration|mismatch/i.test(error))).toEqual([]);
      await expectNoAxeViolations(page, { include: `#${framework}-tabs` });
    });

    test(`${framework} keeps vertical manual focus separate from selection until Enter or Space`, async ({ page }) => {
      test.skip(port !== framework, `Running ${port} evidence only`);
      const errors = [];
      page.on('console', (message) => {
        if (message.type() === 'error') errors.push(message.text());
      });
      await page.goto(`/components/tabs/${framework}.html`);

      const root = page.locator(`#${framework}-manual-tabs`);
      const overview = page.locator(`#${framework}-manual-tabs-tab-overview`);
      const billing = page.locator(`#${framework}-manual-tabs-tab-billing`);
      const security = page.locator(`#${framework}-manual-tabs-tab-security`);
      await expect(root).toHaveAttribute('data-vf-orientation', 'vertical');
      await expect(root).toHaveAttribute('data-vf-activation', 'manual');
      await expect(root.locator('[role="tablist"]')).toHaveAttribute('aria-orientation', 'vertical');
      await expect(overview).toHaveAttribute('aria-selected', 'true');
      await expect(overview).not.toHaveAttribute('data-vf-selected', '');
      await expect(billing).toBeDisabled();
      await expect(billing).toHaveAttribute('aria-disabled', 'true');
      await expect(billing).not.toHaveAttribute('data-vf-disabled', '');

      await overview.focus();
      await page.keyboard.press('ArrowDown');
      await expect(security).toBeFocused();
      await expect(overview).toHaveAttribute('aria-selected', 'true');
      await expect(security).toHaveAttribute('aria-selected', 'false');
      await expect(page.locator(`#${framework}-manual-tabs-panel-overview`)).toBeVisible();
      await expect(page.locator(`#${framework}-manual-tabs-panel-security`)).toBeHidden();

      await security.evaluate((button) => {
        button.addEventListener('click', () => {
          button.dataset.nativeClicks = String(Number(button.dataset.nativeClicks || 0) + 1);
        });
      });
      await page.keyboard.press('Enter');
      await expect(security).toHaveAttribute('data-native-clicks', '1');
      await expect(security).toHaveAttribute('aria-selected', 'true');
      await expect(security).not.toHaveAttribute('data-vf-selected', '');
      await expect(page.locator(`#${framework}-manual-tabs-panel-security`)).toBeVisible();
      await expect(page.locator('body')).toHaveAttribute('data-manual-value', 'security');

      await page.keyboard.press('ArrowUp');
      await expect(overview).toBeFocused();
      await expect(security).toHaveAttribute('aria-selected', 'true');
      await overview.evaluate((button) => {
        button.addEventListener('click', () => {
          button.dataset.nativeClicks = String(Number(button.dataset.nativeClicks || 0) + 1);
        });
      });
      await page.keyboard.press('Space');
      await expect(overview).toHaveAttribute('data-native-clicks', '1');
      await expect(overview).toHaveAttribute('aria-selected', 'true');
      await expect(page.locator('body')).toHaveAttribute('data-manual-value', 'overview');

      expect(errors.filter((error) => /hydration|mismatch/i.test(error))).toEqual([]);
    });
  }
});

test('controlled automatic Tabs preserves committed selection and unique relationships', async ({ page }) => {
  test.skip(port === 'web', 'Managed Tabs runtime only.');
  await page.goto(`/components/tabs/${port}.html`);
  const root = page.locator(`#${port}-controlled-tabs`);
  const first = root.getByRole('tab', { name: 'Slash' });
  const second = root.getByRole('tab', { name: 'Underscore' });
  await expect(first).toHaveAttribute('aria-selected', 'true');
  await expect(first).toHaveAttribute('tabindex', '0');
  await expect(second).toHaveAttribute('aria-selected', 'false');
  const firstPanel = await first.getAttribute('aria-controls');
  const secondPanel = await second.getAttribute('aria-controls');
  expect(firstPanel).not.toBe(secondPanel);
  expect(await first.getAttribute('id')).not.toBe(await second.getAttribute('id'));
  await expect(root.locator(`[id="${firstPanel}"]`)).toBeVisible();
  await expect(root.locator(`[id="${secondPanel}"]`)).toBeHidden();
  await first.click();
  await expect(page.locator('body')).not.toHaveAttribute('data-controlled-count');
  await first.press('ArrowRight');
  await expect(second).toBeFocused();
  await expect(page.locator('body')).toHaveAttribute('data-controlled-value', 'a_2Fb');
  await expect(page.locator('body')).toHaveAttribute('data-controlled-count', '1');
  await expect(first).toHaveAttribute('aria-selected', 'true');
  await expect(first).toHaveAttribute('tabindex', '0');
  await expect(second).toHaveAttribute('tabindex', '-1');
  await expect(root.locator(`[id="${firstPanel}"]`)).toBeVisible();
  await expect(root.locator(`[id="${secondPanel}"]`)).toBeHidden();
  await second.press('Space');
  await expect(page.locator('body')).toHaveAttribute('data-controlled-count', '2');
  await expect(first).toHaveAttribute('aria-selected', 'true');
  await expectNoAxeViolations(page, { include: `#${port}-controlled-tabs` });
});
