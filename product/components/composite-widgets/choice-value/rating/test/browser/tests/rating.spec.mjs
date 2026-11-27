import { test, expect } from '@playwright/test';
import { expectNoAxeViolations } from '../../../../../../../../tooling/testing/accessibility.mjs';
const port = process.env.VF_COMPONENT_PORT || 'react';
const open = async (page) => {
  await page.goto(`/components/rating/${port}.html`);
  if (port !== 'web') await expect(page.locator('body')).toHaveAttribute('data-rating-ready', 'true');
};
test('native Rating groups remain independent and submit only selected values', async ({ page }) => {
  await open(page);
  const first = page.getByRole('radiogroup', { name: 'First rating' }),
    second = page.getByRole('radiogroup', { name: 'Second rating' });
  const one = first.getByRole('radio', { name: 'Score 1' }),
    two = first.getByRole('radio', { name: 'Score 2' });
  await expect(one).toBeChecked();
  await expect(second.getByRole('radio', { name: 'Score 2' })).toBeChecked();
  expect(await one.getAttribute('name')).not.toBe(
    await second.getByRole('radio', { name: 'Score 2' }).getAttribute('name'),
  );
  await one.focus();
  await page.keyboard.press('ArrowRight');
  await expect(two).toBeChecked();
  await expect(second.getByRole('radio', { name: 'Score 2' })).toBeChecked();
  await expect(first.getByRole('radio', { name: 'Score 3' })).toBeDisabled();
  const name = await two.getAttribute('name');
  expect(await page.locator('#form').evaluate((form, name) => new FormData(form).get(name), name)).toBe('2');
  await expectNoAxeViolations(page);
});
test('controlled Rating requests selection without replacing committed native checked state', async ({ page }) => {
  test.skip(
    port === 'web' || port === 'elements',
    'Native authored groups do not implement controlled framework state.',
  );
  await open(page);
  const group = page.getByRole('radiogroup', { name: 'Controlled rating' });
  await group.getByRole('radio', { name: 'Score 1' }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('body')).toHaveAttribute('data-requested', '2');
  await expect(group.getByRole('radio', { name: 'Score 1' })).toBeChecked();
  await expect(group.getByRole('radio', { name: 'Score 2' })).not.toBeChecked();
});
test('generated rating labels are consumer-authored and native names survive activation', async ({ page, browser }) => {
  test.skip(port !== 'react' && port !== 'vue', 'Generated items are framework convenience APIs.');
  const context = await browser.newContext({ javaScriptEnabled: false });
  const staticPage = await context.newPage();
  await staticPage.goto(`/components/rating/${port}.html`);
  const name = await staticPage
    .getByRole('radiogroup', { name: 'First rating' })
    .getByRole('radio', { name: 'Score 1' })
    .getAttribute('name');
  await context.close();
  await open(page);
  await expect(
    page.getByRole('radiogroup', { name: 'First rating' }).getByRole('radio', { name: 'Score 1' }),
  ).toHaveAttribute('name', name);
  await expect(page.getByRole('radio', { name: 'Localized score 2' })).toBeChecked();
});
test('public Rating CSS exposes focus and non-color filled and empty glyphs', async ({ page }) => {
  test.skip(port !== 'web', 'CSS token evidence is owned by the Web lane.');
  await open(page);
  const first = page.getByRole('radiogroup', { name: 'First rating' });
  await expect(first).toHaveCSS('gap', '4px');
  for (const theme of ['light', 'dark']) {
    await page.locator('html').evaluate((element, value) => element.setAttribute('data-vf-theme', value), theme);
    await first.getByRole('radio', { name: 'Score 1' }).focus();
    const glyph = first.locator('[data-vf-rating-glyph]');
    expect(await glyph.nth(0).evaluate((el) => getComputedStyle(el, '::before').content)).toContain('★');
    expect(await glyph.nth(1).evaluate((el) => getComputedStyle(el, '::before').content)).toContain('☆');
    await expect(first.locator('label').first()).toHaveCSS('outline-style', 'solid');
    expect(
      await first
        .locator('label')
        .first()
        .evaluate((el) => el.getBoundingClientRect().width),
    ).toBeGreaterThanOrEqual(24);
  }
});

test('Angular Rating hydrates existing server-rendered nodes without hydration warnings', async ({ page }) => {
  test.skip(port !== 'angular', 'Angular hydration contract.');
  const warnings = [];
  page.on('console', (message) => {
    if (/NG050[0-9]/.test(message.text())) warnings.push(message.text());
  });
  const response = await page.request.get('/components/rating/angular.html');
  expect(await response.text()).toMatch(/\sngh=/);
  await open(page);
  await expect(page.locator('html')).toHaveAttribute('data-vf-angular-hydrated', 'true');
  expect(warnings).toEqual([]);
});

test('native radio reset restores independent defaults, empty selection and committed controlled state', async ({
  page,
}) => {
  await open(page);
  const group = page.getByRole('radiogroup', { name: 'First rating', exact: true });
  const other = page.getByRole('radiogroup', { name: 'Second rating', exact: true });
  const empty = page.getByRole('radiogroup', { name: 'Empty rating', exact: true });
  const form = page.locator('#form');
  const managed = port !== 'web' && port !== 'elements';
  const initial = group.getByRole('radio', { name: 'Score 1' });
  const changed = group.getByRole('radio', { name: 'Score 2' });
  const name = await changed.getAttribute('name');
  await changed.press('Space');
  await empty.getByRole('radio', { name: 'Score 1' }).press('Space');
  await expect(changed).toBeChecked();
  await expect(empty.locator('input:checked')).toHaveCount(1);
  if (managed) {
    await page.locator('#set-controlled').click();
    await expect(
      page.getByRole('radiogroup', { name: 'Controlled rating' }).getByRole('radio', { name: 'Score 2' }),
    ).toBeChecked();
    await expect(page.locator('body')).toHaveAttribute('data-rating-requests', '1');
  }
  await form.evaluate(async (element) => {
    element.addEventListener('reset', (event) => event.preventDefault(), { once: true });
    element.reset();
    await new Promise((resolve) => {
      setTimeout(resolve, 0);
    });
  });
  await expect(changed).toBeChecked();
  await form.evaluate((element) => {
    element.addEventListener('change', () => {
      document.body.dataset.resetChange = 'unexpected';
    });
    const button = document.createElement('button');
    button.type = 'reset';
    button.textContent = 'Reset choices';
    element.append(button);
  });
  await page.getByRole('button', { name: 'Reset choices' }).click();
  await expect(initial).toBeChecked();
  await expect(other.getByRole('radio', { name: 'Score 2' })).toBeChecked();
  await expect(empty.locator('input:checked')).toHaveCount(0);
  expect(await form.evaluate((element, name) => new FormData(element).get(name), name)).toBe('1');
  await expect(page.locator('body')).not.toHaveAttribute('data-reset-change', 'unexpected');
  if (managed) {
    await expect(
      page.getByRole('radiogroup', { name: 'Controlled rating' }).getByRole('radio', { name: 'Score 2' }),
    ).toBeChecked();
    await expect(page.locator('body')).toHaveAttribute('data-rating-requests', '1');
    await expect(page.locator('body')).not.toHaveAttribute('data-requested', /.+/);
  }
  await changed.press('Space');
  await expect(changed).toBeChecked();
  expect(await form.evaluate((element, name) => new FormData(element).get(name), name)).toBe('2');
  if (managed) await expect(page.locator('body')).toHaveAttribute('data-rating-requests', '2');
});

test('generated Rating preserves native fractional selection, clear and read-only semantics', async ({ page }) => {
  await open(page);
  const group = page.getByRole('radiogroup', { name: 'Fractional rating' });
  await expect(group.getByRole('radio')).toHaveCount(10);
  const selected = group.getByRole('radio', { name: '3.5', exact: true });
  await expect(selected).toBeChecked();
  expect(await selected.evaluate((input) => input.getBoundingClientRect().width)).toBeGreaterThanOrEqual(24);
  await selected.focus();
  await page.keyboard.press('ArrowRight');
  await expect(group.getByRole('radio', { name: '4', exact: true })).toBeChecked();
  expect(await page.locator('#form').evaluate((form) => new FormData(form).get('fraction'))).toBe('4');
  const generated = port !== 'web' && port !== 'elements';
  if (generated) {
    await page.getByRole('button', { name: 'Clear fractional rating' }).click();
    await expect(group.locator('input:checked')).toHaveCount(0);
    expect(await page.locator('#form').evaluate((form) => new FormData(form).has('fraction'))).toBe(false);
  }
  await page.locator('#form').evaluate((form) => form.reset());
  await expect(selected).toBeChecked();
  const average = page.getByRole('img', { name: 'Average 4.7 out of 5' });
  await expect(average.locator('input')).toHaveCount(0);
  if (generated) {
    const required = page.getByRole('radiogroup', { name: 'Required rating' });
    expect(
      await required
        .locator('input')
        .first()
        .evaluate((input) => input.validity.valueMissing),
    ).toBe(true);
    await required.getByRole('radio', { name: '2', exact: true }).check();
    expect(
      await required
        .locator('input')
        .first()
        .evaluate((input) => input.validity.valueMissing),
    ).toBe(false);
  }
  await expectNoAxeViolations(page);
});

test('enhanced native paint follows checked choice, hover and logical direction', async ({ page }) => {
  await open(page);
  const group = page.getByRole('radiogroup', { name: 'Fractional rating' });
  const artwork = group.locator('[data-vf-rating-artwork]');
  const fill = (index) =>
    artwork.nth(index).evaluate((el) => getComputedStyle(el).getPropertyValue('--_vf-rating-fill').trim());
  await expect.poll(() => fill(3)).toBe('50%');
  await group.getByRole('radio', { name: '2.5', exact: true }).hover();
  await expect.poll(() => fill(2)).toBe('50%');
  await expect.poll(() => fill(3)).toBe('0%');
  await page.locator('body').hover({ position: { x: 1, y: 1 } });
  await expect.poll(() => fill(3)).toBe('50%');
  await group.evaluate((el) => el.setAttribute('dir', 'rtl'));
  await expect(group.locator('[data-vf-rating-fill]').nth(3)).toHaveCSS('clip-path', 'inset(0px 0px 0px 50%)');
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
  await group.getByRole('radio', { name: '3.5', exact: true }).focus();
  await expect(group.getByRole('radio', { name: '3.5', exact: true }).locator('..')).toHaveCSS(
    'outline-style',
    'solid',
  );
});
