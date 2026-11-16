import { test, expect } from '@playwright/test';
import { expectNoAxeViolations } from '../../../../../../../tooling/testing/accessibility.mjs';

const port = process.env.VF_COMPONENT_PORT || 'web';
const parts = Object.fromEntries(['body', 'navigation', 'main', 'header', 'footer'].map((name) => [name, '[data-vf-app-shell-' + name + ']']));
const shell = '[data-vf-app-shell]';

async function open(page, width = 1920) {
  await page.setViewportSize({ width, height: 900 });
  await page.goto('/components/app-shell/optional-navigation.html');
  await page.waitForFunction(() => typeof window.vfSetShellState === 'function');
  await expect(page.getByRole('main')).toHaveCount(1);
  if (port === 'elements') {
    await expect(page.locator('vf-app-shell')).toHaveCount(1);
    await expect(page.locator('vf-app-shell-main')).toHaveAttribute('role', 'main');
  } else {
    await expect(page.locator('main[data-vf-app-shell-main]')).toHaveCount(1);
  }
}

async function setState(page, navigation, footer = false) {
  await page.evaluate((state) => window.vfSetShellState(state), { navigation, footer });
  await expect(page.locator(parts.navigation)).toHaveCount(navigation === 'absent' ? 0 : 1);
  await expect(page.locator(parts.footer)).toHaveCount(footer ? 1 : 0);
  if (navigation === 'hidden') await expect(page.locator(parts.navigation)).toBeHidden();
  if (navigation === 'present') await expect(page.locator(parts.navigation)).toBeVisible();
}

async function geometry(page) {
  return page.evaluate(({ parts, shell }) => {
    const get = (selector) => document.querySelector(selector);
    const rect = (node) => {
      if (!node) return null;
      const { x, y, width, height, right, bottom } = node.getBoundingClientRect();
      return { x, y, width, height, right, bottom };
    };
    const body = get(parts.body);
    const nav = get(parts.navigation);
    const main = get(parts.main);
    const style = getComputedStyle(body);
    return {
      shell: rect(get(shell)), body: rect(body), main: rect(main), nav: rect(nav),
      header: rect(get(parts.header)), footer: rect(get(parts.footer)),
      directOrder: [...body.children].map((node) => node.matches(parts.navigation) ? 'navigation' : node.matches(parts.main) ? 'main' : 'other'),
      shellOrder: [...get(shell).children].map((node) => Object.keys(parts).find((key) => node.matches(parts[key]))),
      columns: style.gridTemplateColumns.split(' ').length,
      gap: parseFloat(style.columnGap),
      gutter: parseFloat(style.paddingInlineStart),
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      navDisplay: nav && getComputedStyle(nav).display,
    };
  }, { parts, shell });
}

async function check(page, { navigation = 'absent', bodyWidth, rail = 256, gutter = 16, gap = 32, stacked = false, footer = false, rtl = false }) {
  const g = await geometry(page);
  const present = navigation === 'present';
  const available = bodyWidth - 2 * gutter;
  expect(g.body.width).toBeCloseTo(bodyWidth, 0);
  expect(g.gutter).toBe(gutter);
  expect(g.columns).toBe(present && !stacked ? 2 : 1);
  expect(g.main.width).toBeCloseTo(present && !stacked ? available - rail - gap : available, 0);
  expect(g.overflow).toBe(false);
  expect(g.directOrder).toEqual(navigation === 'absent' ? ['main'] : ['navigation', 'main']);
  expect(g.shellOrder).toEqual(footer ? ['header', 'body', 'footer'] : ['header', 'body']);
  expect(g.main.x).toBeGreaterThanOrEqual(g.body.x + gutter - 1);
  expect(g.main.right).toBeLessThanOrEqual(g.body.right - gutter + 1);
  expect(g.main.width).toBeGreaterThan(0);
  if (present && !stacked) {
    expect(g.nav.width).toBeCloseTo(rail, 0);
    expect(g.gap).toBe(gap);
    expect(rtl ? g.nav.x - g.main.right : g.main.x - g.nav.right).toBeCloseTo(gap, 0);
  } else if (present) {
    expect(g.nav.width).toBeCloseTo(available, 0);
    expect(g.main.y).toBeGreaterThanOrEqual(g.nav.bottom + g.gap - 1);
  }
  if (navigation === 'hidden') {
    expect(g.navDisplay).toBe('none');
    await expect(page.getByRole('navigation', { name: 'Primary' })).toHaveCount(0);
  }
  if (footer) {
    expect(g.footer.y).toBeCloseTo(g.body.bottom, 0);
    expect(g.footer.bottom).toBeCloseTo(g.shell.bottom, 0);
  } else {
    expect(g.body.bottom).toBeCloseTo(g.shell.bottom, 0);
  }
}

async function capture(page, info, name) {
  const path = info.outputPath(name + '.png');
  await page.screenshot({ path, fullPage: true });
  await info.attach(name, { path, contentType: 'image/png' });
}

test('F-01 real AppShell mount releases optional navigation track and restores it', async ({ page }, info) => {
  await open(page);
  await check(page, { bodyWidth: 1920 });
  await capture(page, info, 'initial-no-navigation-1920');
  await setState(page, 'present', true);
  await check(page, { navigation: 'present', bodyWidth: 1920, footer: true });
  await capture(page, info, 'rail-present-1920');
  await setState(page, 'absent', true);
  await check(page, { bodyWidth: 1920, footer: true });
  await setState(page, 'hidden', true);
  await check(page, { navigation: 'hidden', bodyWidth: 1920, footer: true });
  await capture(page, info, 'rail-hidden-1920');
  await page.getByRole('button', { name: 'Main action' }).focus();
  await expect(page.getByRole('button', { name: 'Main action' })).toBeFocused();
  await setState(page, 'present');
  await check(page, { navigation: 'present', bodyWidth: 1920 });
  await page.getByRole('link', { name: 'Home' }).focus();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Main action' })).toBeFocused();
  for (const width of [769, 768, 640, 320]) {
    await page.setViewportSize({ width, height: 900 });
    for (const navigation of ['present', 'absent', 'hidden']) {
      await setState(page, navigation, true);
      await check(page, { navigation, bodyWidth: width, stacked: width <= 768, footer: true });
    }
    if (width === 640 || width === 320) await capture(page, info, 'rail-hidden-' + width);
  }
  expect((await expectNoAxeViolations(page)).violations).toEqual([]);
});

test('F-01 preserves explicit cap, constrained container, custom tokens and RTL', async ({ page }, info) => {
  await open(page);
  await page.evaluate(({ shell }) => {
    document.documentElement.dir = 'rtl';
    document.querySelector(shell).style.setProperty('--vf-app-shell-max-inline-size', '60rem');
    document.querySelector(shell).style.setProperty('--vf-app-shell-navigation-inline-size', '12rem');
    document.querySelector(shell).style.setProperty('--vf-app-shell-gap', '1.5rem');
    document.querySelector(shell).style.setProperty('--vf-app-shell-gutter', '0.75rem');
  }, { shell });
  await setState(page, 'present', true);
  await check(page, { navigation: 'present', bodyWidth: 960, rail: 192, gutter: 12, gap: 24, rtl: true, footer: true });
  const capped = await geometry(page);
  expect(capped.shell.width).toBe(1920);
  expect(capped.body.x).toBeCloseTo(480, 0);
  await capture(page, info, 'rtl-capped-rail-1920');
  await setState(page, 'hidden', true);
  await check(page, { navigation: 'hidden', bodyWidth: 960, gutter: 12, rtl: true, footer: true });
  await page.locator('#root').evaluate((node) => { node.style.inlineSize = '800px'; });
  await setState(page, 'present');
  await check(page, { navigation: 'present', bodyWidth: 800, rail: 192, gutter: 12, gap: 24, rtl: true });
  await setState(page, 'absent');
  await check(page, { bodyWidth: 800, gutter: 12, rtl: true });
  await capture(page, info, 'rtl-constrained-no-rail');
});
