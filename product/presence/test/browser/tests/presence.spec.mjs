import { test, expect } from '@playwright/test';
import axeCore from 'axe-core';
const port=process.env.VF_COMPONENT_PORT||'react';
test('Presence retains exiting content until explicit completion',async({page})=>{
  await page.goto(`/components/presence/${port}.html`);
  const panel=page.locator('#panel');
  await expect(panel).toHaveAttribute('data-state','entered');
  await page.locator('#close').click();
  await expect(panel).toHaveAttribute('data-state','exiting');
  await page.addScriptTag({content:axeCore.source});
  const results=await page.evaluate(async()=>globalThis.axe.run(document)); expect(results.violations).toEqual([]);
  await page.locator('#complete').click();
  await expect(panel).toBeHidden();
  await page.screenshot({path:`test-results/presence-${port}.png`,fullPage:true});
});
