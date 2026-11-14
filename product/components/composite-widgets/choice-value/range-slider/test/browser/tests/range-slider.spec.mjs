import { test, expect } from '@playwright/test';
import { expectNoAxeViolations } from '../../../../../../../../tooling/testing/accessibility.mjs';

const port = process.env.VF_COMPONENT_PORT || 'react';
const themes = [
  ['light', 'rgb(36, 94, 219)'],
  ['dark', 'rgb(141, 180, 255)'],
];

function ranges(page, id = 'root') {
  const root = page.locator(`#${id}`);
  return {
    root,
    start: root.locator('[data-vf-range-slider-start]'),
    end: root.locator('[data-vf-range-slider-end]'),
  };
}

test('RangeSlider renders named, bounded native ranges before activation', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto(`/components/range-slider/${port}.html`);
    const { start, end } = ranges(page);
    await expect(start).toHaveAccessibleName('Minimum price');
    await expect(end).toHaveAccessibleName('Maximum price');
    await expect(start).toHaveAttribute('type', 'range');
    await expect(end).toHaveAttribute('type', 'range');
    await expect(start).toHaveValue('20');
    await expect(end).toHaveValue('80');
    await expect(start).toHaveAttribute('max', '80');
    await expect(end).toHaveAttribute('min', '20');
    await expect(start).toHaveAttribute('step', '5');
  } finally {
    await context.close();
  }
});

test('native keyboard changes preserve ordered values, dynamic bounds and form submission', async ({ page }) => {
  test.skip(port === 'web', 'Web supplies native markup, not coordinated runtime.');
  await page.goto(`/components/range-slider/${port}.html`);
  const { root, start, end } = ranges(page);
  await start.focus();
  await start.press('ArrowRight');
  await expect(start).toHaveValue('25');
  await expect(end).toHaveAttribute('min', '25');
  await expect(root).toHaveAttribute('data-requested', '[25,80]');
  await start.press('End');
  await expect(start).toHaveValue('80');
  await expect(end).toHaveAttribute('min', '80');
  await expect(start).toBeFocused();
  await end.focus();
  await end.press('Home');
  await expect(end).toHaveValue('80');
  await expect(start).toHaveValue('80');
  await expect(root).toHaveAttribute('data-requested', '[80,80]');
  await start.focus();
  await start.press('ArrowLeft');
  await expect(start).toHaveValue('75');
  await expect(end).toHaveAttribute('min', '75');
  expect(await page.locator('#range-form').evaluate((form) => Object.fromEntries(new FormData(form)))).toEqual({
    lower: '75',
    upper: '80',
  });
  await expectNoAxeViolations(page);
});

test('controlled RangeSlider reports native requests without committing rejected values', async ({ page }) => {
  test.skip(port === 'web', 'Managed runtime only.');
  await page.goto(`/components/range-slider/${port}.html`);
  const { root, start, end } = ranges(page, 'controlled');
  await start.focus();
  await start.press('ArrowRight');
  await expect(root).toHaveAttribute('data-requested', '[35,70]');
  await expect(start).toHaveValue('30');
  await expect(end).toHaveAttribute('min', '30');
  await end.focus();
  await end.press('ArrowLeft');
  await expect(root).toHaveAttribute('data-requested', '[30,65]');
  await expect(end).toHaveValue('70');
  await expect(start).toHaveAttribute('max', '70');
});

test('disabled ranges are excluded from native submission and fractional values share one step grid', async ({
  page,
}) => {
  test.skip(port === 'web', 'Managed runtime only.');
  await page.goto(`/components/range-slider/${port}.html`);
  const disabled = ranges(page, 'disabled');
  await expect(disabled.start).toBeDisabled();
  await expect(disabled.end).toBeDisabled();
  expect(await page.locator('#disabled-form').evaluate((form) => Array.from(new FormData(form).entries()))).toEqual([]);
  const fractional = ranges(page, 'fractional');
  await expect(fractional.start).toHaveValue('0.3');
  await expect(fractional.end).toHaveValue('0.9');
  await fractional.start.press('ArrowRight');
  await expect(fractional.start).toHaveValue('0.5');
  await expect(fractional.end).toHaveAttribute('min', '0.5');
  await expect(fractional.root).toHaveAttribute('data-requested', '[0.5,0.9]');
});

test('public RangeSlider CSS resolves canonical root spacing and selected accent in light and dark themes', async ({
  page,
}) => {
  test.skip(port !== 'web', 'Public CSS resolution evidence is owned by the Web lane.');
  await page.goto('/components/range-slider/web.html');
  const { root, start } = ranges(page);
  for (const [theme, accentColor] of themes) {
    await page.locator('html').evaluate((element, value) => element.setAttribute('data-vf-theme', value), theme);
    await expect(root).toHaveCSS('gap', '8px');
    await expect(start).toHaveCSS('accent-color', accentColor);
  }
  await expectNoAxeViolations(page);
});
