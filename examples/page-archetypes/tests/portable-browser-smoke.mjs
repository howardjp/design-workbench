// Bounded cross-engine checks against independently built portable examples.
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {extname,resolve} from 'node:path';
import {chromium,firefox,webkit,expect} from '@playwright/test';
import catalog from '../content/catalog.json' with {type:'json'};

const engine=process.env.NIGHTJAR_BROWSER || 'chromium';
const browsers={chromium,firefox,webkit};
if(!browsers[engine]) throw Error('NIGHTJAR_BROWSER must be chromium, firefox, or webkit');
const roots={jekyll:process.env.NIGHTJAR_JEKYLL_ROOT,astro:process.env.NIGHTJAR_ASTRO_ROOT||'examples/astro-slice/dist',react:process.env.NIGHTJAR_REACT_ROOT||'examples/react-catalog/dist'};
if(!roots.jekyll) throw Error('NIGHTJAR_JEKYLL_ROOT must contain the paired root-path Jekyll builds');
async function serve(root){
  const server=createServer(async(req,res)=>{
    const path=new URL(req.url,'http://localhost').pathname, name=decodeURIComponent(path.slice(1)),file=resolve(root,name.endsWith('/')?`${name}index.html`:name);
    if(!file.startsWith(root+'/')) return res.writeHead(403).end();
    try{const types={'.html':'text/html','.css':'text/css','.js':'text/javascript','.mjs':'text/javascript','.json':'application/json','.svg':'image/svg+xml','.woff':'font/woff','.woff2':'font/woff2'};const content=await readFile(file);res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream'}).end(content);}catch{res.writeHead(404).end()}
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));return server;
}
const browser=await browsers[engine].launch({headless:true,...(engine==='chromium'&&process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{})});
try{
 for(const family of ['martlet','krigsvold']) for(const framework of ['jekyll','astro','react']){
  const server=await serve(resolve(roots[framework],family));
  try{
   const context=await browser.newContext({viewport:{width:320,height:900}}),page=await context.newPage(),errors=[],missing=[];
   page.on('pageerror',error=>errors.push(error.message));
   const origin=`http://127.0.0.1:${server.address().port}`;
   page.on('response',response=>{if(response.url().startsWith(origin)&&response.status()>=400)missing.push(`${response.status()} ${response.url()}`)});
   async function open(route){
    const response=await page.goto(`${origin}/examples/${route}/`,{waitUntil:'networkidle'});
    assert.equal(response.status(),200,`${family} ${framework} ${route} responds`);
    await page.evaluate(()=>document.fonts.ready);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('main')).toHaveCount(1);
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${family} ${framework} ${route} reflows at 320px`);
   }
   await open('article');
   await expect(page.getByRole('heading',{name:catalog.pages.find(item=>item.id==='article').title,exact:true})).toBeVisible();
   await open('sign-in');
   const form=page.locator('form[data-demo-form]'),email=form.getByLabel('Email address'),password=form.getByLabel('Example password'),submit=form.getByRole('button',{name:'Validate example'});
   await email.fill('invented@example.invalid');await password.fill('invented-password');await submit.focus();await page.keyboard.press('Enter');
   await expect(form.getByRole('status')).toContainText('Example validated locally');await expect(password).toHaveValue('');
   await open('dashboard-analytics');
   await page.getByRole('combobox',{name:'Date range'}).selectOption('14');await page.getByRole('combobox',{name:'Category',exact:true}).selectOption('Research');await page.getByRole('button',{name:'Apply filters',exact:true}).click();
   await expect(page.locator('[aria-label="Analytics summary"] output').first()).toHaveText('4,459');
   await page.getByText('View session trend data',{exact:true}).click();await expect(page.locator('figure').filter({has:page.getByRole('heading',{name:'Session trend',exact:true})}).locator('table tbody tr')).toHaveCount(14);
   const toggle=page.getByRole('button',{name:'Dashboard navigation',exact:true});await toggle.focus();await page.keyboard.press('Enter');await expect(toggle).toHaveAttribute('aria-expanded','true');await page.keyboard.press('Escape');await expect(toggle).toHaveAttribute('aria-expanded','false');await expect(toggle).toBeFocused();
   assert.deepEqual(errors,[],`${family} ${framework}: no page script errors`);
   assert.deepEqual(missing,[],`${family} ${framework}: all requested local resources load`);
   await context.close();console.log(`${engine}: ${family} ${framework}: reading, form, dashboard and mobile keyboard passed`);
  }finally{server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
 }
}finally{await browser.close()}
