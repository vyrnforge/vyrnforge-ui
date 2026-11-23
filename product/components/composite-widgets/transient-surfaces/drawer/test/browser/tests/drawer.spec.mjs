import { test, expect } from '@playwright/test';
import { expectNoAxeViolations } from '../../../../../../../../tooling/testing/accessibility.mjs';
const port = process.env.VF_COMPONENT_PORT || 'react';

async function openFixture(page) {
  await page.goto(`/components/drawer/${port}.html`);
  if (port === 'elements') await expect(page.locator('body')).toHaveAttribute('data-modal-ready', 'true');
  const trigger = page.locator('#trigger');
  const modal = page.locator('#modal');
  await expect(modal).not.toHaveAttribute('open', '');
  await trigger.click();
  await expect(modal).toHaveAttribute('open', '');
  expect(await modal.evaluate((el) => el.matches(':modal'))).toBe(true);
  await expect(page.getByRole('dialog', { name: 'Settings', exact: true })).toBeVisible();
  await expect(page.locator('#close')).toBeFocused();
  return { modal, trigger };
}

test('drawer public ports preserve native modality, naming, dismissal and focus', async ({ page }) => {
  const { modal, trigger } = await openFixture(page);
  expect(await modal.evaluate((el) => !!el.ownerDocument.getElementById(el.getAttribute('aria-describedby')))).toBe(
    true,
  );
  expect((await expectNoAxeViolations(page)).violations).toEqual([]);
  await page.keyboard.press('Escape');
  await expect(modal).not.toHaveAttribute('open', '');
  await expect(trigger).toBeFocused();
  if (port !== 'web') await expect(page.locator('body')).toHaveAttribute('data-dismiss-reason', 'escape');
  await trigger.click();
  await page.locator('#close').click();
  await expect(modal).not.toHaveAttribute('open', '');
  await expect(trigger).toBeFocused();
});

test('drawer controlled rejection keeps committed native modality', async ({ page }) => {
  test.skip(port === 'web', 'Native authored baseline has no framework owner.');
  const { modal } = await openFixture(page);
  await page.locator('body').evaluate((body) => {
    body.dataset.rejectClose = 'true';
  });
  await page.keyboard.press('Escape');
  await expect(modal).toHaveAttribute('open', '');
  await expect(page.locator('body')).toHaveAttribute('data-dismiss-reason', 'escape');
  await page.locator('#close').click();
  await expect(modal).toHaveAttribute('open', '');
  await page.locator('body').evaluate((body) => {
    delete body.dataset.rejectClose;
  });
  await page.locator('#close').click();
  await expect(modal).not.toHaveAttribute('open', '');
});

test('Drawer end placement follows logical direction and fits viewport', async ({ page }) => {
  const { modal } = await openFixture(page);
  const viewport = page.viewportSize();
  const box = await modal.boundingBox();
  if (!box || !viewport) throw new Error('Missing geometry');
  expect(Math.abs(box.x + box.width - viewport.width)).toBeLessThan(3);
  expect(box.y).toBeGreaterThanOrEqual(0);
  expect(box.y + box.height).toBeLessThanOrEqual(viewport.height + 2);
  await page.locator('html').evaluate((el) => (el.dir = 'rtl'));
  await expect.poll(async () => Math.abs((await modal.boundingBox())?.x ?? Infinity)).toBeLessThan(3);
});

test('Drawer placement remains edge-attached, bounded and logical under RTL and enlarged text', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 480 });
  const { modal, trigger } = await openFixture(page);
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '200%';
  });

  for (const dir of ['ltr', 'rtl']) {
    await page.locator('html').evaluate((el, value) => el.setAttribute('dir', value), dir);
    for (const placement of ['start', 'end', 'top', 'bottom']) {
      await modal.evaluate((el, value) => el.setAttribute('data-vf-placement', value), placement);
      await expect
        .poll(() =>
          modal.evaluate(
            (el, context) => {
              const rect = el.getBoundingClientRect();
              const width = window.innerWidth;
              const height = window.innerHeight;
              const left = rect.left;
              const right = width - rect.right;
              const top = rect.top;
              const bottom = height - rect.bottom;
              const edge =
                context.placement === 'start'
                  ? context.dir === 'rtl'
                    ? right
                    : left
                  : context.placement === 'end'
                    ? context.dir === 'rtl'
                      ? left
                      : right
                    : context.placement === 'top'
                      ? top
                      : bottom;
              return {
                attached: Math.abs(edge) < 3,
                contained: left >= -2 && right >= -2 && top >= -2 && bottom >= -2,
                modal: el.matches(':modal'),
              };
            },
            { placement, dir },
          ),
        )
        .toEqual({ attached: true, contained: true, modal: true });
    }
  }

  await page.keyboard.press('Escape');
  await expect(modal).not.toHaveAttribute('open', '');
  await expect(trigger).toBeFocused();
});

test('Drawer opt-in backdrop dismissal remains distinct from clicking interior padding', async ({ page }) => {
  test.skip(port === 'web', 'Native Web fixture does not author backdrop dismissal policy.');
  const { modal, trigger } = await openFixture(page);
  const box = await modal.boundingBox();
  if (!box) throw new Error('Missing dialog geometry');

  await page.mouse.click(box.x + 4, box.y + 4);
  await expect(modal).toHaveAttribute('open', '');
  await expect(page.locator('body')).not.toHaveAttribute('data-dismiss-reason', /.+/);

  await page.mouse.click(5, 5);
  await expect(modal).not.toHaveAttribute('open', '');
  await expect(page.locator('body')).toHaveAttribute('data-dismiss-reason', 'backdrop');
  await expect(trigger).toBeFocused();
});
