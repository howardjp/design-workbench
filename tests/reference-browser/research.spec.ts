import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {mkdir} from 'node:fs/promises';
for(const family of ['martlet','krigsvold']) {
 const url=`http://127.0.0.1:${family==='martlet'?4189:4188}/${family}/?page=research`;
 test(`${family}: research page navigation, evidence and request recovery`,async({page})=>{
  await page.goto(url);
  await expect(page.getByRole('heading',{level:1})).toHaveText('Following the water');
  await page.getByRole('navigation',{name:'Project contents'}).getByRole('link',{name:'Observations',exact:true}).click();
  await expect(page).toHaveURL(/#research-observations$/);
  await expect(page.getByRole('table')).toContainText('Two visits missing');
  await expect(page.getByRole('table').getByRole('row')).toHaveCount(5);
  const form=page.getByRole('form',{name:'Research materials request'});
  await form.getByRole('button',{name:'Send request',exact:true}).click();
  await expect(form.getByRole('alert')).toBeFocused();
  await form.getByLabel('Title (required)',{exact:true}).fill('Request field sheets');
  await form.getByLabel('Summary (required)',{exact:true}).fill('Please include the observation register and protocol.');
  await form.getByLabel('Response name (required)',{exact:true}).fill('Example reader');
  await form.getByLabel('Response email (required)',{exact:true}).fill('reader@example.org');
  await page.getByText('Inspect form failure',{exact:true}).click();
  await page.getByRole('checkbox',{name:'Fail the next valid save'}).check();
  await form.getByRole('button',{name:'Send request',exact:true}).click();
  await expect(form.getByRole('alert')).toContainText('Your request has not been sent');
  await expect(form.getByLabel('Title (required)',{exact:true})).toHaveValue('Request field sheets');
  await form.getByRole('button',{name:'Try sending again'}).click();
  await expect(form.getByRole('status')).toContainText('Request saved in this example');
  await form.getByLabel('Title (required)',{exact:true}).fill('Changed request');
  await form.getByRole('button',{name:'Reset specimen'}).click();
  await page.keyboard.press('Escape');
  await expect(form.getByRole('button',{name:'Reset specimen'})).toBeFocused();
  await expect(form.getByLabel('Title (required)',{exact:true})).toHaveValue('Changed request');
 });
 for(const mode of ['light','dark']) test(`${family}: research ${mode} accessibility and responsive layout`,async({page})=>{
  await page.goto(`${url}&mode=${mode}`);
  for(const width of [1440,768,320]) {
   await page.setViewportSize({width,height:1000});
   await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
   await expect(page.getByRole('heading',{level:1})).toBeVisible();
   await mkdir('test-results/reference-proof',{recursive:true});
   await page.screenshot({path:`test-results/reference-proof/${family}-research-${mode}-${width}.png`,fullPage:true});
  }
  await page.setViewportSize({width:1280,height:1000});
  const a11y=await new AxeBuilder({page}).analyze();
  expect(a11y.violations).toEqual([]);
  await page.evaluate(()=>document.documentElement.style.fontSize='200%');
  await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 });
}

// Preserve the source document relationship, including a tall desktop viewport.
test('martlet: article index stays left until its container needs to reflow',async({page})=>{
 await page.goto('http://127.0.0.1:4189/martlet/?page=research');
 const toc=page.getByRole('navigation',{name:'Project contents'});
 const body=page.locator('.research-martlet .martlet-prose');
 for(const [width,height] of [[1440,1000],[1280,1800],[1100,1000]]) {
  await page.setViewportSize({width,height});
  const index=await toc.boundingBox(), prose=await body.boundingBox();
  expect(index!.x+index!.width).toBeLessThanOrEqual(prose!.x);
  expect(Math.abs(index!.y-prose!.y)).toBeLessThan(2);
 }
 for(const width of [768,320]) {
  await page.setViewportSize({width,height:1000});
  const index=await toc.boundingBox(), prose=await body.boundingBox();
  expect(index!.y+index!.height).toBeLessThanOrEqual(prose!.y);
  const links=await toc.getByRole('link').all();
  const boxes=await Promise.all(links.map(link=>link.boundingBox()));
  for(let i=1;i<boxes.length;i++) {
   expect(boxes[i]!.x).toBeCloseTo(boxes[0]!.x,0);
   expect(boxes[i]!.y).toBeGreaterThan(boxes[i-1]!.y);
  }
 }
});
