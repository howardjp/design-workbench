import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {mkdir} from 'node:fs/promises';
for(const family of ['martlet','krigsvold']){
 test(`${family}: form validation, failure, retry, retained input and draft reset`,async({page})=>{
  await page.goto(`http://127.0.0.1:${family==='martlet'?4189:4188}/${family}/?page=patterns`);
  const form=page.getByRole('form',{name:'Publication request'});
  await form.getByRole('button',{name:'Send request',exact:true}).click();
  const summary=form.getByRole('alert');await expect(summary).toBeFocused();
  await expect(summary.getByRole('link')).toHaveCount(4);
  await summary.getByRole('link',{name:'Enter a title of at least three characters.'}).click();await expect(page.getByLabel('Title (required)',{exact:true})).toBeFocused();
  await page.getByLabel('Title (required)',{exact:true}).fill('A useful publication');
  await form.getByRole('button',{name:'Reset specimen'}).click();
  const guard=page.getByRole('dialog',{name:'Discard this request?'});await expect(guard).toBeVisible();
  await page.keyboard.press('Escape');await expect(guard).not.toBeVisible();await expect(form.getByRole('button',{name:'Reset specimen'})).toBeFocused();await expect(page.getByLabel('Title (required)',{exact:true})).toHaveValue('A useful publication');
  await page.getByLabel('Summary (required)',{exact:true}).fill('A request with enough context to review.');
  await page.getByLabel('Response name (required)',{exact:true}).fill('Example reader');await page.getByLabel('Response email (required)',{exact:true}).fill('reader@example.org');
  await page.getByRole('checkbox',{name:'Include a copy of the request in the response'}).uncheck();
  await page.getByText('Inspect form failure',{exact:true}).click();await page.getByRole('checkbox',{name:'Fail the next valid save'}).check();
  await form.getByRole('button',{name:'Send request',exact:true}).click();await expect(form.getByRole('button',{name:'Sending…'})).toBeDisabled();
  await expect(summary).toContainText('Your request has not been sent');await expect(summary).toBeFocused();
  await expect(page.getByLabel('Summary (required)',{exact:true})).toHaveValue('A request with enough context to review.');await expect(page.getByRole('checkbox',{name:'Include a copy of the request in the response'})).not.toBeChecked();
  await form.getByRole('button',{name:'Try sending again'}).click();await expect(form.getByRole('status')).toContainText('Request saved in this example');
  await page.getByLabel('Title (required)',{exact:true}).fill('A changed request');await form.getByRole('button',{name:'Reset specimen'}).click();await guard.getByRole('button',{name:'Discard changes',exact:true}).click();await expect(guard).not.toBeVisible();await expect(form.getByRole('button',{name:'Reset specimen'})).toBeFocused();await expect(page.getByLabel('Title (required)',{exact:true})).toHaveValue('');
  await mkdir('test-results/reference-proof',{recursive:true});await page.setViewportSize({width:1440,height:1100});await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:`test-results/reference-proof/${family}-form.png`,fullPage:true});
 });
 test(`${family}: results preserve failed scope, selection and recover no-match/empty states`,async({page})=>{
  await page.goto(`http://127.0.0.1:${family==='martlet'?4189:4188}/${family}/?page=patterns&pattern=results`);
  await page.getByRole('checkbox',{name:'Select AppShell',exact:true}).check();
  await page.getByRole('searchbox',{name:'Search the component catalogue'}).fill('Tabs');await expect(page.locator('.reference-applied-scope').first()).toContainText('All component names');
  await page.getByText('Inspect result states',{exact:true}).click();await page.getByRole('checkbox',{name:'Fail the next result request'}).check();
  await page.getByRole('button',{name:'Apply query'}).click();await expect(page.getByRole('region',{name:'Committed component results'})).toHaveAttribute('aria-busy','true');await expect(page.locator('.reference-applied-scope').nth(1)).toContainText('Tabs');
  await expect(page.getByRole('button',{name:'Retry results'})).toBeVisible();await expect(page.getByRole('checkbox',{name:'Select AppShell',exact:true})).toBeChecked();await expect(page.getByRole('button',{name:'Review selection'})).toBeDisabled();
  await page.getByRole('button',{name:'Retry results'}).click();await expect(page.getByRole('checkbox',{name:'Select Tabs',exact:true})).toBeVisible();await expect(page.locator('.reference-selection')).toContainText('0 selected');
  await page.getByRole('checkbox',{name:'Select Tabs',exact:true}).check();await page.getByRole('button',{name:'Refresh results'}).click();await expect(page.getByRole('checkbox',{name:'Select Tabs',exact:true})).toBeEnabled();await expect(page.getByRole('checkbox',{name:'Select Tabs',exact:true})).toBeChecked();
  await page.getByRole('searchbox',{name:'Search the component catalogue'}).fill('no such component');await page.getByRole('button',{name:'Apply query'}).click();await expect(page.getByRole('heading',{name:'No matching components'})).toBeVisible();
  await page.getByRole('button',{name:'Clear query',exact:true}).click();await expect(page.getByRole('checkbox',{name:'Select AppShell',exact:true})).toBeVisible();
  await page.getByRole('checkbox',{name:'Use an empty source catalogue on the next query'}).check();await page.getByRole('button',{name:'Apply query'}).click();await expect(page.getByRole('heading',{name:'The source catalogue is empty'})).toBeVisible();
  await page.getByRole('button',{name:'Restore example catalogue'}).click();await expect(page.getByRole('checkbox',{name:'Select AppShell',exact:true})).toBeVisible();
  await page.getByRole('checkbox',{name:'Select AppShell',exact:true}).check();await page.getByRole('button',{name:'Next page',exact:true}).click();await expect(page.locator('.reference-selection')).toContainText('0 selected');await expect(page.getByRole('navigation',{name:'Pagination'})).toContainText('Page 2');
  await mkdir('test-results/reference-proof',{recursive:true});await page.setViewportSize({width:1440,height:1100});await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:`test-results/reference-proof/${family}-results.png`,fullPage:true});
 });
 test(`${family}: modal preparation failure, dismissal and late completion retain selection`,async({page})=>{
  await page.goto(`http://127.0.0.1:${family==='martlet'?4189:4188}/${family}/?page=patterns&pattern=results`);await page.getByRole('checkbox',{name:'Select AppShell',exact:true}).check();
  const trigger=page.getByRole('button',{name:'Review selection'});await trigger.click();const dialog=page.getByRole('dialog',{name:'Review selected components'});await expect(dialog).toBeVisible();
  await dialog.getByRole('checkbox',{name:'Fail the next preparation'}).check();await dialog.getByRole('button',{name:'Prepare comparison'}).click();await expect(dialog.getByRole('alert')).toContainText('selection is retained');
  await dialog.getByRole('button',{name:'Try preparation again'}).click();await expect(dialog.getByRole('button',{name:'Preparing…'})).toBeDisabled();await page.keyboard.press('Escape');await expect(dialog).not.toBeVisible();await expect(trigger).toBeFocused();await page.waitForTimeout(650);await expect(page.locator('.reference-selection')).not.toContainText('Prepared 1');await expect(page.getByRole('checkbox',{name:'Select AppShell',exact:true})).toBeChecked();
  await trigger.click();await dialog.getByRole('button',{name:'Prepare comparison'}).click();await expect(dialog).not.toBeVisible();await expect(trigger).toBeFocused();await expect(page.locator('.reference-selection')).toContainText('Prepared 1 component names');
 });
 for(const mode of ['light','dark'])for(const pattern of ['form','results','coverage']){
  test(`${family}: ${pattern} ${mode} reflows and passes automated accessibility`,async({page})=>{
   await page.setViewportSize({width:320,height:1000});await page.goto(`http://127.0.0.1:${family==='martlet'?4189:4188}/${family}/?page=patterns&pattern=${pattern}&mode=${mode}`);
   await expect(page.locator('main h1')).toHaveCount(1);
   if(pattern==='coverage')await expect(page.locator('main tbody tr')).toHaveCount(18);
   const fits=()=>page.evaluate(()=>({fits:document.documentElement.scrollWidth<=innerWidth,width:innerWidth,scroll:document.documentElement.scrollWidth,scrollX,internal:[...document.querySelectorAll('body *')].filter(e=>e.scrollWidth>e.clientWidth+1&&getComputedStyle(e).overflowX==='visible').slice(-15).map(e=>({tag:e.tagName,class:e.className,client:e.clientWidth,scroll:e.scrollWidth,text:e.textContent?.slice(0,45)})),overflow:[...document.querySelectorAll('body *')].filter(e=>e.getBoundingClientRect().right>innerWidth+1&&!e.closest('[role=region][tabindex]')).slice(0,8).map(e=>({tag:e.tagName,class:e.className,text:e.textContent?.slice(0,60),width:e.getBoundingClientRect().width}))}));
   {const report=await fits();expect(report.fits,JSON.stringify(report)).toBe(true);}
   const axe=await new AxeBuilder({page}).include('main').analyze();expect(axe.violations).toEqual([]);
   await page.addStyleTag({content:'html {font-size:200% !important}'});{const report=await fits();expect(report.fits,JSON.stringify(report)).toBe(true);}
   await page.setViewportSize({width:1280,height:1000});await page.addStyleTag({content:'html {font-size:400% !important}'});{const report=await fits();expect(report.fits,JSON.stringify(report)).toBe(true);}
  });
 }
}

for(const family of ['martlet','krigsvold'])test(`${family}: hosted onboarding exposes the selected endpoint and optional skill`,async({page})=>{
 await page.setViewportSize({width:320,height:1000});
 await page.goto(`http://127.0.0.1:${family==='martlet'?4189:4188}/${family}/?page=agents`);
 await expect(page.locator('main h1')).toHaveCount(1);
 await expect(page.getByRole('textbox',{name:'Copyable example source'}).first()).toHaveValue(`https://${family}design.dev/mcp`);
 await expect(page.getByRole('link',{name:new RegExp('Download .* builder skill$')})).toHaveAttribute('href',`agents/${family}-builder.zip`);
 await expect(page.getByRole('heading',{name:'ChatGPT',exact:true})).toBeVisible();
 await expect(page.getByRole('heading',{name:'Claude',exact:true})).toBeVisible();
 await page.evaluate(()=>document.documentElement.style.fontSize='200%');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});


for(const mode of ['light','dark'])test(`martlet: origin scroll transition and open menu in ${mode} mode`,async({page})=>{
 await page.setViewportSize({width:1440,height:1000});
 await page.goto(`http://127.0.0.1:4189/martlet/?mode=${mode}`);
 const header=page.locator('.martlet-app-header');
 const solid=mode==='light'?'rgb(7, 17, 31)':'rgb(255, 255, 255)';
 const hero=page.locator('.martlet-reference-intro');await expect(hero).toBeVisible();expect((await hero.boundingBox())!.y).toBe(0);
 expect(await hero.evaluate(e=>getComputedStyle(e).backgroundColor)).toBe(mode==='light'?'rgb(11, 28, 51)':'rgb(248, 244, 233)');
 const bg=()=>header.evaluate(e=>getComputedStyle(e).backgroundColor);
 await expect.poll(bg).toBe('rgba(0, 0, 0, 0)');
 await page.evaluate(()=>window.scrollTo({top:200,behavior:'instant'}));
 await expect.poll(bg).toBe('rgba(0, 0, 0, 0)');
 await page.evaluate(()=>window.scrollTo({top:300,behavior:'instant'}));
 await expect.poll(bg).toBe(solid);
 expect(await header.getByRole('link',{name:'The language',exact:true}).evaluate(e=>getComputedStyle(e).color)).toBe(mode==='light'?'rgb(255, 255, 255)':'rgb(11, 28, 51)');
 await mkdir('test-results/reference-proof',{recursive:true});await page.screenshot({path:`test-results/reference-proof/martlet-navigation-${mode}.png`});
 await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));await expect.poll(bg).toBe('rgba(0, 0, 0, 0)');
 await page.setViewportSize({width:320,height:1000});
 await header.getByRole('button',{name:'Menu',exact:true}).click();await expect.poll(bg).toBe(solid);
 await page.keyboard.press('Escape');await expect(header.getByRole('button',{name:'Menu',exact:true})).toBeFocused();await expect.poll(bg).toBe('rgba(0, 0, 0, 0)');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
for(const mode of ['light','dark'])test(`krigsvold: inverse floating menu overlays the full-height hero in ${mode} mode`,async({page})=>{
 await page.setViewportSize({width:1440,height:1000});
 await page.goto(`http://127.0.0.1:4188/krigsvold/?mode=${mode}`);
 const header=page.locator('.krigsvold-app-header'),hero=page.locator('.krigsvold-reference-cover');
 await expect(hero).toBeVisible();
 const state=await header.evaluate(e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return {background:s.backgroundColor,color:getComputedStyle(e.querySelector('.krigsvold-reference-brand')!).color,left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:document.documentElement.clientWidth,radius:s.borderRadius,position:s.position};});
 expect(state.background).toBe(mode==='light'?'rgba(6, 19, 37, 0.84)':'rgb(255, 255, 255)');
 expect(state.color).toBe(mode==='light'?'rgb(255, 255, 255)':'rgb(23, 32, 42)');
 expect(state.position).toBe('absolute');expect(state.left).toBeGreaterThan(0);expect(state.right).toBeLessThan(state.width);expect(state.radius).not.toBe('0px');
 const hr=(await hero.boundingBox())!;expect(hr.y).toBe(0);expect(state.top).toBeGreaterThan(hr.y);expect(state.bottom).toBeLessThan(hr.y+hr.height);
 await header.locator('summary').first().click();
 expect(await header.locator('.krigsvold-reference-menu').first().evaluate(e=>getComputedStyle(e).backgroundColor)).toBe('rgb(255, 255, 255)');
 const axe=await new AxeBuilder({page}).include('.krigsvold-app-header').analyze();expect(axe.violations).toEqual([]);await page.keyboard.press('Escape');
 await mkdir('test-results/reference-proof',{recursive:true});await page.screenshot({path:`test-results/reference-proof/krigsvold-navigation-${mode}.png`});
 await page.setViewportSize({width:320,height:1000});await header.getByRole('button',{name:'Menu',exact:true}).click();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.keyboard.press('Escape');await expect(header.getByRole('button',{name:'Menu',exact:true})).toBeFocused();
});
