import { test, expect } from '@playwright/test';
import { expectNoAxeViolations } from '../../../../../../../../tooling/testing/accessibility.mjs';
const port = process.env.VF_COMPONENT_PORT || 'web';
async function load(page) {
  await page.goto(`/components/menu/${port}.html`);
  if (port !== 'web') await page.waitForFunction(() => document.body.dataset.menuReady === 'true');
}

async function expectAxeClean(page) {
  expect((await expectNoAxeViolations(page)).violations).toEqual([]);
}

test('menu exposes menu-button and item semantics', async ({ page }) => {
  await load(page);
  const trigger = page.locator(`#${port}-trigger`);
  await expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
  if (port === 'web') {
    await expect(trigger).toHaveAttribute('popovertarget', 'web-menu');
    await expect(page.locator('#web-menu')).toBeHidden();
    await trigger.click();
    await expect(page.getByRole('menu', { name: 'Actions' })).toBeVisible();
  } else {
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  }
  await expectAxeClean(page);
});

test('public Menu CSS resolves canonical popup surface, boundaries, and item radii in light, dark, and forced-colors modes', async ({
  page,
}) => {
  test.skip(port !== 'web', 'Public CSS resolution evidence is owned by the Web lane.');
  await page.goto('/components/menu/web.html');
  await page.locator('#web-trigger').press('Enter');
  const menu = page.locator('#web-menu');
  const item = page.locator('#web-edit');
  await menu.evaluate((element) => {
    const separator = document.createElement('div');
    separator.id = 'web-separator';
    separator.setAttribute('role', 'separator');
    separator.setAttribute('data-vf-menu-separator', '');
    element.append(separator);
  });
  const separator = page.locator('#web-separator');
  const colorsByTheme = {
    light: { surface: 'rgb(255, 255, 255)', border: 'rgb(212, 212, 216)' },
    dark: { surface: 'rgb(24, 24, 27)', border: 'rgb(63, 63, 70)' },
  };

  for (const theme of ['light', 'dark']) {
    await page.locator('html').evaluate((element, value) => element.setAttribute('data-vf-theme', value), theme);
    await expect(menu).toHaveCSS('background-color', colorsByTheme[theme].surface);
    await expect(menu).toHaveCSS('border-top-color', colorsByTheme[theme].border);
    await expect(separator).toHaveCSS('background-color', colorsByTheme[theme].border);
    await expect(menu).toHaveCSS('border-radius', '8px');
    await expect(item).toHaveCSS('border-radius', '6px');
  }

  await page.emulateMedia({ forcedColors: 'active' });
  await expect(menu).toHaveCSS('border-top-width', '1px');
  await expect(separator).toHaveCSS('height', '1px');
  await item.focus();
  await expect(item).toBeFocused();
  await expect(item).toHaveCSS('outline-style', 'solid');
  await expect(item).toHaveCSS('outline-width', '2px');
});

test.describe('enhanced menu interaction', () => {
  test.skip(port === 'web', 'Native Web owns semantic/style baseline; framework ports own enhanced menu behavior.');

  test('opens from keyboard, includes disabled items in focus navigation, and suppresses disabled activation', async ({
    page,
  }) => {
    const errors = [];
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });
    page.on('pageerror', (error) => errors.push(error.message));
    await load(page);

    const trigger = page.locator(`#${port}-trigger`);
    const menu = page.locator(`#${port}-menu`);
    const edit = page.locator(`#${port}-edit`);
    const locked = page.locator(`#${port}-locked`);
    const duplicate = page.locator(`#${port}-duplicate`);
    const archive = page.locator(`#${port}-archive`);

    await trigger.focus();
    await page.keyboard.press('Enter');
    await expect(menu).toBeVisible();
    if (port === 'react') await expect(menu).toHaveCSS('animation-name', 'vf-motion-enter-reveal');
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(edit).toBeFocused();
    for (const item of [edit, locked, duplicate, archive]) await expect(item).toHaveAttribute('tabindex', '-1');
    await expect(locked).toHaveAttribute('aria-disabled', 'true');

    await page.keyboard.press('ArrowDown');
    await expect(locked).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(menu).toBeVisible();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('body')).not.toHaveAttribute('data-selected', /.+/);
    if (port === 'react' || port === 'vue')
      await expect(page.locator('body')).not.toHaveAttribute('data-disabled-clicked', /.+/);

    await page.keyboard.press('ArrowDown');
    await expect(duplicate).toBeFocused();
    await page.keyboard.press('Home');
    await expect(edit).toBeFocused();
    await page.keyboard.press('End');
    await expect(archive).toBeFocused();
    await page.keyboard.press('d');
    await expect(duplicate).toBeFocused();

    await page.keyboard.press('Escape');
    await expect(trigger).toBeFocused();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(menu).toBeHidden();

    await page.keyboard.press('ArrowUp');
    await expect(archive).toBeFocused();
    expect(errors.filter((error) => /hydration|mismatch|uncaught|error/i.test(error))).toEqual([]);
  });

  test('activates enabled items, restores focus, and Tab exits instead of traversing menu items', async ({ page }) => {
    await load(page);
    const before = page.locator('#before');
    const after = page.locator('#after');
    // The controlled fixture is a separate example; remove it from sequential navigation for this assertion.
    await page
      .locator('#controlled-trigger')
      .evaluateAll((nodes) => nodes.forEach((node) => node.setAttribute('tabindex', '-1')));
    const trigger = page.locator(`#${port}-trigger`);
    const menu = page.locator(`#${port}-menu`);
    const edit = page.locator(`#${port}-edit`);

    await trigger.focus();
    await page.keyboard.press('Enter');
    await expect(edit).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('body')).toHaveAttribute('data-selected', `${port}-edit`);
    await expect(trigger).toBeFocused();
    await expect(menu).toBeHidden();

    await page.keyboard.press('Enter');
    await expect(edit).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(after).toBeFocused();
    await expect(menu).toBeHidden();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await trigger.focus();
    await page.keyboard.press('Enter');
    await expect(edit).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await expect(before).toBeFocused();
    await expect(menu).toBeHidden();
  });
});

test('Elements menu events remain scoped to the owning nested menu', async ({ page }) => {
  test.skip(port !== 'elements', 'Elements ownership regression.');
  await load(page);
  await page.locator('#elements-trigger').evaluate((trigger) => {
    const outer = trigger.closest('vf-menu');
    const nested = document.createElement('vf-menu');
    nested.id = 'nested-menu';
    nested.innerHTML =
      '<button id="nested-trigger" type="button" data-vf-menu-trigger>Nested actions</button><div id="nested-content" data-vf-menu-content aria-label="Nested actions"><button id="nested-item" type="button" data-vf-menu-item>Nested command</button></div>';
    outer.append(nested);
    outer.addEventListener('vf-select', (event) => {
      if (event.target === outer) document.body.dataset.outerSelected = 'true';
    });
  });
  const outer = page.locator('vf-menu').first();
  const nested = page.locator('#nested-menu');
  await page.locator('#nested-trigger').focus();
  await page.keyboard.press('ArrowDown');
  await expect(nested).toHaveAttribute('open', '');
  await expect(outer).not.toHaveAttribute('open', '');
  await expect(page.locator('#nested-item')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(nested).not.toHaveAttribute('open', '');
  await expect(outer).not.toHaveAttribute('open', '');
  await expect(page.locator('body')).not.toHaveAttribute('data-outer-selected', 'true');
  await expect(page.locator('#nested-trigger')).toBeFocused();
});

test('native Menu surface stays in its authored DOM and light-dismisses without stealing outside focus', async ({
  page,
}) => {
  await load(page);
  const trigger = page.locator(`#${port}-trigger`);
  const menu = page.locator(`#${port}-menu`);
  await trigger.click();
  await expect(menu).toBeVisible();
  expect(await menu.evaluate((node) => node.matches(':popover-open') && !!node.closest('main'))).toBe(true);
  await expectNoAxeViolations(page);
  const anchor = await trigger.boundingBox();
  const surface = await menu.boundingBox();
  expect(anchor).not.toBeNull();
  expect(surface).not.toBeNull();
  expect(surface.y).toBeGreaterThanOrEqual(anchor.y + anchor.height - 1);
  await page.locator('#after').click();
  await expect(menu).toBeHidden();
  await expect(page.locator('#after')).toBeFocused();
  if (port !== 'web') await expect(trigger).toHaveAttribute('aria-expanded', 'false');
});

test('controlled framework Menu rejects native light dismissal without changing committed state', async ({ page }) => {
  test.skip(port === 'web' || port === 'elements', 'Controlled framework contract.');
  await load(page);
  await page.locator('#controlled-trigger').press('Enter');
  const surface = page.locator('#controlled-menu');
  await expect(surface).toBeVisible();
  await expect(page.locator('#controlled-item')).toBeFocused();
  await page.locator('#after').click();
  await expect(page.locator('body')).toHaveAttribute('data-menu-request', 'false');
  await expect(surface).toBeVisible();
  await expect(page.locator('#controlled-trigger')).toHaveAttribute('aria-expanded', 'true');
  expect(await surface.evaluate((node) => node.matches(':popover-open'))).toBe(true);
});
