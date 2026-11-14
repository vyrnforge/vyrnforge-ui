import { test, expect } from '@playwright/test';
import { expectNoAxeViolations } from '../../../../../../../../tooling/testing/accessibility.mjs';
const port = process.env.VF_COMPONENT_PORT || 'react';
const open = async (page) => {
  await page.goto(`/components/rating/${port}.html`);
  if(port !== 'web') await expect(page.locator('body')).toHaveAttribute('data-rating-ready','true');
};
test('native Rating groups remain independent and submit only selected values', async ({page})=>{
  await open(page);
  const first=page.getByRole('radiogroup',{name:'First rating'}), second=page.getByRole('radiogroup',{name:'Second rating'});
  const one=first.getByRole('radio',{name:'Score 1'}), two=first.getByRole('radio',{name:'Score 2'});
  await expect(one).toBeChecked();
  await expect(second.getByRole('radio',{name:'Score 2'})).toBeChecked();
  expect(await one.getAttribute('name')).not.toBe(await second.getByRole('radio',{name:'Score 2'}).getAttribute('name'));
  await one.focus();
  await page.keyboard.press('ArrowRight');
  await expect(two).toBeChecked();
  await expect(second.getByRole('radio',{name:'Score 2'})).toBeChecked();
  await expect(first.getByRole('radio',{name:'Score 3'})).toBeDisabled();
  const name=await two.getAttribute('name');
  expect(await page.locator('#form').evaluate((form,name)=>new FormData(form).get(name),name)).toBe('2');
  await expectNoAxeViolations(page);
});
test('controlled Rating requests selection without replacing committed native checked state',async({page})=>{
  test.skip(port==='web'||port==='elements','Native authored groups do not implement controlled framework state.');
  await open(page);
  const group=page.getByRole('radiogroup',{name:'Controlled rating'});
  await group.getByRole('radio',{name:'Score 1'}).focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('body')).toHaveAttribute('data-requested','2');
  await expect(group.getByRole('radio',{name:'Score 1'})).toBeChecked();
  await expect(group.getByRole('radio',{name:'Score 2'})).not.toBeChecked();
});
test('generated rating labels are consumer-authored and native names survive activation',async({page,browser})=>{
  test.skip(port!=='react'&&port!=='vue','Generated items are framework convenience APIs.');
  const context=await browser.newContext({javaScriptEnabled:false});
  const staticPage=await context.newPage();
  await staticPage.goto(`/components/rating/${port}.html`);
  const name=await staticPage.getByRole('radiogroup',{name:'First rating'}).getByRole('radio',{name:'Score 1'}).getAttribute('name');
  await context.close();
  await open(page);
  await expect(page.getByRole('radiogroup',{name:'First rating'}).getByRole('radio',{name:'Score 1'})).toHaveAttribute('name',name);
  await expect(page.getByRole('radio',{name:'Localized score 2'})).toBeChecked();
});
test('public Rating CSS exposes focus and non-color filled and empty glyphs',async({page})=>{
  test.skip(port!=='web','CSS token evidence is owned by the Web lane.');
  await open(page);
  const first=page.getByRole('radiogroup',{name:'First rating'});
  await expect(first).toHaveCSS('gap','4px');
  for(const theme of ['light','dark']){
    await page.locator('html').evaluate((element,value)=>element.setAttribute('data-vf-theme',value),theme);
    await first.getByRole('radio',{name:'Score 1'}).focus();
    const glyph=first.locator('[data-vf-rating-glyph]');
    expect(await glyph.nth(0).evaluate(el=>getComputedStyle(el,'::before').content)).toContain('★');
    expect(await glyph.nth(1).evaluate(el=>getComputedStyle(el,'::before').content)).toContain('☆');
    await expect(first.locator('label').first()).toHaveCSS('outline-style','solid');
    expect(await first.locator('label').first().evaluate(el=>el.getBoundingClientRect().width)).toBeGreaterThanOrEqual(24);
  }
});
