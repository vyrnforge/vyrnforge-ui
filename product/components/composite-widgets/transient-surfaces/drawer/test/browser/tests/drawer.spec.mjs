import { test, expect } from '@playwright/test';
import { expectNoAxeViolations } from '../../../../../../../../tooling/testing/accessibility.mjs';
const port = process.env.VF_COMPONENT_PORT || 'react';

async function openFixture(page) {
  await page.goto(`/components/drawer/${port}.html`);
  if(port==='elements')await expect(page.locator('body')).toHaveAttribute('data-modal-ready','true');
  const trigger=page.locator('#trigger');
  const modal=page.locator('#modal');
  await expect(modal).not.toHaveAttribute('open','');
  await trigger.click();
  await expect(modal).toHaveAttribute('open','');
  expect(await modal.evaluate(el=>el.matches(':modal'))).toBe(true);
  await expect(page.getByRole('dialog',{name:'Settings',exact:true})).toBeVisible();
  await expect(page.locator('#close')).toBeFocused();
  return {modal,trigger};
}

test('drawer public ports preserve native modality, naming, dismissal and focus',async({page})=>{
  const {modal,trigger}=await openFixture(page);
  expect(await modal.evaluate(el=>!!el.ownerDocument.getElementById(el.getAttribute('aria-describedby')))).toBe(true);
  expect((await expectNoAxeViolations(page)).violations).toEqual([]);
  await page.keyboard.press('Escape');
  await expect(modal).not.toHaveAttribute('open','');
  await expect(trigger).toBeFocused();
  if(port!=='web')await expect(page.locator('body')).toHaveAttribute('data-dismiss-reason','escape');
  await trigger.click();
  await page.locator('#close').click();
  await expect(modal).not.toHaveAttribute('open','');
  await expect(trigger).toBeFocused();
});

test('drawer controlled rejection keeps committed native modality',async({page})=>{
  test.skip(port==='web','Native authored baseline has no framework owner.');
  const {modal}=await openFixture(page);
  await page.locator('body').evaluate(body=>{body.dataset.rejectClose='true';});
  await page.keyboard.press('Escape');
  await expect(modal).toHaveAttribute('open','');
  await expect(page.locator('body')).toHaveAttribute('data-dismiss-reason','escape');
  await page.locator('#close').click();
  await expect(modal).toHaveAttribute('open','');
  await page.locator('body').evaluate(body=>{delete body.dataset.rejectClose;});
  await page.locator('#close').click();
  await expect(modal).not.toHaveAttribute('open','');
});

test('Drawer end placement follows logical direction and fits viewport',async({page})=>{
  const {modal}=await openFixture(page);
  const viewport=page.viewportSize();
  const box=await modal.boundingBox();
  if(!box||!viewport)throw new Error('Missing geometry');
  expect(Math.abs(box.x+box.width-viewport.width)).toBeLessThan(3);
  expect(box.y).toBeGreaterThanOrEqual(0);
  expect(box.y+box.height).toBeLessThanOrEqual(viewport.height+2);
  await page.locator('html').evaluate(el=>el.dir='rtl');
  await expect.poll(async()=>Math.abs((await modal.boundingBox())?.x??Infinity)).toBeLessThan(3);
});
