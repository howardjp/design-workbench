import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {chromium} from '@playwright/test';
const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{})});
try { for(const family of ['martlet','krigsvold']) for(const base of ['/','/preview/']) {
 const build=spawnSync('npm',['run','build'],{env:{...process.env,NIGHTJAR_FAMILY:family,NIGHTJAR_BASE:base,ASTRO_TELEMETRY_DISABLED:'1'},encoding:'utf8'});assert.equal(build.status,0,build.stderr);
 const dir=resolve('dist',family),server=createServer(async(req,res)=>{const path=new URL(req.url,'http://localhost').pathname;if(!path.startsWith(base))return res.writeHead(404).end();const rel=decodeURIComponent(path.slice(base.length)),file=resolve(dir,rel.endsWith('/')?rel+'index.html':rel);if(!file.startsWith(dir+'/'))return res.writeHead(403).end();try{const data=await readFile(file);res.writeHead(200,{'Content-Type':({'.html':'text/html','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.woff2':'font/woff2'})[extname(file)]||'application/octet-stream'}).end(data)}catch{res.writeHead(404).end()}});await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin=`http://127.0.0.1:${server.address().port}`;
 try { const page=await browser.newPage({viewport:{width:1440,height:900}});await page.goto(`${origin}${base}examples/dashboard-analytics/`);await page.waitForFunction(()=>document.querySelector('[data-metric=sessions]')?.textContent==='7,686');assert.equal(await page.locator('.nightjar-header').isVisible(),true);assert.equal(await page.locator('#analytics-filters').isVisible(),true);await page.emulateMedia({media:'print'});
  for(const selector of ['.nightjar-header','.nightjar-footer','.analytics-app aside','#analytics-filters'])assert.equal(await page.locator(selector).isVisible(),false,`${family} ${base} ${selector} should be hidden in print`);
  for(const selector of ['h1','[data-metric=sessions]','#analytics-source'])assert.equal(await page.locator(selector).isVisible(),true,`${family} ${base} ${selector} should remain in print`);
  assert.equal(await page.locator('[data-metric=sessions]').textContent(),'7,686');
  for (const [view,table] of [['administration','#people-table'],['operations','#service-table']]) {
    await page.goto(`${origin}${base}examples/dashboard-${view}/`);
    await page.waitForFunction(()=>document.querySelector('[data-dashboard]')?.dataset.ready==='true');
    for(const selector of ['.nightjar-header','.nightjar-footer','.dash-sidebar','.dash-toolbar'])assert.equal(await page.locator(selector).isVisible(),false,`${family} ${base} ${view} ${selector}`);
    assert.equal(await page.locator('h1').isVisible(),true);assert.equal(await page.locator(table).isVisible(),true);
  }
  await page.goto(`${origin}${base}examples/article/`);
  assert.equal(await page.locator('.nightjar-masthead h1').isVisible(),true);
  assert.equal(await page.locator('.nightjar-header').isVisible(),false);
  assert.equal(await page.locator('.nightjar-footer').isVisible(),false);
  await page.close();console.log(`${family} ${base}: screen, dashboard and article print visibility passed`);
 } finally {await new Promise(r=>server.close(r))}
 }} finally {await browser.close()}
