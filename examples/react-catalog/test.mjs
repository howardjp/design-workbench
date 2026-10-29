import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {createServer} from 'node:http';
import {readFile,readdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {chromium} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import catalog from '../page-archetypes/content/catalog.json' with {type:'json'};
import selected from './src/selected.json' with {type:'json'};
import {renderMarkdown} from '../page-archetypes/lib/markdown.mjs';
assert.ok(!renderMarkdown('<script>alert(1)</script> [bad](javascript:alert(1))').includes('<script>'));
assert.ok(!renderMarkdown('[bad](javascript:alert(1))').includes('href="javascript:'));
assert.match(renderMarkdown('[home](/examples/home/)', '/preview/'), /href="\/preview\/examples\/home\/"/);
const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{})});
try {
 for(const family of ['martlet','krigsvold'])for(const base of ['/','/preview/']){
  const built=spawnSync(process.execPath,['examples/react-catalog/build.mjs'],{env:{...process.env,NIGHTJAR_FAMILY:family,NIGHTJAR_BASE:base},encoding:'utf8'});
  if(built.status!==0)throw Error(built.stdout+built.stderr);
  const dir=resolve('examples/react-catalog/dist',family), routeDir=resolve(dir,'examples');
  const ids=await readdir(routeDir);assert.equal(ids.length,selected.length);
  const records=catalog.pages.filter(page=>ids.includes(page.id));assert.equal(records.length,selected.length);
  const assets=resolve(dir,'assets'),files=await readdir(assets);
  const css=(await Promise.all(files.filter(name=>name.endsWith('.css')).map(name=>readFile(resolve(assets,name),'utf8')))).join('\n');
  assert.match(css,new RegExp(family));assert.doesNotMatch(css,new RegExp(family==='martlet'?'krigsvold':'martlet'));
  const server=createServer(async(req,res)=>{
   const path=new URL(req.url,'http://localhost').pathname;
   if(!path.startsWith(base)){res.writeHead(404).end();return}
   const name=decodeURIComponent(path.slice(base.length));const file=resolve(dir,name.endsWith('/')?name+'index.html':name);
   if(!file.startsWith(dir+'/')){res.writeHead(403).end();return}
   try{const data=await readFile(file);const type={'.html':'text/html','.css':'text/css','.js':'text/javascript','.woff':'font/woff','.woff2':'font/woff2','.svg':'image/svg+xml'};res.writeHead(200,{'Content-Type':type[extname(file)]||'application/octet-stream'}).end(data);}catch{res.writeHead(404).end()}
  });
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  try{
   const origin=`http://127.0.0.1:${server.address().port}`;
   for(const record of records){
    const context=await browser.newContext({viewport:{width:320,height:800}}),page=await context.newPage(),errors=[];
    page.on('pageerror',error=>errors.push(error.message));page.on('console',message=>{if(message.type()==='error')errors.push(message.text())});page.on('response',response=>{if(response.status()>=400)errors.push(response.url())});
    await page.goto(`${origin}${base}examples/${record.id}/`,{waitUntil:'load'});
    assert.equal(await page.locator('h1').innerText(),record.title);assert.equal(await page.locator('main').count(),1);
    for(const section of record.sections){
     const region=page.locator(`section[data-section="${section.id}"]`);assert.equal(await region.locator('h2').innerText(),section.title);
     if(section.body && !/[*_`\[\]<>\n]/.test(section.body)) assert.equal(await region.locator('.recipe-prose').innerText(),section.body);
     if(section.kind==='table'){assert.equal(await region.locator('thead th').count(),section.headers.length);assert.equal(await region.locator('tbody tr').count(),section.rows.length);assert.equal(await region.locator('tbody tr').first().innerText(),section.rows[0].join('\t'));}
     if(section.kind==='figure'){const img=region.locator('img');assert.equal(await img.getAttribute('alt'),section.alt);assert.equal(await region.locator('figcaption').innerText(),section.caption);const src=await img.getAttribute('src');assert.ok(src.startsWith(base));assert.equal((await page.request.get(origin+src)).status(),200);}
     for(const link of [...(section.actions||[]),...(section.items||[]).map(i=>({label:i.title,url:i.url}))]){
      assert.equal(await region.getByRole('link',{name:link.label,exact:true,includeHidden:true}).getAttribute('href'),base.replace(/\/$/,'')+link.url);
     }
    }
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    assert.deepEqual(errors,[]);
    if(record.id==='guide') assert.equal(await page.locator('#arrival + .recipe-prose ol > li').count(),4);
    if(record.id==='opportunity') assert.equal(await page.locator('#requirements + .recipe-prose ul > li').count(),3);
    if(record.id==='reference'){assert.equal(await page.locator('#example + .recipe-prose pre').getAttribute('tabindex'),'0');assert.ok((await page.locator('#example + .recipe-prose code').innerText()).includes('north-001'));}
    if(record.id==='changelog') assert.equal(await page.locator('#v1-2 + .recipe-prose h3').count(),2);
    if(record.semantic_class==='article'){assert.equal(await page.locator('#return + .recipe-prose p').count(),2);assert.equal(await page.locator('article time').getAttribute('datetime'),record.date);assert.ok((await page.locator('article header').innerText()).includes(record.author));assert.equal(await page.locator('[aria-label="Article subjects"] li').count(),record.tags.length);}
    if(record.semantic_class==='event'){const context=page.locator('[aria-label="Event details"]');assert.equal(await context.locator('time').first().getAttribute('datetime'),record.event.start);assert.ok((await context.innerText()).includes(record.event.timezone));assert.ok((await context.innerText()).includes(record.event.location));}
    if(['home','archive','case-study','article','event','reference','place'].includes(record.id)) {
     assert.deepEqual((await new AxeBuilder({page}).analyze()).violations.map(x=>x.id),[],`${family} ${base} ${record.id}`);
     await page.setViewportSize({width:1440,height:900});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    }
    await context.close();
   }
   const context=await browser.newContext(),page=await context.newPage();
   await page.goto(`${origin}${base}examples/archive/`);const listing=page.locator('.recipe-listing li');
   assert.equal(await listing.count(),6);assert.equal(await listing.filter({visible:true}).count(),3);
   const initial=await listing.filter({visible:true}).first().innerText();
   await page.getByRole('button',{name:'Next page'}).focus();await page.keyboard.press('Enter');assert.equal(await page.getByRole('button',{name:'Previous page'}).evaluate(el=>document.activeElement===el),true);assert.equal(await listing.filter({visible:true}).count(),3);assert.notEqual(await listing.filter({visible:true}).first().innerText(),initial);
   await page.keyboard.press('Enter');assert.equal(await page.getByRole('button',{name:'Next page'}).evaluate(el=>document.activeElement===el),true);assert.equal(await listing.filter({visible:true}).first().innerText(),initial);
   await page.reload();assert.equal(await page.locator('h1').innerText(),records.find(x=>x.id==='archive').title);await page.emulateMedia({media:'print'});assert.equal(await listing.filter({visible:true}).count(),6);assert.equal(await page.getByRole('navigation',{name:'Latest writing pages'}).isVisible(),false);await context.close();
   const nojs=await browser.newContext({javaScriptEnabled:false}),nojsPage=await nojs.newPage();
   await nojsPage.goto(`${origin}${base}examples/archive/`);assert.equal(await nojsPage.locator('.recipe-listing li:visible').count(),6);await nojs.close();
   console.log(`${family} ${base}: ${records.length} direct routes, content, isolation, responsive, axe, pagination, and no-JS passed`);
  } finally{server.closeAllConnections();await new Promise(r=>server.close(r))}
 }
}finally{await browser.close()}
