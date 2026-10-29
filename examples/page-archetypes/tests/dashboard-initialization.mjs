// Exercise dashboard initialization failures in isolated builds without modifying source fixtures.
import assert from 'node:assert/strict';
import {cpSync, mkdtempSync, readFileSync, writeFileSync, mkdirSync, symlinkSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {resolve, join, basename, extname} from 'node:path';
import {spawnSync} from 'node:child_process';
import {createServer} from 'node:http';
import {chromium} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {Validator} from '@cfworker/json-schema';
const root=process.cwd(),temp=mkdtempSync(join(tmpdir(),'nightjar-dashboard-init-'));
const skip=new Set(['node_modules','dist','_site','.astro','.jekyll-cache','test-results']);
function run(command,args,cwd,extra={}){
 const child=spawnSync(command,args,{cwd,env:{...process.env,...extra},encoding:'utf8'});
 assert.equal(child.status,0,`${command} ${args.join(' ')} failed: ${child.stderr}\n${child.stdout}`);
}
let browser;
try {
 cpSync(join(root,'examples'),join(temp,'examples'),{recursive:true,filter:path=>!skip.has(basename(path))&&!basename(path).endsWith('-dist')});
 cpSync(join(root,'packages'),join(temp,'packages'),{recursive:true,filter:path=>!skip.has(basename(path))});
 cpSync(join(root,'package.json'),join(temp,'package.json'));
 symlinkSync(resolve(root,'node_modules'),join(temp,'node_modules'),'dir');
 symlinkSync(resolve(root,'examples/astro-slice/node_modules'),join(temp,'examples/astro-slice/node_modules'),'dir');
 browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{})});
 for(const family of ['martlet','krigsvold']) for(const framework of ['jekyll','astro','react'].filter(value=>!process.env.NIGHTJAR_TEST_FRAMEWORK||value===process.env.NIGHTJAR_TEST_FRAMEWORK)) for(const base of ['/','/preview/']) {
  const site=join(temp,'examples/jekyll',family),dist=join(temp,'precision-dist',framework,family);
  if(framework==='jekyll') run('bundle',['exec','jekyll','build','--baseurl',base==='/'?'':'/preview','--destination',dist],site);
  if(framework==='astro') run('npm',['run','build'],join(temp,'examples/astro-slice'),{NIGHTJAR_FAMILY:family,NIGHTJAR_BASE:base,ASTRO_TELEMETRY_DISABLED:'1'});
  if(framework==='react') run(process.execPath,['examples/react-catalog/build.mjs'],temp,{NIGHTJAR_FAMILY:family,NIGHTJAR_BASE:base});
  const built=framework==='jekyll'?dist:join(temp,'examples',framework==='astro'?'astro-slice':'react-catalog','dist',family);
  const server=createServer((req,res)=>{const path=new URL(req.url,'http://localhost').pathname;if(!path.startsWith(base)){res.writeHead(404).end();return;}const file=resolve(built,decodeURIComponent(path.slice(base.length)),path.endsWith('/')?'index.html':'');if(!file.startsWith(built+'/')){res.writeHead(403).end();return;}try{const data=readFileSync(file);const types={'.html':'text/html','.css':'text/css','.js':'text/javascript','.mjs':'text/javascript','.svg':'image/svg+xml','.woff2':'font/woff2','.woff':'font/woff'};res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream'}).end(data);}catch{res.writeHead(404).end();}});
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  try {for(const route of ['administration','analytics','operations'].filter(value=>!process.env.NIGHTJAR_TEST_ROUTE||value===process.env.NIGHTJAR_TEST_ROUTE)) for(const mode of ['normal','nojs','blocked',...(framework==='react'?(route==='administration'?['history']:[]):['partial','history'])]){
   const context=await browser.newContext({javaScriptEnabled:mode!=='nojs',viewport:{width:320,height:900}}),page=await context.newPage(),errors=[];
   page.on('pageerror',error=>errors.push(error.message));
   if(mode==='blocked')await page.route('**/*',route=>route.request().resourceType()==='script'||/\.(?:m?js)(?:\?|$)/.test(route.request().url())?route.abort():route.continue());
   if(mode==='partial')await page.addInitScript(({framework,route})=>{if(sessionStorage.getItem('nightjar-dashboard-failure'))return;sessionStorage.setItem('nightjar-dashboard-failure','1');const nativeQuery=Element.prototype.querySelector;Element.prototype.querySelector=function(selector){if(selector==='.dash-nav-toggle'&&!(framework==='astro'&&route==='analytics'))throw Error('synthetic dashboard initialization failure');return nativeQuery.call(this,selector)};const nativeListen=EventTarget.prototype.addEventListener;EventTarget.prototype.addEventListener=function(type,listener,options){if(framework==='astro'&&route==='analytics'&&this instanceof HTMLSelectElement&&this.name==='range'&&type==='change')throw Error('synthetic dashboard initialization failure');return nativeListen.call(this,type,listener,options)};},{framework,route});
   if(mode==='history')await page.addInitScript(()=>{if(sessionStorage.getItem('nightjar-dashboard-history'))return;sessionStorage.setItem('nightjar-dashboard-history','1');history.replaceState=()=>{window.__nightjarHistoryFailures=(window.__nightjarHistoryFailures||0)+1;throw Error('synthetic dashboard history failure')}});
   const requests=[];page.on('request',request=>{if(request.isNavigationRequest())requests.push(request.url())});
   await page.goto(`http://127.0.0.1:${server.address().port}${base}examples/dashboard-${route}/?keep=1`,{waitUntil:'networkidle'});
   if(mode==='partial'&&route==='administration'&&!(await page.getByLabel('Full name').isDisabled())){await page.getByLabel('Full name').fill('Synthetic Person');await page.getByLabel('Email address').fill('synthetic@example.test');const before=requests.length;await page.getByRole('button',{name:'Save person locally'}).click();await page.waitForTimeout(100);assert.equal(requests.length,before,'dashboard partial initialization must not cause a native form navigation');}
   const fields=page.locator('main form fieldset');assert.ok(await fields.count()>0,`${route}: form controls present`);
   if(mode==='normal'){assert.equal(await page.locator('[data-dashboard-fallback]').isHidden(),true,`${route}: successful initialization hides the fallback`);for(const fieldset of await fields.all())assert.equal(await fieldset.evaluate(node=>node.disabled),false,`${route}: initialized controls enabled`);
    if(route==='administration'){await page.getByLabel('Full name',{exact:true}).fill('Synthetic Tester');await page.getByLabel('Email address',{exact:true}).fill('tester@example.test');await page.getByRole('button',{name:'Save person locally'}).click();assert.match(await page.locator('body').innerText(),/Saved Synthetic Tester.*locally/);if(framework==='react'){await page.evaluate(()=>{history.replaceState=()=>{throw Error('synthetic later history failure')}});await page.getByLabel('Search people',{exact:true}).fill('Synthetic Tester');await page.getByRole('button',{name:'Apply directory filters'}).click();await page.waitForFunction(()=>document.querySelector('[data-dashboard-fallback]')?.hidden===false);assert.equal(await page.getByLabel('Full name',{exact:true}).isDisabled(),true,'later failure disables the editor');assert.match(await page.locator('main').innerText(),/Synthetic Tester/,'later failure retains the locally saved person');assert.deepEqual(errors,[],'later history failure is handled');}}
    if(route==='analytics'){await page.locator('main form').getByLabel('Category').selectOption('Research');await page.getByRole('button',{name:'Apply filters',exact:true}).click();const text=await page.locator('#analytics-source tbody').innerText();assert.match(text,/Research/);assert.doesNotMatch(text,/Workshops/);}
    if(route==='operations'){await page.locator('main form').getByLabel('Warning threshold (ms)').fill('300');await page.getByRole('button',{name:'Apply monitoring controls'}).click();assert.match(await page.locator('body').innerText(),/300 ms warning threshold/);}
   }
   else {assert.equal(await page.locator('[data-dashboard-fallback]').isVisible(),true,`${route}: failure explanation visible`);if(mode==='partial')assert.ok(errors.some(e=>e.includes('synthetic dashboard initialization failure')),`${route}: failure was injected`);if(mode==='history'){assert.ok(await page.evaluate(()=>window.__nightjarHistoryFailures>0),`${route}: history failure was injected`);if(framework==='react')assert.deepEqual(errors,[],`${route}: React handles history failure`);else assert.ok(errors.some(e=>e.includes('synthetic dashboard history failure')),`${route}: initialization failure observed`);}for(const fieldset of await fields.all())assert.equal(await fieldset.evaluate(node=>node.disabled),true,`${route}/${mode}: unavailable controls stay disabled`);assert.ok(await page.locator('main table').count()>0,`${route}: static tables remain available`);const before=requests.length;for(const button of await page.locator('main form button[type=submit]').all())await button.evaluate(node=>node.click());await page.waitForTimeout(50);assert.equal(requests.length,before,`${route}: disabled controls cannot navigate`);assert.equal(new URL(page.url()).searchParams.get('keep'),'1');if(mode==='partial'||mode==='history'){await page.reload({waitUntil:'networkidle'});for(const fieldset of await page.locator('main form fieldset').all())assert.equal(await fieldset.evaluate(node=>node.disabled),false,`${route}: reload restores controls`);assert.equal(await page.locator('[data-dashboard-fallback]').isHidden(),true);}}
   await context.close();
  }console.log(`${family} ${framework} ${base}: dashboard initialization and static fallback`);
  }finally{server.closeAllConnections();await new Promise(r=>server.close(r));}
 }
} finally {if(browser)await browser.close();rmSync(temp,{recursive:true,force:true});}
