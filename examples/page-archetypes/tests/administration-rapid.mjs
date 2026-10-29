// Builds isolated copies to exercise repeated same-task directory submissions.
import assert from 'node:assert/strict';
import {cpSync, mkdtempSync, readFileSync, writeFileSync, mkdirSync, symlinkSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {resolve, join, basename, extname} from 'node:path';
import {spawnSync} from 'node:child_process';
import {createServer} from 'node:http';
import {chromium} from '@playwright/test';
import {Validator} from '@cfworker/json-schema';
const root=process.cwd(),temp=mkdtempSync(join(tmpdir(),'nightjar-empty-'));
const original=JSON.parse(readFileSync('examples/page-archetypes/content/dashboards.json','utf8'));
const fixture=structuredClone(original);fixture.people=fixture.people.slice(0,2);
const schema=JSON.parse(readFileSync('examples/page-archetypes/contracts/dashboards.schema.json','utf8'));
assert.ok(new Validator(schema,'2020-12',true).validate(fixture).valid,'Invalid operations fixture remains schema-valid');
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
 for(const path of ['examples/page-archetypes/content/dashboards.json','examples/jekyll/martlet/_data/dashboards.json','examples/jekyll/krigsvold/_data/dashboards.json']) writeFileSync(join(temp,path),JSON.stringify(fixture));
 browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{})});
 for(const family of ['martlet','krigsvold']) for(const framework of ['jekyll','astro','react']) for(const base of ['/','/preview/']) {
  const site=join(temp,'examples/jekyll',family),dist=join(temp,'empty-dist',framework,family);
  if(framework==='jekyll') run('bundle',['exec','jekyll','build','--baseurl',base==='/'?'':'/preview','--destination',dist],site);
  if(framework==='astro') run('npm',['run','build'],join(temp,'examples/astro-slice'),{NIGHTJAR_FAMILY:family,NIGHTJAR_BASE:base,ASTRO_TELEMETRY_DISABLED:'1'});
  if(framework==='react') run(process.execPath,['examples/react-catalog/build.mjs'],temp,{NIGHTJAR_FAMILY:family,NIGHTJAR_BASE:base});
  const built=framework==='jekyll'?dist:join(temp,'examples',framework==='astro'?'astro-slice':'react-catalog','dist',family);
  const server=createServer((req,res)=>{const path=new URL(req.url,'http://localhost').pathname;if(!path.startsWith(base)){res.writeHead(404).end();return;}const file=resolve(built,decodeURIComponent(path.slice(base.length)),path.endsWith('/')?'index.html':'');if(!file.startsWith(built+'/')){res.writeHead(403).end();return;}try{const data=readFileSync(file);const types={'.html':'text/html','.css':'text/css','.js':'text/javascript','.mjs':'text/javascript','.svg':'image/svg+xml','.woff2':'font/woff2','.woff':'font/woff'};res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream'}).end(data);}catch{res.writeHead(404).end();}});
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  try {for(const javascriptEnabled of [true,false]){
   const context=await browser.newContext({javaScriptEnabled:javascriptEnabled,viewport:{width:320,height:900}}),page=await context.newPage(),errors=[];
   page.on('pageerror',error=>errors.push(error.message));
   await page.goto(`http://127.0.0.1:${server.address().port}${base}examples/dashboard-administration/`,{waitUntil:'networkidle'});
   if(javascriptEnabled){
    await page.getByLabel('Full name').fill('New Example');await page.getByLabel('Email address').fill('new@example.invalid');
    await page.getByLabel('Email address').evaluate(input=>{const form=input.form;form.requestSubmit();form.requestSubmit();});
    assert.ok(await page.locator('#person-errors').isHidden(),'repeated submission does not raise an error after saving');const directory=page.locator('#people-table tbody');assert.equal(await directory.locator('tr').count(),3,'two simultaneous submissions create one record');assert.equal(await directory.locator('tr').filter({hasText:'New Example'}).count(),1);
    await page.getByRole('button',{name:'Edit New Example'}).click();await page.getByLabel('Full name').fill('Renamed Example');await page.getByRole('button',{name:'Save person locally'}).click();assert.equal(await directory.locator('tr').filter({hasText:'Renamed Example'}).count(),1,'editing affects the one newly created record');await page.getByRole('checkbox',{name:'Select Renamed Example'}).check();await page.getByRole('button',{name:'Suspend selected'}).click();await page.getByRole('dialog').getByRole('button',{name:'Confirm change'}).click();assert.match(await directory.locator('tr').filter({hasText:'Renamed Example'}).innerText(),/Suspended/);await page.getByLabel('Full name').fill('Other Example');await page.getByLabel('Email address').fill('other@example.invalid');await page.getByRole('button',{name:'Save person locally'}).click();assert.equal(await directory.locator('tr').filter({hasText:'Other Example'}).count(),1);assert.match(await directory.locator('tr').filter({hasText:'Renamed Example'}).innerText(),/Suspended/,'saving after a bulk change preserves its status');await page.reload({waitUntil:'networkidle'});await page.getByLabel('Full name').fill('Click Example');await page.getByLabel('Email address').fill('click@example.invalid');await page.getByRole('button',{name:'Save person locally'}).click();await page.getByRole('button',{name:'Save person locally'}).click();assert.equal(await directory.locator('tr').filter({hasText:'Click Example'}).count(),1,'separate clicks do not duplicate a record');
   }else assert.ok(await page.getByRole('button',{name:'Save person locally'}).isDisabled());
   assert.deepEqual(errors,[]);await context.close();
  }console.log(`${family} ${framework} ${base}: rapid saves create one independently editable person`);

  }finally{server.closeAllConnections();await new Promise(r=>server.close(r));}
 }
} finally {if(browser)await browser.close();rmSync(temp,{recursive:true,force:true});}
