import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('Loading supports built-ins, presentation customization, placeholders, native progress, and custom authored content', async ({ page }) => {
  await page.goto('/components/loading/web.html');

  for (const [id, animationName] of [
    ['spinner', 'vf-loading-spin'],
    ['dots', 'vf-loading-dots'],
    ['bars', 'vf-loading-bars'],
    ['pulse', 'vf-loading-pulse'],
  ]) {
    const indicator = page.locator('#' + id);
    await expect(indicator).toHaveAttribute('aria-hidden', 'true');
    expect(await indicator.evaluate((el) => getComputedStyle(el).animationName)).toBe(animationName);
  }

  const spinnerPresentation = await page.locator('#spinner').evaluate((el) => {
    const style = getComputedStyle(el);
    return {
      size: style.inlineSize,
      color: style.color,
      track: style.borderBottomColor,
      duration: style.animationDuration,
      borderWidth: style.borderTopWidth,
    };
  });
  expect(spinnerPresentation.size).toBe('16px');
  expect(spinnerPresentation.color).toBe('rgb(120, 40, 200)');
  expect(spinnerPresentation.track).toBe('rgb(230, 220, 240)');
  expect(spinnerPresentation.duration).toBe('1.1s');
  expect(parseFloat(spinnerPresentation.borderWidth)).toBeGreaterThan(2.5);

  const dotsPresentation = await page.locator('#dots').evaluate((el) => {
    const style = getComputedStyle(el);
    return {
      size: style.inlineSize,
      color: style.color,
      duration: style.animationDuration,
    };
  });
  expect(dotsPresentation).toEqual({
    size: '32px',
    color: 'rgb(20, 120, 160)',
    duration: '1.2s',
  });

  expect(await page.locator('#bars').evaluate((el) => ({
    color: getComputedStyle(el).color,
    duration: getComputedStyle(el).animationDuration,
  }))).toEqual({
    color: 'rgb(25, 90, 60)',
    duration: '1.3s',
  });

  expect(await page.locator('#pulse').evaluate((el) => {
    const style = getComputedStyle(el);
    return { size: style.inlineSize, color: style.color };
  })).toEqual({
    size: '32px',
    color: 'rgb(180, 80, 20)',
  });

  const media = page.locator('#media');
  const avatar = page.locator('#avatar');
  const lineA = page.locator('#line-a');
  for (const placeholder of [media, avatar, lineA]) {
    await expect(placeholder).toHaveAttribute('aria-hidden', 'true');
    expect(await placeholder.evaluate((el) => getComputedStyle(el).animationName)).toBe('vf-loading-shimmer');
    expect(await placeholder.evaluate((el) => getComputedStyle(el).animationDuration)).toBe('1.8s');
  }

  expect(await media.evaluate((el) => {
    const style = getComputedStyle(el);
    return {
      radius: style.borderRadius,
      backgroundImage: style.backgroundImage,
    };
  })).toEqual({
    radius: '12px',
    backgroundImage: 'linear-gradient(90deg, rgb(225, 235, 255) 0%, rgb(190, 210, 250) 45%, rgb(225, 235, 255) 90%)',
  });

  expect(await avatar.evaluate((el) => {
    const style = getComputedStyle(el);
    return style.inlineSize === style.blockSize && style.borderRadius === '50%';
  })).toBe(true);
  expect(await lineA.evaluate((el) => getComputedStyle(el).borderRadius)).toBe('999px');
  await expect(page.locator('#busy-region')).toHaveAttribute('aria-busy', 'true');

  const determinate = page.locator('#determinate');
  const indeterminate = page.locator('#indeterminate');
  await expect(determinate).toHaveJSProperty('value', 48);
  await expect(determinate).toHaveAttribute('max', '100');
  await expect(indeterminate).not.toHaveAttribute('value');
  expect(await determinate.evaluate((el) => el.matches(':indeterminate'))).toBe(false);
  expect(await indeterminate.evaluate((el) => el.matches(':indeterminate'))).toBe(true);
  expect(await determinate.evaluate((el) => {
    const style = getComputedStyle(el);
    return {
      accentColor: style.accentColor,
      size: style.blockSize,
      radius: style.borderRadius,
    };
  })).toEqual({
    accentColor: 'rgb(35, 105, 225)',
    size: '16px',
    radius: '12px',
  });

  const custom = page.locator('#custom');
  await expect(custom.locator('svg')).toHaveCount(1);
  await expect(custom).toHaveAttribute('aria-hidden', 'true');
  expect(await custom.evaluate((el) => getComputedStyle(el).color)).toBe('rgb(90, 70, 210)');
  await expect(page.locator('#status')).toHaveAttribute('role', 'status');

  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const id of ['spinner', 'dots', 'bars', 'pulse', 'media', 'avatar', 'line-a']) {
    expect(await page.locator('#' + id).evaluate((el) => getComputedStyle(el).animationName)).toBe('none');
  }

  await page.emulateMedia({ reducedMotion: 'no-preference', forcedColors: 'active' });
  expect(await media.evaluate((el) => getComputedStyle(el).opacity)).toBe('0.25');
  await expect(determinate).toBeVisible();
  await expect(page.locator('#spinner')).toBeVisible();

  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
