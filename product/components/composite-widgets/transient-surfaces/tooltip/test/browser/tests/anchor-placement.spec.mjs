import { test, expect } from '@playwright/test';

const port = process.env.VF_COMPONENT_PORT || 'web';
const placements = [
  {
    "placement": "top",
    "ltr": "top",
    "rtl": "top"
  },
  {
    "placement": "bottom",
    "ltr": "bottom",
    "rtl": "bottom"
  },
  {
    "placement": "left",
    "ltr": "left",
    "rtl": "left"
  },
  {
    "placement": "right",
    "ltr": "right",
    "rtl": "right"
  },
  {
    "placement": "top-start",
    "ltr": "top span-right",
    "rtl": "top span-left"
  },
  {
    "placement": "top-end",
    "ltr": "top span-left",
    "rtl": "top span-right"
  },
  {
    "placement": "bottom-start",
    "ltr": "bottom span-right",
    "rtl": "bottom span-left"
  },
  {
    "placement": "bottom-end",
    "ltr": "bottom span-left",
    "rtl": "bottom span-right"
  },
  {
    "placement": "left-start",
    "ltr": "left span-bottom",
    "rtl": "left span-bottom"
  },
  {
    "placement": "left-end",
    "ltr": "left span-top",
    "rtl": "left span-top"
  },
  {
    "placement": "right-start",
    "ltr": "right span-bottom",
    "rtl": "right span-bottom"
  },
  {
    "placement": "right-end",
    "ltr": "right span-top",
    "rtl": "right span-top"
  }
];
const normalize = (value) => value.trim().split(/\\s+/).sort().join(' ');

test('tooltip native anchor placement preserves all public placements and RTL mappings', async ({ page }) => {
  test.skip(port !== 'web', 'Canonical anchor CSS is verified in the public Web stylesheet.');
  await page.goto('/components/tooltip/web.html');

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
    { attribute: 'data-vf-tooltip-content', cases: placements },
  );

  expect(normalize(actual.defaultLtr)).toBe(normalize('top'));
  expect(normalize(actual.defaultRtl)).toBe(normalize('top'));
  for (const [index, scenario] of placements.entries()) {
    expect(actual.placements[index].placement).toBe(scenario.placement);
    expect(normalize(actual.placements[index].ltr)).toBe(normalize(scenario.ltr));
    expect(normalize(actual.placements[index].rtl)).toBe(normalize(scenario.rtl));
  }
});
