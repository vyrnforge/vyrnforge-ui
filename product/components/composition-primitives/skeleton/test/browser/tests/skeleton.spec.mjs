import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('Skeleton independent Web presentation and accessibility', async ({ page }) => {
  test.skip((process.env.VF_COMPONENT_PORT || 'web') !== 'web', 'Native Web CSS fixture');
  await page.goto('/components/skeleton/web.html');
  const line = page.locator('#line');
  const block = page.locator('#block');
  const circle = page.locator('#circle');
  expect(await line.evaluate(el => el.getBoundingClientRect().height)).toBeLessThan(
    await block.evaluate(el => el.getBoundingClientRect().height),
  );
  expect(await circle.evaluate(el => getComputedStyle(el).inlineSize === getComputedStyle(el).blockSize)).toBe(true);
  await expect(line).toHaveCSS('animation-name', 'vf-loading-shimmer');
  await page.emulateMedia({ reducedMotion: 'reduce', forcedColors: 'active' });
  await expect(line).toHaveCSS('animation-name', 'none');
  await expect(line).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test('Skeleton wave has a single non-repeating highlight with distinct default paint in both themes', async ({ page }) => {
  test.skip((process.env.VF_COMPONENT_PORT || 'web') !== 'web', 'Native Web CSS fixture');
  await page.goto('/components/skeleton/web.html');
  const line = page.locator('#line');
  for (const theme of ['light', 'dark']) {
    await page.evaluate(value => document.documentElement.setAttribute('data-vf-theme', value), theme);
    const paint = await line.evaluate(el => {
      const style = getComputedStyle(el);
      const animation = el.getAnimations()[0];
      animation.pause();
      const duration = animation.effect.getTiming().duration;
      animation.currentTime = 0;
      const start = getComputedStyle(el).backgroundPosition;
      animation.currentTime = duration / 2;
      const middle = getComputedStyle(el).backgroundPosition;
      return {
        base: style.backgroundColor,
        gradient: style.backgroundImage,
        repeat: style.backgroundRepeat,
        size: style.backgroundSize,
        start,
        middle,
        frames: animation.effect.getKeyframes().map(frame => [frame.backgroundPositionX, frame.backgroundPositionY]),
      };
    });
    expect(paint.repeat).toBe('no-repeat');
    expect(paint.size).toBe('300% 100%');
    expect(paint.start).toBe('100% 0px');
    expect(paint.middle).toBe('50% 0px');
    expect(paint.frames).toEqual([['100%', '0px'], ['0%', '0px']]);
    expect(paint.gradient).toContain(paint.base);
    const colors = paint.gradient.match(/(?:rgba?|color)\([^)]*\)/g) ?? [];
    expect(new Set(colors).size).toBe(2);
  }
});
