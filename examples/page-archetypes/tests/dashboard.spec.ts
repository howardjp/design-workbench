import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const route=(family:string,view:string)=>`/${family}/examples/dashboard-${view}/`;
for(const family of ['martlet','krigsvold']){
 test(`${family}: analytics scope, exact data alternatives, invalid-range recovery`,async({page})=>{
  await page.goto(route(family,'analytics'));
  await expect(page.locator('[data-metric=sessions]')).toHaveText('7,686');
  await expect(page.getByLabel('Category',{exact:true})).toHaveCSS('font-family',family==='martlet'?/Lato/:/Roboto/);
  await page.getByLabel('Date range',{exact:true}).selectOption('14');await page.getByLabel('Category',{exact:true}).selectOption('Research');await page.getByRole('button',{name:'Apply filters',exact:true}).click();
  await expect(page.locator('[data-metric=sessions]')).toHaveText('4,459');await expect(page.locator('#analytics-source tbody tr')).toHaveCount(14);
  await page.getByText('View session trend data',{exact:true}).click();await expect(page.locator('[data-chart-table=sessions] tbody tr')).toHaveCount(14);
  const download=page.waitForEvent('download');await page.getByRole('button',{name:'Download filtered CSV',exact:true}).click();expect((await download).suggestedFilename()).toBe('northlight-analytics.csv');
  await page.getByLabel('Start date',{exact:true}).fill('2026-10-28');await page.getByLabel('End date',{exact:true}).fill('2026-10-22');await page.getByRole('button',{name:'Apply filters',exact:true}).click();
  await expect(page.locator('#analytics-error')).toBeVisible();await expect(page.locator('[data-metric=sessions]')).toHaveText('4,459');await expect(page.getByRole('button',{name:'Download filtered CSV'})).toBeDisabled();
 });
 test(`${family}: administration selection scope, confirmation, sorting and recovery`,async({page})=>{
  await page.goto(route(family,'administration'));
  await expect(page.locator('#people-table tbody tr')).toHaveCount(5);
  const originalPage=await page.locator('#people-table tbody').innerText();
  await page.getByLabel('Select visible people',{exact:true}).check();await page.getByRole('button',{name:'Next page',exact:true}).click();
  await expect(page.locator('[data-selection-count]')).toContainText('5 people selected');await page.getByRole('button',{name:'Suspend selected',exact:true}).click();await expect(page.getByRole('dialog')).toContainText('5 selected people');await page.getByRole('button',{name:'Cancel',exact:true}).click();await expect(page.getByRole('dialog')).not.toBeVisible();await page.getByRole('button',{name:'Previous page',exact:true}).click();expect(await page.locator('#people-table tbody').innerText()).toBe(originalPage);
  await page.getByLabel('Search people',{exact:true}).fill('Mara Ellis');await page.getByRole('button',{name:'Apply directory filters'}).click();await expect(page.locator('[data-selection-count]')).toContainText('0 people selected');await expect(page.locator('#people-table tbody tr')).toHaveCount(1);
  await page.getByLabel('Select visible people',{exact:true}).check();await page.getByRole('button',{name:'Suspend selected'}).click();await page.getByRole('button',{name:'Confirm change'}).click();await expect(page.locator('#people-table tbody')).toContainText('Suspended');
  await page.getByRole('button',{name:'Edit Mara Ellis',exact:true}).click();await page.getByLabel('Full name',{exact:true}).fill('');await page.getByRole('button',{name:'Save person locally'}).click();await expect(page.locator('#person-errors')).toBeVisible();await expect(page.getByLabel('Email address',{exact:true})).toHaveValue('mara.ellis@example.invalid');
  await page.getByLabel('Full name',{exact:true}).fill('<img src=x onerror=alert(1)>');await page.getByRole('button',{name:'Save person locally'}).click();await page.getByRole('button',{name:'Clear filters',exact:true}).click();await expect(page.locator('#people-table tbody img')).toHaveCount(0);
  await page.getByRole('button',{name:'Name',exact:true}).click();await expect(page.locator('[data-sort=name]').locator('..')).toHaveAttribute('aria-sort','descending');
  await page.getByLabel('State preview',{exact:true}).selectOption('loading');await expect(page.locator('[data-directory-state]')).toContainText('Loading state preview');await page.getByLabel('State preview',{exact:true}).selectOption('error');await page.getByRole('button',{name:'Retry directory'}).click();await expect(page.locator('[data-directory-region]')).toBeVisible();
  await page.getByLabel('Search people',{exact:true}).fill('nonexistent-record');await page.getByRole('button',{name:'Apply directory filters'}).click();await expect(page.locator('[data-directory-state]')).toContainText('No people match');
 });
 test(`${family}: malformed page in a shared directory URL recovers to the first page`,async({page})=>{
  await page.goto(route(family,'administration')+'?page=1.5');
  await expect(page.locator('[data-people-page]')).toHaveText('Page 1 of 5');
  await expect(page.locator('#people-table tbody tr')).toHaveCount(5);
  await expect(page.getByRole('button',{name:'Previous page',exact:true})).toBeDisabled();
 });
 test(`${family}: operations controls, thresholds and acknowledgement`,async({page})=>{
  await page.goto(route(family,'operations'));
  await expect(page.locator('[data-metric=warnings]')).toHaveText('1');
  await page.getByLabel('Warning threshold (ms)',{exact:true}).fill('50');await page.getByRole('button',{name:'Apply monitoring controls'}).click();await expect(page.locator('[data-metric=warnings]')).toHaveText('5');
  await page.getByLabel('Service',{exact:true}).selectOption('SVC-04');await page.getByLabel('Alert severity',{exact:true}).selectOption('Critical');await page.getByRole('button',{name:'Apply monitoring controls'}).click();await expect(page.locator('#service-table tbody tr')).toHaveCount(1);await expect(page.locator('#alert-table tbody tr')).toHaveCount(1);
  await page.getByRole('button',{name:'Acknowledge AL-001',exact:true}).click();await expect(page.locator('[data-metric=open_alerts]')).toHaveText('0');await expect(page.locator('[data-activity]')).toContainText('Acknowledged AL-001 locally');
  await page.getByLabel('Hide acknowledged alerts',{exact:true}).check();await page.getByRole('button',{name:'Apply monitoring controls'}).click();await expect(page.locator('#alert-table tbody tr')).toHaveCount(0);
  await page.getByLabel('Warning threshold (ms)',{exact:true}).fill('1');await page.getByRole('button',{name:'Apply monitoring controls'}).click();await expect(page.locator('#operations-error')).toBeVisible();await page.getByRole('button',{name:'Reset operations preview'}).click();await expect(page.locator('[data-metric=open_alerts]')).toHaveText('2');
 });
 for(const width of [320,768,1100,1440])for(const view of ['analytics','administration','operations']){
  test(`${family}: ${view} at ${width}px`,async({page})=>{
   await page.setViewportSize({width,height:1000});await page.goto(route(family,view));await expect(page.locator('[data-dashboard]')).toHaveAttribute('data-ready','true');
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
   if(width<=1024){const toggle=page.getByRole('button',{name:'Dashboard navigation',exact:true});await toggle.click();await expect(page.getByRole('navigation',{name:'Dashboard navigation',exact:true})).toBeVisible();await toggle.press('Escape');await expect(toggle).toHaveAttribute('aria-expanded','false');}
   if(width===320||width===1440)await page.screenshot({path:`test-results/dashboards/${family}-${view}-${width}.png`,fullPage:true});
  });
 }
 for(const mode of ['light','dark'])for(const view of ['analytics','administration','operations']){
  test(`${family}: ${view} ${mode} accessibility`,async({page})=>{
   await page.goto(route(family,view));if(mode==='dark')await page.locator('[data-appearance-toggle]').click();
   const results=await new AxeBuilder({page}).include('.dash-app').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();expect(results.violations).toEqual([]);
  });
 }
}
test('paired initial and filtered views have identical functional results',async({page})=>{
 const read=async(family:string)=>{await page.goto(route(family,'analytics')+'?start=2026-10-15&end=2026-10-28&category=Research');await expect(page.locator('[data-metric=sessions]')).toHaveText('4,459');return page.locator('[data-metric]').allTextContents();};
 expect(await read('martlet')).toEqual(await read('krigsvold'));
 for(const view of ['administration','operations']){await page.goto(route('martlet',view));const first=await page.locator(view==='administration'?'#people-table tbody':'#service-table tbody').textContent();await page.goto(route('krigsvold',view));expect(await page.locator(view==='administration'?'#people-table tbody':'#service-table tbody').textContent()).toEqual(first);}
});

for(const family of ['martlet','krigsvold'])test(`${family}: publishing primitives remain native`,async({page})=>{
 await page.goto(`/${family}/examples/article/`);
 const action=page.getByRole('link',{name:'Read the survey method',exact:true});
 await expect(action).toHaveClass(family==='martlet'?/\bbutton\b/:/\bbtn\b/);
 await expect(action).toHaveCSS('text-decoration-line','none');
 if(family==='martlet'){await expect(page.locator('.post-tags .pill-list a')).toHaveCount(2);expect(await page.locator('.post-tags').evaluate(node=>!node.closest('.page-intro'))).toBe(true);}
});
