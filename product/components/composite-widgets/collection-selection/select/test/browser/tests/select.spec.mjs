import { test, expect } from '@playwright/test';
import { expectNoAxeViolations } from '../../../../../../../../tooling/testing/accessibility.mjs';
const port = process.env.VF_COMPONENT_PORT || 'react';

async function expectAxeClean(page, options = {}) {
  expect((await expectNoAxeViolations(page, options)).violations).toEqual([]);
}

test('Select Web baseline exposes authored listbox semantics and canonical styling', async ({ page }) => {
  test.skip(port !== 'web', 'Web owns the static semantic and canonical styling baseline.');
  await page.goto('/components/select/web.html');
  const trigger = page.locator('[data-vf-select-trigger]').first();
  await expect(trigger).toHaveAttribute('aria-haspopup', 'listbox');
  await expect(trigger).toHaveAttribute(
    'aria-controls',
    await page.locator('[data-vf-select-content]').first().getAttribute('id'),
  );
  await trigger.click();
  await expect(page.getByRole('listbox', { name: 'Choose an option' })).toBeVisible();
  await expect(page.locator('#web-disabled')).toBeDisabled();
  await expectAxeClean(page);

  for (const theme of ['light', 'dark']) {
    await page.locator('html').evaluate((element, value) => element.setAttribute('data-vf-theme', value), theme);
    await expect(trigger).toHaveCSS('border-radius', '6px');
  }
});

test.describe('Select enhanced port behavior', () => {
  for (const framework of ['react', 'angular', 'vue', 'elements']) {
    test(`${framework} reuses enabled navigation and typeahead without changing selection`, async ({ page }) => {
      test.skip(port !== framework, `Running ${port} evidence only`);
      const errors = [];
      page.on('console', (message) => {
        if (message.type() === 'error') errors.push(message.text());
      });
      page.on('pageerror', (error) => errors.push(error.message));
      await page.goto(`/components/select/${framework}.html`);
      await page.waitForFunction(() => document.body.dataset.selectReady === 'true');

      const trigger = page.locator('[data-vf-select-trigger]').first();
      const listbox = page.getByRole('listbox', { name: 'Choose an option' });
      const one = page.locator(`#${framework}-one`);
      const disabled = page.locator(`#${framework}-disabled`);
      const three = page.locator(`#${framework}-three`);
      const banana = page.locator(`#${framework}-banana`);

      await expect(trigger).toHaveAttribute('aria-haspopup', 'listbox');
      await expect(trigger).toHaveAttribute('aria-expanded', 'false');
      await expect(trigger).toHaveAttribute(
        'aria-controls',
        await page.locator('[data-vf-select-content]').first().getAttribute('id'),
      );
      await trigger.focus();
      await page.keyboard.press('ArrowDown');
      await expect(trigger).toHaveAttribute('aria-expanded', 'true');
      await expect(listbox).toBeVisible();
      if (framework === 'react') await expect(listbox).toHaveCSS('animation-name', 'vf-motion-enter-reveal');
      await expect(one).toBeFocused();
      await expect(one).toHaveAttribute('aria-selected', 'true');
      await expect(disabled).toBeDisabled();
      await expect(disabled).toHaveAttribute('aria-disabled', 'true');

      await page.keyboard.press('ArrowDown');
      await expect(three).toBeFocused();
      await expect(one).toHaveAttribute('aria-selected', 'true');
      await expect(three).toHaveAttribute('aria-selected', 'false');

      await page.keyboard.press('End');
      await expect(banana).toBeFocused();
      await page.keyboard.press('Home');
      await expect(one).toBeFocused();
      await page.keyboard.press('b');
      await expect(banana).toBeFocused();
      await expect(one).toHaveAttribute('aria-selected', 'true');

      await page.keyboard.press('Escape');
      await expect(trigger).toBeFocused();
      await expect(trigger).toHaveAttribute('aria-expanded', 'false');
      await expect(listbox).toBeHidden();
      expect(errors.filter((error) => /hydration|mismatch|uncaught|error/i.test(error))).toEqual([]);
    });

    test(`${framework} selects the focused option and restores the trigger`, async ({ page }) => {
      test.skip(port !== framework, `Running ${port} evidence only`);
      await page.goto(`/components/select/${framework}.html`);
      await page.waitForFunction(() => document.body.dataset.selectReady === 'true');

      const trigger = page.locator('[data-vf-select-trigger]').first();
      await trigger.focus();
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowDown');
      await expect(page.locator(`#${framework}-three`)).toBeFocused();
      await page.keyboard.press('Enter');
      await expect(trigger).toBeFocused();
      await expect(trigger).toHaveAttribute('aria-expanded', 'false');

      if (framework === 'elements') {
        await expect(page.locator('#elements-select')).toHaveAttribute('value', 'three');
      } else {
        await expect(page.locator('body')).toHaveAttribute('data-value', 'three');
      }

      await page.keyboard.press('ArrowDown');
      await expect(page.locator(`#${framework}-three`)).toBeFocused();
      await expect(page.locator(`#${framework}-three`)).toHaveAttribute('aria-selected', 'true');
      await expectAxeClean(page);
    });
  }
});

test('native Web select remains the form-participating baseline', async ({ page }) => {
  test.skip(port !== 'web', 'Native Web form baseline.');
  await page.goto('/components/select/web.html');
  await page.locator('#native-select').selectOption('three');
  expect(await page.locator('#native-form').evaluate((form) => new FormData(form).get('choice'))).toBe('three');
  await page.getByRole('button', { name: 'Reset' }).click();
  await expect(page.locator('#native-select')).toHaveValue('one');
});

test('native popup stays in authored DOM and light-dismisses without committing navigation', async ({ page }) => {
  await page.goto(`/components/select/${port}.html`);
  if (port !== 'web') await page.waitForFunction(() => document.body.dataset.selectReady === 'true');
  const trigger = page.locator('[data-vf-select-trigger]').first();
  const list = page.locator('[data-vf-select-content]').first();
  await expect(list).toBeHidden();
  await trigger.press('Enter');
  await expect(list).toBeVisible();
  expect(await list.evaluate((node) => node.matches(':popover-open') && !!node.closest('main'))).toBe(true);
  await expectAxeClean(page);
  if (port !== 'web') {
    await expect(page.locator(`#${port}-one`)).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await expect(page.locator(`#${port}-three`)).toBeFocused();
  }
  await page.locator('#after').click();
  await expect(list).toBeHidden();
  await expect(page.locator('#after')).toBeFocused();
  await expect(page.locator(`#${port}-one`)).toHaveAttribute('aria-selected', 'true');
});

test('controlled value and open requests do not replace rejected committed state', async ({ page }) => {
  test.skip(port === 'web' || port === 'elements', 'Controlled framework contract.');
  await page.goto(`/components/select/${port}.html`);
  await page.waitForFunction(() => document.body.dataset.selectReady === 'true');
  await page.locator('#controlled-trigger').press('Enter');
  await expect(page.locator('#controlled-one')).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(page.locator('#controlled-three')).toBeFocused();
  await page.keyboard.press('Space');
  await expect(page.locator('body')).toHaveAttribute('data-select-request', 'three');
  await expect(page.locator('body')).toHaveAttribute('data-open-request', 'false');
  await expect(page.locator('#controlled-listbox')).toBeVisible();
  await expect(page.locator('#controlled-one')).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('#controlled-three')).toHaveAttribute('aria-selected', 'false');
  await page.locator('#after').click();
  await expect(page.locator('#controlled-listbox')).toBeVisible();
  expect(await page.locator('#controlled-listbox').evaluate((node) => node.matches(':popover-open'))).toBe(true);
});

test('Select owns coherent popup relationships across explicit and generated identities', async ({ page }) => {
  test.skip(port === 'web', 'Native Web authors relationships directly.');
  await page.goto(`/components/select/${port}.html`);
  await page.waitForFunction(() => document.body.dataset.selectReady === 'true');
  const trigger = page.locator('[data-vf-select-trigger]').first();
  const list = page.locator('[data-vf-select-content]').first();
  const listId = await list.getAttribute('id');
  expect(listId).toBeTruthy();
  await expect(trigger).toHaveAttribute('aria-controls', listId);
  await expect(page.locator('#obsolete-trigger, #obsolete-list')).toHaveCount(0);
  if (port === 'elements') {
    await list.evaluate((node) => (node.id = 'updated-list'));
    await expect(trigger).toHaveAttribute('aria-controls', 'updated-list');
  } else {
    expect(listId).toMatch(/^vf-select-/);
    await expect(page.locator('#controlled-trigger')).toHaveAttribute('aria-controls', 'controlled-listbox');
    await expect(page.locator('#controlled-listbox')).toHaveCount(1);
  }
  await trigger.press('Enter');
  await expect(list).toBeVisible();
  await expect(page.locator(`#${port}-one`)).toBeFocused();
});

test('Select preserves native disabled fieldset behavior for trigger and option events', async ({ page }) => {
  test.skip(port === 'web', 'Managed runtime evidence.');
  await page.goto(`/components/select/${port}.html`);
  await page.waitForFunction(() => document.body.dataset.selectReady === 'true');
  const trigger = page.locator('[data-vf-select-trigger]').first();
  const list = page.locator('[data-vf-select-content]').first();
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

test('Select native form control validates, submits committed values and resets with its associated form', async ({
  page,
}) => {
  test.skip(port === 'web', 'Managed custom selection form evidence.');
  await page.goto(`/components/select/${port}.html`);
  await page.waitForFunction(() => document.body.dataset.selectReady === 'true');
  const form = page.locator('#selection-form');
  const trigger = page.locator('#form-choice-trigger');
  const one = page.locator('#form-one');
  const three = page.locator('#form-three');
  const native = page.locator('#form-example select');
  const error = page.locator('#form-example [role="status"]');
  const data = () => form.evaluate((node) => new FormData(node).getAll('choice'));
  for (const button of [trigger, one, three]) {
    await expect(button).toHaveAttribute('type', 'button');
    expect(await button.evaluate((node) => node.form?.id)).toBe('selection-form');
  }
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
  await trigger.press('Enter');
  await expect(one).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(three).toBeFocused();
  await three.press('Enter');
  await expect(three).toHaveAttribute('aria-selected', 'true');
  await expect.poll(data).toEqual(['three']);
  await expect(page.locator('body')).not.toHaveAttribute('data-form-submitted', 'true');
  await form.evaluate((node) => node.requestSubmit());
  await expect(page.locator('body')).toHaveAttribute('data-form-submitted', 'true');
  await form.evaluate((node) => {
    node.addEventListener('reset', (event) => event.preventDefault(), { once: true });
    node.reset();
  });
  await expect.poll(data).toEqual(['three']);
  await form.evaluate((node) => node.reset());
  await expect(one).toHaveAttribute('aria-selected', 'false');
  await expect(three).toHaveAttribute('aria-selected', 'false');
  await expect.poll(data).toEqual(['']);
  await trigger.press('Enter');
  await expect(page.locator('#form-choice-listbox')).toBeVisible();
  await page.locator('#form-disable').evaluate((node) => node.click());
  await expect(trigger).toBeDisabled();
  await expect(native).toBeDisabled();
  await expect(page.locator('#form-choice-listbox')).toBeHidden();
  await expect.poll(data).toEqual([]);
  await page.locator('#form-disable').evaluate((node) => node.click());
  await expect(trigger).toBeEnabled();
  await expect(native).toBeEnabled();
  await expect(page.locator('#form-choice-listbox')).toBeHidden();
  await form.evaluate((node) => {
    const input = document.createElement('input');
    input.required = true;
    input.id = 'first-invalid';
    input.setAttribute('aria-label', 'First invalid native field');
    node.prepend(input);
    node.requestSubmit();
  });
  await expect(page.locator('#first-invalid')).toBeFocused();
  await expect(trigger).toHaveAttribute('aria-invalid', 'true');
  await page.locator('#first-invalid').evaluate((node) => node.remove());
  await native.evaluate((node) => {
    const fieldset = document.createElement('fieldset');
    node.before(fieldset);
    fieldset.append(node);
    fieldset.disabled = true;
  });
  expect(await native.evaluate((node) => node.willValidate)).toBe(false);
  expect(await data()).toEqual([]);
});

test('Select controlled rejection and reset preserve submitted owner values', async ({ page }) => {
  test.skip(port === 'web' || port === 'elements', 'Framework controlled contract.');
  await page.goto(`/components/select/${port}.html`);
  await page.waitForFunction(() => document.body.dataset.selectReady === 'true');
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
