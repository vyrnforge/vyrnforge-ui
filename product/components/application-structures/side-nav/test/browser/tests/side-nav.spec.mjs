import{test,expect}from'@playwright/test';
import { expectNoAxeViolations } from '../../../../../../../tooling/testing/accessibility.mjs';const port=process.env.VF_COMPONENT_PORT||'react';test('side nav keeps native links, shared visual states, and current-page semantics',async({page})=>{await page.goto(`/components/side-nav/${port}.html`);if(port==='angular')await expect(page.locator('html')).toHaveAttribute('data-vf-angular-hydrated','true');const home=page.getByRole('link',{name:'Home'});const projects=page.getByRole('link',{name:'Projects'});await expect(home).toHaveAttribute('aria-current','page');await expect(page.getByRole('navigation',{name:'Primary'})).toHaveCount(1);const defaultStyles=await page.evaluate(()=>{const current=document.querySelector('[data-vf-side-nav-link][aria-current="page"]');const other=document.querySelector('[data-vf-side-nav-link]:not([aria-current])');const currentStyle=getComputedStyle(current);const otherStyle=getComputedStyle(other);return{currentBackground:currentStyle.backgroundColor,otherBackground:otherStyle.backgroundColor,currentWeight:currentStyle.fontWeight,otherWeight:otherStyle.fontWeight,currentInlineStart:currentStyle.borderInlineStartWidth};});expect(defaultStyles.currentBackground).not.toBe(defaultStyles.otherBackground);expect(Number(defaultStyles.currentWeight)).toBeGreaterThan(Number(defaultStyles.otherWeight));expect(defaultStyles.currentInlineStart).toBe('3px');await projects.hover();await expect.poll(()=>projects.evaluate((node)=>getComputedStyle(node).backgroundColor)).not.toBe(defaultStyles.otherBackground);await expect.poll(()=>projects.evaluate((node)=>getComputedStyle(node).borderColor)).not.toBe('rgba(0, 0, 0, 0)');await home.focus();await expect(home).toBeFocused();const outline=await home.evaluate((node)=>getComputedStyle(node).outlineStyle);expect(outline).not.toBe('none');await page.evaluate(()=>{document.documentElement.dir='rtl';});const rtlBorders=await home.evaluate((node)=>{const style=getComputedStyle(node);return{left:style.borderLeftWidth,right:style.borderRightWidth};});expect(rtlBorders.right).toBe('3px');expect(rtlBorders.left).toBe('1px');expect((await expectNoAxeViolations(page)).violations).toEqual([]);});


test('Angular SideNav preserves authored state through hydration and convenience transitions', async ({ page }) => {
  test.skip(port !== 'angular', 'Angular public directive regression');
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (/NG05\d+/.test(message.text())) errors.push(message.text()); });
  await page.goto('/components/side-nav/angular.html');
  await expect(page.locator('html')).toHaveAttribute('data-vf-angular-hydrated', 'true');
  const soft = expect.configure({ soft: true, timeout: 1000 });
  const state = async (id, expected) => {
    const link = page.locator('#' + id);
    if (expected === null) await soft.poll(() => link.getAttribute('aria-current')).toBeNull();
    else await soft(link).toHaveAttribute('aria-current', expected);
    await soft.poll(() => link.evaluate(node => getComputedStyle(node).borderInlineStartWidth)).toBe(expected === 'page' ? '3px' : '1px');
    await soft(link).toHaveAttribute('href', '#destination');
  };
  const press = name => page.getByRole('button', { name, exact: true }).click();
  for (const [id, value] of [
    ['static-step', 'step'], ['static-page', 'page'], ['static-location', 'location'],
    ['static-false', 'false'], ['static-absent', null], ['static-toggle', 'step'], ['bound', 'step'],
  ]) await state(id, value);

  await press('Author location');
  await state('bound', 'location');
  await press('Toggle override');
  await state('bound', 'page');
  await state('static-toggle', 'page');
  await press('Author step');
  await state('bound', 'page');
  await press('Toggle override');
  await state('bound', 'step');
  await state('static-toggle', 'step');

  // A consumer write equal to the effective override must still become the fallback.
  await press('Toggle override');
  await press('Author page');
  await state('bound', 'page');
  await press('Toggle override');
  await state('bound', 'page');

  await press('Author false');
  await state('bound', 'false');
  await press('Toggle override');
  await press('Remove authored');
  await state('bound', 'page');
  await press('Toggle override');
  await state('bound', null);
  await press('Author location');
  await state('bound', 'location');
  await press('Remove authored');
  await state('bound', null);
  await press('Author page');
  await press('Unset authored');
  await state('bound', null);
  await state('native-bound', null);
  await press('Toggle override');
  await press('Set location and clear override');
  await state('bound', 'location');
  await state('native-bound', 'location');
  await state('static-toggle', 'step');
  await state('static-page', 'page');
  expect(errors).toEqual([]);
});

test('Angular SideNav remains an authored native link after hydration', async ({ page }) => {
  test.skip(port !== 'angular', 'Angular public directive regression');
  await page.goto('/components/side-nav/angular.html');
  await expect(page.locator('html')).toHaveAttribute('data-vf-angular-hydrated', 'true');
  const link = page.locator('#bound');
  await expect(link).toHaveAttribute('href', '#destination');
  expect(await link.evaluate(node => node.tagName)).toBe('A');
  await link.focus();
  await expect(link).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#destination$/);
});

test('Angular SideNav native modifier and middle clicks are not cancelled', async ({ page }) => {
  test.skip(port !== 'angular', 'Angular public directive regression');
  await page.goto('/components/side-nav/angular.html');
  await expect(page.locator('html')).toHaveAttribute('data-vf-angular-hydrated', 'true');
  const link = page.locator('#bound');
  await page.evaluate(() => {
    window.sideNavLinkEvents = [];
    for (const name of ['click', 'auxclick']) {
      document.addEventListener(name, event => {
        if (event.target.closest?.('#bound')) {
          window.sideNavLinkEvents.push({
            name, button: event.button, ctrl: event.ctrlKey, meta: event.metaKey,
            cancelled: event.defaultPrevented,
          });
          // Prevent the test harness itself from opening uncontrolled tabs.
          event.preventDefault();
        }
      });
    }
  });
  await link.click({ modifiers: ['ControlOrMeta'] });
  await link.click({ button: 'middle' });
  const events = await page.evaluate(() => window.sideNavLinkEvents);
  expect(events.some(event => event.name === 'click' && (event.ctrl || event.meta) && !event.cancelled)).toBe(true);
  expect(events.some(event => event.name === 'auxclick' && event.button === 1 && !event.cancelled)).toBe(true);
});


test('SideNav sibling and native ports agree on effective current semantics', async ({ page }) => {
  test.skip(port === 'angular', 'Angular has its own full public directive matrix');
  await page.goto(`/components/side-nav/${port}.html`);
  const modes = port === 'react' || port === 'vue' ? ['omitted', 'false', 'true'] : ['omitted'];
  for (const value of ['step', 'page', 'location', 'false', 'date', 'time', 'true', null]) {
    for (const mode of modes) {
      const link = page.locator(`#peer-${value ?? 'absent'}-${mode}`);
      const expected = mode === 'true' ? 'page' : value;
      await expect(link).toHaveAttribute('href', '#peer-destination');
      expect(await link.evaluate(node => node.tagName)).toBe('A');
      if (expected === null) await expect.poll(() => link.getAttribute('aria-current')).toBeNull();
      else await expect(link).toHaveAttribute('aria-current', expected);
      await expect.poll(() => link.evaluate(node => getComputedStyle(node).borderInlineStartWidth)).toBe(expected === 'page' ? '3px' : '1px');
    }
  }
});

test('Angular SideNav opens real browser tabs with native modifier and middle click', async ({ page, context, browserName }) => {
  test.skip(port !== 'angular' || browserName !== 'chromium', 'Chromium native tab behavior evidence');
  await page.goto('/components/side-nav/angular.html');
  await expect(page.locator('html')).toHaveAttribute('data-vf-angular-hydrated', 'true');
  const link = page.locator('#bound');
  for (const options of [{ modifiers: ['ControlOrMeta'] }, { button: 'middle' }]) {
    const [tab] = await Promise.all([context.waitForEvent('page'), link.click(options)]);
    try {
      await expect(tab).toHaveURL(/#destination$/);
      await expect(tab.locator('#destination')).toHaveText('Destination');
    } finally {
      await tab.close();
    }
    await expect(page).not.toHaveURL(/#destination$/);
  }
});
