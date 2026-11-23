import { test, expect } from '@playwright/test';

const port = process.env.VF_COMPONENT_PORT || 'web';
const placements = [
  { placement: 'top', ltr: 'top', rtl: 'top' },
  { placement: 'bottom', ltr: 'bottom', rtl: 'bottom' },
  { placement: 'left', ltr: 'left', rtl: 'left' },
  { placement: 'right', ltr: 'right', rtl: 'right' },
  { placement: 'top-start', ltr: 'top span-right', rtl: 'top span-left' },
  { placement: 'top-end', ltr: 'top span-left', rtl: 'top span-right' },
  { placement: 'bottom-start', ltr: 'bottom span-right', rtl: 'bottom span-left' },
  { placement: 'bottom-end', ltr: 'bottom span-left', rtl: 'bottom span-right' },
  { placement: 'left-start', ltr: 'left span-bottom', rtl: 'left span-bottom' },
  { placement: 'left-end', ltr: 'left span-top', rtl: 'left span-top' },
  { placement: 'right-start', ltr: 'right span-bottom', rtl: 'right span-bottom' },
  { placement: 'right-end', ltr: 'right span-top', rtl: 'right span-top' },
];
const normalize = (value) => value.trim().split(/\s+/).sort().join(' ');

test('preview-card native anchor placement preserves all public placements and RTL mappings', async ({ page }) => {
  test.skip(port !== 'web', 'Canonical anchor CSS is verified in the public Web stylesheet.');
  await page.goto('/components/preview-card/web.html');

  const actual = await page.evaluate(
    ({ attribute, cases }) => {
      const surface = document.createElement('div');
      surface.setAttribute(attribute, '');
      surface.setAttribute('popover', 'manual');
      document.body.append(surface);
      const read = () => getComputedStyle(surface).getPropertyValue('position-area');
      surface.dir = 'ltr';
      const defaultLtr = read();
      surface.dir = 'rtl';
      const defaultRtl = read();
      const placements = cases.map((scenario) => {
        surface.setAttribute('data-vf-placement', scenario.placement);
        surface.dir = 'ltr';
        const ltr = read();
        surface.dir = 'rtl';
        const rtl = read();
        return { placement: scenario.placement, ltr, rtl };
      });
      surface.remove();
      return { defaultLtr, defaultRtl, placements };
    },
    { attribute: 'data-vf-preview-card-content', cases: placements },
  );

  expect(normalize(actual.defaultLtr)).toBe(normalize('bottom span-right'));
  expect(normalize(actual.defaultRtl)).toBe(normalize('bottom span-left'));
  for (const [index, scenario] of placements.entries()) {
    expect(actual.placements[index].placement).toBe(scenario.placement);
    expect(normalize(actual.placements[index].ltr)).toBe(normalize(scenario.ltr));
    expect(normalize(actual.placements[index].rtl)).toBe(normalize(scenario.rtl));
  }
});

test('preview-card anchored CSS retains zero-specificity consumer override semantics', async ({ page }) => {
  test.skip(port !== 'web', 'Public CSS cascade evidence is owned by the Web lane.');
  await page.goto('/components/preview-card/web.html');

  const { before, after } = await page.evaluate(() => {
    const probe = document.createElement('div');
    probe.setAttribute('data-vf-preview-card-content', '');
    probe.setAttribute('popover', 'manual');
    probe.setAttribute('data-vf-placement', 'top');
    document.body.append(probe);
    const read = () => getComputedStyle(probe).getPropertyValue('position-area').trim();
    const before = read();

    const consumerStyle = document.createElement('style');
    consumerStyle.textContent =
      "@layer vyrnforge.components { :where([data-vf-preview-card-content][popover][data-vf-placement='top']) { position-area: bottom; } }";
    document.head.append(consumerStyle);
    const after = read();
    consumerStyle.remove();
    probe.remove();
    return { before, after };
  });

  expect(normalize(before)).toBe('top');
  expect(normalize(after)).toBe('bottom');
});
