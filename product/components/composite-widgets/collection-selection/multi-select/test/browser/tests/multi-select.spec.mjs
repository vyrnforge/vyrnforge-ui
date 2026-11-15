import { test, expect } from '@playwright/test';
import { expectNoAxeViolations } from '../../../../../../../../tooling/testing/accessibility.mjs';
const port = process.env.VF_COMPONENT_PORT || 'react';

async function expectAxeClean(page, options = {}) {
  expect((await expectNoAxeViolations(page, options)).violations).toEqual([]);
}

test('MultiSelect Web baseline exposes authored semantics and canonical styling', async ({ page }) => {
  test.skip(port !== 'web', 'Web owns the static semantic and canonical styling baseline.');
  await page.goto('/components/multi-select/web.html');
  const trigger = page.locator('[data-vf-multi-select-trigger]').first();
  const listbox = page.getByRole('listbox', { name: 'Choose items' });
  await expect(trigger).toHaveAttribute('aria-haspopup', 'listbox');
  await expect(trigger).toHaveAttribute(
    'aria-controls',
    await page.locator('[data-vf-multi-select-content]').first().getAttribute('id'),
  );
  await trigger.click();
  await expect(listbox).toBeVisible();
  await expect(listbox).toHaveAttribute('aria-multiselectable', 'true');
  await expect(listbox).toHaveCSS('display', 'grid');
  await expect(listbox).toHaveCSS('min-width', '192px');
  await expect(page.locator('#web-one')).toHaveCSS('padding-left', '16px');
  await expect(page.locator('#web-disabled')).toBeDisabled();
  await expectAxeClean(page);
});

test.describe('MultiSelect enhanced port behavior', () => {
  for (const framework of ['react', 'angular', 'vue', 'elements']) {
    test(`${framework} navigates enabled options without collapsing multi-selection`, async ({ page }) => {
      test.skip(port !== framework, `Running ${port} evidence only`);
      const errors = [];
      page.on('console', (message) => {
        if (message.type() === 'error') errors.push(message.text());
      });
      page.on('pageerror', (error) => errors.push(error.message));
      await page.goto(`/components/multi-select/${framework}.html`);
      await page.waitForFunction(() => document.body.dataset.multiReady === 'true');

      const trigger = page.locator('[data-vf-multi-select-trigger]').first();
      const listbox = page.getByRole('listbox', { name: 'Choose items' });
      const one = page.locator(`#${framework}-one`);
      const disabled = page.locator(`#${framework}-disabled`);
      const three = page.locator(`#${framework}-three`);
      const banana = page.locator(`#${framework}-banana`);

      await expect(trigger).toHaveAttribute('aria-haspopup', 'listbox');
      await expect(trigger).toHaveAttribute('aria-expanded', 'false');
      await trigger.focus();
      await page.keyboard.press('ArrowDown');
      await expect(trigger).toHaveAttribute('aria-expanded', 'true');
      await expect(listbox).toBeVisible();
      await expect(listbox).toHaveAttribute('aria-multiselectable', 'true');
      await expect(one).toBeFocused();
      await expect(one).toHaveAttribute('aria-selected', 'true');
      await expect(disabled).toBeDisabled();
      await expect(disabled).toHaveAttribute('aria-disabled', 'true');

      await page.keyboard.press('ArrowDown');
      await expect(three).toBeFocused();
      await expect(one).toHaveAttribute('aria-selected', 'true');
      await expect(three).toHaveAttribute('aria-selected', 'false');

      await page.keyboard.press('Space');
      await expect(three).toBeFocused();
      await expect(listbox).toBeVisible();
      await expect(one).toHaveAttribute('aria-selected', 'true');
      await expect(three).toHaveAttribute('aria-selected', 'true');

      if (framework === 'elements') {
        await expect(three).toHaveAttribute('aria-selected', 'true');
      } else {
        await expect(page.locator('body')).toHaveAttribute('data-values', 'one,three');
      }

      await page.keyboard.press('End');
      await expect(banana).toBeFocused();
      await page.keyboard.press('Home');
      await expect(one).toBeFocused();
      await page.keyboard.press('b');
      await expect(banana).toBeFocused();
      await expect(one).toHaveAttribute('aria-selected', 'true');
      await expect(three).toHaveAttribute('aria-selected', 'true');

      await page.keyboard.press('Escape');
      await expect(trigger).toBeFocused();
      await expect(trigger).toHaveAttribute('aria-expanded', 'false');
      await expect(listbox).toBeHidden();
      expect(errors.filter((error) => /hydration|mismatch|uncaught|error/i.test(error))).toEqual([]);
    });

    test(`${framework} reopens on a selected option and preserves accessible option state`, async ({ page }) => {
      test.skip(port !== framework, `Running ${port} evidence only`);
      await page.goto(`/components/multi-select/${framework}.html`);
      await page.waitForFunction(() => document.body.dataset.multiReady === 'true');

      const trigger = page.locator('[data-vf-multi-select-trigger]').first();
      await trigger.focus();
      await page.keyboard.press('ArrowDown');
      await expect(page.locator(`#${framework}-one`)).toBeFocused();
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('Space');
      await expect(page.locator(`#${framework}-three`)).toHaveAttribute('aria-selected', 'true');
      await page.keyboard.press('Escape');
      await expect(trigger).toBeFocused();
      await expect(page.locator('[data-vf-multi-select-content]').first()).toBeHidden();
      await page.keyboard.press('ArrowDown');

      await expect(page.locator(`#${framework}-one`)).toBeFocused();
      await expect(page.locator(`#${framework}-one`)).toHaveAttribute('aria-selected', 'true');
      await expect(page.locator(`#${framework}-three`)).toHaveAttribute('aria-selected', 'true');
      await expectAxeClean(page);
    });
  }
});

test('native popup light dismissal preserves committed multiple values and outside focus', async ({ page }) => {
  await page.goto(`/components/multi-select/${port}.html`);
  if (port !== 'web') await page.waitForFunction(() => document.body.dataset.multiReady === 'true');
  const trigger = page.locator('[data-vf-multi-select-trigger]').first();
  const list = page.locator('[data-vf-multi-select-content]').first();
  await expect(list).toBeHidden();
  await trigger.press('Enter');
  await expect(list).toBeVisible();
  expect(await list.evaluate((node) => node.matches(':popover-open') && !!node.closest('main'))).toBe(true);
  if (port !== 'web') {
    await expect(page.locator(`#${port}-one`)).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await expect(page.locator(`#${port}-three`)).toHaveAttribute('aria-selected', 'true');
    await expect(list).toBeVisible();
  }
  await expectAxeClean(page);
  await page.locator('#after').click();
  await expect(list).toBeHidden();
  await expect(page.locator('#after')).toBeFocused();
  await expect(page.locator(`#${port}-one`)).toHaveAttribute('aria-selected', 'true');
  if (port !== 'web') await expect(page.locator(`#${port}-three`)).toHaveAttribute('aria-selected', 'true');
});

test('controlled value rejection retains committed collection and popup focus', async ({ page }) => {
  test.skip(port === 'web' || port === 'elements', 'Controlled framework contract.');
  await page.goto(`/components/multi-select/${port}.html`);
  await page.waitForFunction(() => document.body.dataset.multiReady === 'true');
  await page.locator('#controlled-trigger').press('Enter');
  await expect(page.locator('#controlled-one')).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(page.locator('#controlled-three')).toBeFocused();
  await page.keyboard.press('Space');
  await expect(page.locator('body')).toHaveAttribute('data-multi-request', 'one,three');
  await expect(page.locator('#controlled-listbox')).toBeVisible();
  await expect(page.locator('#controlled-one')).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('#controlled-three')).toHaveAttribute('aria-selected', 'false');
  await expect(page.locator('#controlled-three')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.locator('#controlled-listbox')).toBeHidden();
  await expect(page.locator('#after')).toBeFocused();
});

test('Angular Escape returns focus before the next keyboard event', async ({ page }) => {
  test.skip(port !== 'angular', 'Angular render scheduling regression.');
  await page.goto('/components/multi-select/angular.html');
  await page.waitForFunction(() => document.body.dataset.multiReady === 'true');
  await page.locator('[data-vf-multi-select-trigger]').first().press('ArrowDown');
  await expect(page.locator('#angular-one')).toBeFocused();
  const focused = await page.locator('#angular-one').evaluate((node) => {
    node.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    return document.activeElement?.id;
  });
  expect(focused).toBe(await page.locator('[data-vf-multi-select-trigger]').first().getAttribute('id'));
  await page.keyboard.press('ArrowDown');
  await expect(page.locator('#angular-one')).toBeFocused();
});

test('MultiSelect owns coherent popup relationships across explicit and generated identities', async ({ page }) => {
  test.skip(port === 'web', 'Native Web authors relationships directly.');
  await page.goto(`/components/multi-select/${port}.html`);
  await page.waitForFunction(() => document.body.dataset.multiReady === 'true');
  const trigger = page.locator('[data-vf-multi-select-trigger]').first();
  const list = page.locator('[data-vf-multi-select-content]').first();
  const listId = await list.getAttribute('id');
  expect(listId).toBeTruthy();
  await expect(trigger).toHaveAttribute('aria-controls', listId);
  await expect(page.locator('#obsolete-trigger, #obsolete-list')).toHaveCount(0);
  if (port === 'elements') {
    await list.evaluate((node) => (node.id = 'updated-list'));
    await expect(trigger).toHaveAttribute('aria-controls', 'updated-list');
  } else {
    expect(listId).toMatch(/^vf-multi-select-/);
    await expect(page.locator('#controlled-trigger')).toHaveAttribute('aria-controls', 'controlled-listbox');
    await expect(page.locator('#controlled-listbox')).toHaveCount(1);
  }
  await trigger.press('Enter');
  await expect(list).toBeVisible();
  await expect(page.locator(`#${port}-one`)).toBeFocused();
});

test('MultiSelect preserves native disabled fieldset behavior for trigger and option events', async ({ page }) => {
  test.skip(port === 'web', 'Managed runtime evidence.');
  await page.goto(`/components/multi-select/${port}.html`);
  await page.waitForFunction(() => document.body.dataset.multiReady === 'true');
  const trigger = page.locator('[data-vf-multi-select-trigger]').first();
  const list = page.locator('[data-vf-multi-select-content]').first();
  await trigger.evaluate((node) => {
    const fieldset = document.createElement('fieldset');
    fieldset.id = 'selection-fieldset';
    node.before(fieldset);
    fieldset.append(node);
    fieldset.disabled = true;
  });
  const fieldset = page.locator('#selection-fieldset');
  await expect(trigger).toBeDisabled();
  const prevented = await trigger.evaluate((node) => {
    const key = new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true });
    node.dispatchEvent(key);
    node.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    return key.defaultPrevented;
  });
  expect(prevented).toBe(false);
  await expect(list).toBeHidden();
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await fieldset.evaluate((node) => (node.disabled = false));
  await trigger.press('Enter');
  await expect(list).toBeVisible();
  const option = page.locator(`#${port}-three`);
  await option.evaluate((node) => {
    const fieldset = document.createElement('fieldset');
    node.before(fieldset);
    fieldset.append(node);
    fieldset.disabled = true;
  });
  await expect(option).toBeDisabled();
  await option.evaluate((node) => node.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true })));
  await expect(option).toHaveAttribute('aria-selected', 'false');
  await expect(page.locator(`#${port}-one`)).toHaveAttribute('aria-selected', 'true');
});


test('MultiSelect native form control validates, submits committed values and resets with its associated form', async ({ page }) => {
  test.skip(port === 'web', 'Managed custom selection form evidence.');
  await page.goto(`/components/multi-select/${port}.html`);
  await page.waitForFunction(() => document.body.dataset.multiReady === 'true');
  const form = page.locator('#selection-form');
  const trigger = page.locator('#form-choice-trigger');
  const one = page.locator('#form-one');
  const three = page.locator('#form-three');
  const native = page.locator('#form-example select');
  const error = page.locator('#form-example [role="status"]');
  const data = () => form.evaluate((node) => new FormData(node).getAll('choice'));
  await expect(native).toBeHidden();
  expect(await native.evaluate((node) => node.form?.id)).toBe('selection-form');
  await form.evaluate((node) => {
    node.addEventListener('submit', (event) => {
      event.preventDefault();
      document.body.dataset.formSubmitted = 'true';
    });
    node.requestSubmit();
  });
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveAttribute('aria-invalid', 'true');
  await expect(error).not.toBeEmpty();
  await expect(trigger).toHaveAttribute('aria-describedby', /form-hint.*error/);
  await expect(page.locator('body')).not.toHaveAttribute('data-form-submitted', 'true');
  await trigger.press('Enter');
  await expect(one).toBeFocused();
  await one.press('Enter');
  await expect(one).toHaveAttribute('aria-selected', 'true');
  await expect.poll(data).toEqual(['one']);
  await expect(error).toBeEmpty();
  await expect(trigger).not.toHaveAttribute('aria-invalid', 'true');
  await expect(trigger).toHaveAttribute('aria-describedby', 'form-hint');
  await three.press('Enter');
  await expect(three).toHaveAttribute('aria-selected', 'true');
  await expect.poll(data).toEqual(['one', 'three']);
  await form.evaluate((node) => node.requestSubmit());
  await expect(page.locator('body')).toHaveAttribute('data-form-submitted', 'true');
  await form.evaluate((node) => {
    node.addEventListener('reset', (event) => event.preventDefault(), { once: true });
    node.reset();
  });
  await expect.poll(data).toEqual(['one', 'three']);
  await form.evaluate((node) => node.reset());
  await expect(one).toHaveAttribute('aria-selected', 'false');
  await expect(three).toHaveAttribute('aria-selected', 'false');
  await expect.poll(data).toEqual([]);
  await native.evaluate((node) => {
    const fieldset = document.createElement('fieldset');
    node.before(fieldset);
    fieldset.append(node);
    fieldset.disabled = true;
  });
  expect(await native.evaluate((node) => node.willValidate)).toBe(false);
  expect(await data()).toEqual([]);
});

test('MultiSelect controlled rejection and reset preserve submitted owner values', async ({ page }) => {
  test.skip(port === 'web' || port === 'elements', 'Framework controlled contract.');
  await page.goto(`/components/multi-select/${port}.html`);
  await page.waitForFunction(() => document.body.dataset.multiReady === 'true');
  const form = page.locator('#controlled-form');
  const data = () => form.evaluate((node) => new FormData(node).getAll('choice'));
  await expect.poll(data).toEqual(['one']);
  await page.locator('#controlled-trigger').press('Enter');
  await expect(page.locator('#controlled-one')).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(page.locator('#controlled-three')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#controlled-three')).toHaveAttribute('aria-selected', 'false');
  await expect.poll(data).toEqual(['one']);
  await form.evaluate((node) => node.reset());
  await expect(page.locator('#controlled-one')).toHaveAttribute('aria-selected', 'true');
  await expect.poll(data).toEqual(['one']);
});
