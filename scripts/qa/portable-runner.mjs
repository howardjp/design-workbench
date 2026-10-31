#!/usr/bin/env node
// Experimental offline, pinned-input route and static-content evidence runner.
// Build commands are trusted local code; this process is not a network sandbox.
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {lstat, mkdtemp, mkdir, readFile, readdir, rm, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {dirname, join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium, firefox, webkit} from '@playwright/test';

const here=dirname(fileURLToPath(import.meta.url));
const families=['martlet','krigsvold'], frameworks=['jekyll','astro','react'];
const dashboardIds=new Set(['dashboard-analytics','dashboard-administration','dashboard-operations']);
const fullCommit=/^[0-9a-f]{40}$/;
function run(program,args,opts={}) {
 const result=spawnSync(program,args,{encoding:'utf8',maxBuffer:128*1024*1024,...opts});
 if(result.error) throw result.error;
 if(result.status!==0) throw Error(`${program} ${args.join(' ')} failed (${result.status}):\n${result.stderr||result.stdout}`);
 return result.stdout;
}
export function pinned(repo,commit){
 assert.ok(fullCommit.test(commit),'Every input needs a full 40-character lowercase commit ID; moving refs are not accepted');
 const actual=run('git',['-C',repo,'rev-parse','--verify',`${commit}^{commit}`]).trim();
 assert.equal(actual,commit,`Missing or non-commit pin in ${repo}`);
}
export function validateManifest(manifest){
 assert.equal(manifest.version,1,'manifest version must be 1');
 assert.ok(manifest.repositories && typeof manifest.repositories==='object' && !Array.isArray(manifest.repositories),'repositories required');
 const keys=Object.keys(manifest.repositories);assert.ok(keys.length,'at least one repository required');
 for(const key of keys){assert.match(key,/^[a-z][a-z0-9_-]*$/);const repo=manifest.repositories[key];assert.equal(typeof repo.path,'string');assert.ok(fullCommit.test(repo.commit||''),`${key}: full commit required`)}
 assert.ok(manifest.fixture && keys.includes(manifest.fixture.repository),'fixture repository required');
 for(const key of ['catalog','dashboards'])assert.match(manifest.fixture[key]||'',/^(?!\/)(?!.*(?:^|\/)\.\.(?:\/|$))[A-Za-z0-9_./-]+$/,`${key}: use a repository-relative path`);
 assert.ok(Array.isArray(manifest.targets)&&manifest.targets.length,'targets required');
 const seen=new Set();for(const target of manifest.targets){
  assert.ok(families.includes(target.family)&&frameworks.includes(target.framework),'unknown family or framework');const key=`${target.family}/${target.framework}`;assert.ok(!seen.has(key),`duplicate target ${key}`);seen.add(key);
  assert.ok(keys.includes(target.repository),`${key}: unknown repository`);
  assert.ok(Array.isArray(target.commands)&&target.commands.length,`${key}: build commands required`);
  for(const command of target.commands){assert.ok(Array.isArray(command)&&command.length&&command.every(value=>typeof value==='string'&&value.length),`${key}: each command must be a nonempty argument array`);}
 }
 return manifest;
}
export function readPin(repo,commit,path){return run('git',['-C',repo,'show',`${commit}:${path}`]);}
export function archive(repo,commit,dest){
 const result=spawnSync('git',['-C',repo,'archive','--format=tar',commit],{maxBuffer:128*1024*1024});
 if(result.error||result.status!==0)throw result.error||Error(`git archive failed for ${repo}@${commit}`);
 const extracted=spawnSync('tar',['-xf','-','-C',dest],{input:result.stdout,maxBuffer:4*1024*1024});
 if(extracted.error||extracted.status!==0)throw extracted.error||Error(`git archive extraction failed for ${repo}@${commit}`);
}
function expand(arg,context){
 return arg.replace(/\{(output|baseSlash|base|source:[a-z][a-z0-9_-]*)\}/g,(_,key)=>{
  const value=key.startsWith('source:')?context.sources[key.slice(7)]:context[key];assert.notEqual(value,undefined,`Unknown placeholder ${key}`);return value;
 });
}
const norm=value=>value.replace(/\s+/g,' ').trim();
async function digestTree(root){
 const files=[];async function walk(directory,prefix=''){
  for(const name of (await readdir(directory)).sort()){
   const relative=prefix?`${prefix}/${name}`:name,full=join(directory,name),info=await lstat(full);
   if(info.isDirectory())await walk(full,relative);
   else {assert.ok(info.isFile(),`Build output contains a symlink or special file: ${relative}`);files.push([relative,createHash('sha256').update(await readFile(full)).digest('hex')]);}
  }
 }await walk(root);assert.ok(files.length,'Build output is empty');return createHash('sha256').update(JSON.stringify(files)).digest('hex');
}
export async function auditSite(page,root,base,catalog,dashboards,label){
 const cells=[];
 for(const record of catalog.pages){
  const html=await readFile(join(root,'examples',record.id,'index.html'),'utf8');
  await page.setContent(html,{waitUntil:'domcontentloaded'});
  const found=await page.evaluate(()=>{const normalize=value=>value.replace(/\s+/g,' ').trim();return {headings:[...document.querySelectorAll('h1')].map(n=>normalize(n.textContent)),main:normalize(document.querySelector('main')?.textContent||''),mainCount:document.querySelectorAll('main').length,people:[...document.querySelectorAll('#people-table tbody tr th[scope=row]')].map(n=>normalize(n.textContent)),tableIds:[...document.querySelectorAll('main table[id]')].filter(n=>n.tBodies[0]?.rows.length).map(n=>n.id),sections:[...document.querySelectorAll('h2[id]')].map(h=>{const container=h.closest('section')||h.parentElement;return {id:h.id,title:normalize(h.textContent),text:normalize(container.textContent),images:[...container.querySelectorAll('img')].map(image=>image.alt),tables:[...container.querySelectorAll('table')].map(t=>({caption:normalize(t.caption?.textContent||''),headers:[...t.querySelectorAll('thead th')].map(n=>normalize(n.textContent)),columnScopes:[...t.querySelectorAll('thead th')].map(n=>n.getAttribute('scope')),rows:[...t.querySelectorAll('tbody tr')].map(r=>[...r.children].map(c=>normalize(c.textContent))),rowScopes:[...t.querySelectorAll('tbody tr')].map(r=>r.firstElementChild?.getAttribute('scope'))}))};})};});
  assert.deepEqual(found.headings,[norm(record.title)],`${label}/${record.id}: canonical heading`);assert.equal(found.mainCount,1,`${label}/${record.id}: one main`);assert.ok(found.main.includes(norm(record.summary)),`${label}/${record.id}: canonical summary`);
  if(record.id==='dashboard-administration')assert.deepEqual(found.people.sort(),dashboards.people.map(p=>norm(p.name)).sort(),`${label}: administration fixture`);
  const required=record.id==='dashboard-analytics'?['analytics-source']:record.id==='dashboard-administration'?['people-table']:record.id==='dashboard-operations'?['service-table','alert-table']:[];
  for(const id of required)assert.ok(found.tableIds.includes(id),`${label}/${record.id}: missing nonempty table ${id}`);
  if(!dashboardIds.has(record.id))for(const section of record.sections){
   const current=found.sections.find(s=>s.id===section.id),where=`${label}/${record.id}/${section.id}`;assert.ok(current,`${where}: missing section`);assert.equal(current.title,norm(section.title),`${where}: heading differs`);
   const expected=[];if(section.kind==='facts')for(const item of section.facts)expected.push(item.label,item.value);if(['cards','listing','gallery','workspace'].includes(section.kind))for(const item of section.items)for(const field of ['title','summary','status','owner','caption','tag'])if(item[field])expected.push(item[field]);if(section.kind==='faq')for(const item of section.items)expected.push(item.question,item.answer);if(section.kind==='stats')for(const item of section.items)expected.push(item.label,item.value);if(section.kind==='plans')for(const item of section.items)expected.push(item.title,item.price,item.summary,...item.features,item.action.label);if(section.kind==='figure')expected.push(section.caption);
   for(const text of expected)assert.ok(current.text.includes(norm(text)),`${where}: missing representative text ${JSON.stringify(text)}`);
   if(section.kind==='table'){const table=current.tables[0];assert.ok(table,`${where}: table missing`);assert.equal(table.caption,section.title,`${where}: caption`);assert.deepEqual(table.headers,section.headers,`${where}: headers`);assert.deepEqual(table.rows,section.rows,`${where}: rows`);assert.ok(table.columnScopes.every(scope=>scope==='col')&&table.rowScopes.every(scope=>scope==='row'),`${where}: table header scope`);}
   if(section.kind==='figure')assert.ok(current.images.includes(section.alt),`${where}: figure alt`);if(section.kind==='gallery')for(const item of section.items)assert.ok(current.images.includes(item.alt),`${where}: gallery alt`);
  }
  cells.push({example:record.id,base,static_content:'checked',interactive_behavior:'not_assessed',automated_accessibility:'not_assessed',visual_conformance:'not_assessed'});
 }
 const science=await readFile(join(root,'examples','scientific-workspace','index.html'),'utf8');await page.setContent(science,{waitUntil:'domcontentloaded'});
 assert.equal(await page.locator('h1').count(),1,`${label}: experimental science has one heading`);assert.ok(await page.locator('main tbody tr').count()>0,`${label}: experimental science has static results`);
 return {cells,science:{status:'experimental',static_results:'checked',interactive_behavior:'not_assessed'}};
}
export async function execute(manifest,{browserName='chromium',output,requireMatrix=false}={}){
 validateManifest(manifest);assert.ok(['chromium','firefox','webkit'].includes(browserName),'unsupported browser');
 if(requireMatrix)assert.equal(manifest.targets.length,6,'complete matrix requires both families and all three frameworks');
 if(output){try{await lstat(resolve(output));throw Error('Output already exists; choose a new result path');}catch(error){if(error.code!=='ENOENT')throw error;}}
 const runnerFile=fileURLToPath(import.meta.url),verifier=join(here,'../../examples/page-archetypes/scripts/verify-html.py'),hashFile=async path=>createHash('sha256').update(await readFile(path)).digest('hex');
 const runnerCommit=run('git',['-C',here,'rev-parse','HEAD']).trim(),scriptHash=await hashFile(runnerFile),verifierHash=await hashFile(verifier),dirty=!!run('git',['-C',here,'status','--porcelain','--untracked-files=all']).trim();
 const repos={};for(const [name,spec] of Object.entries(manifest.repositories)){const path=resolve(spec.path);pinned(path,spec.commit);repos[name]={path,commit:spec.commit};}
 const fixtureRepo=repos[manifest.fixture.repository],catalogText=readPin(fixtureRepo.path,fixtureRepo.commit,manifest.fixture.catalog),dashboardText=readPin(fixtureRepo.path,fixtureRepo.commit,manifest.fixture.dashboards);
 const catalog=JSON.parse(catalogText),dashboards=JSON.parse(dashboardText);assert.equal(catalog.pages.length,50,'canonical fixture must have 50 examples');assert.equal(new Set(catalog.pages.map(p=>p.id)).size,50,'duplicate catalog ID');
 for(const p of catalog.pages)assert.match(p.id,/^[a-z0-9]+(?:-[a-z0-9]+)*$/,'unsafe route ID');
 const temp=await mkdtemp(join(tmpdir(),'nightjar-portable-runner-'));let browser;
 try{
  browser=await ({chromium,firefox,webkit})[browserName].launch({headless:true,...(browserName==='chromium'&&process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{})});
  const context=await browser.newContext({javaScriptEnabled:false});await context.route('**/*',route=>route.abort());const page=await context.newPage();
  const results=[];for(const target of manifest.targets)for(const base of ['', '/preview']){
   // Every build starts with a fresh archive of each pinned input. Build output
   // and caches from one family/base cannot become another case's source.
   const sources={};for(const [name,repo] of Object.entries(repos)){sources[name]=join(temp,'sources',target.family,target.framework,base?'preview':'root',name);await mkdir(sources[name],{recursive:true});archive(repo.path,repo.commit,sources[name]);}
   const outputPath=join(temp,'builds',target.family,target.framework,base?'preview':'root');await mkdir(outputPath,{recursive:true});
   for(const command of target.commands){const args=command.map(arg=>expand(arg,{sources,base,baseSlash:base?`${base}/`:'/',output:outputPath}));run(args[0],args.slice(1),{cwd:sources[target.repository],timeout:15*60*1000});}
   const outputHash=await digestTree(outputPath); // reject output symlinks before traversing rendered documents
   const htmlCheck=run('python3',[join(here,'../../examples/page-archetypes/scripts/verify-html.py'),outputPath,'--baseurl',base]);
   const audited=await auditSite(page,outputPath,base||'/',catalog,dashboards,`${target.family}/${target.framework}${base||'/'}`);
   results.push({family:target.family,framework:target.framework,base:base||'/',source:target.repository,source_commit:repos[target.repository].commit,build_commands:target.commands,output_tree_sha256:outputHash,html_check:htmlCheck.trim(),...audited});
   console.log(`${target.family}/${target.framework}${base||'/'}: 50 static routes, local links and experimental static results checked`);
  }
  await context.close();
  assert.equal(await hashFile(runnerFile),scriptHash,'Runner changed during execution');assert.equal(await hashFile(verifier),verifierHash,'HTML verifier changed during execution');assert.equal(run('git',['-C',here,'rev-parse','HEAD']).trim(),runnerCommit,'Runner commit changed during execution');
  const result={version:1,runner_scope:'Static content, local link/fragment inventory and experimental static-result presence only. Not full conformance or an accessibility audit.',network_policy:'Runner performs no fetch; build commands are trusted code and network isolation is not enforced.',runner:{commit:runnerCommit,script_sha256:scriptHash,html_verifier_sha256:verifierHash,worktree_dirty:dirty},fixture:{repository:manifest.fixture.repository,commit:fixtureRepo.commit,catalog_path:manifest.fixture.catalog,dashboards_path:manifest.fixture.dashboards,catalog_sha256:createHash('sha256').update(catalogText).digest('hex'),dashboards_sha256:createHash('sha256').update(dashboardText).digest('hex')},repositories:Object.fromEntries(Object.entries(repos).map(([name,repo])=>[name,{commit:repo.commit}])),browser:{engine:browserName,version:browser.version()},node:process.version,javascript:'disabled',results,missing:families.flatMap(f=>frameworks.map(fr=>`${f}/${fr}`)).filter(key=>!manifest.targets.some(t=>`${t.family}/${t.framework}`===key)),not_assessed:['interactive behavior','JavaScript failure recovery','automated accessibility','contrast incomplete findings','visual identity','manual assistive technology','physical print','performance']};
  if(output)await writeFile(resolve(output),JSON.stringify(result,null,2)+'\n',{flag:'wx'});return result;
 }finally{if(browser)await browser.close();await rm(temp,{recursive:true,force:true});}
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const args=process.argv.slice(2);let manifestPath,output,browserName='chromium',requireMatrix=false;
 for(let i=0;i<args.length;i++){if(args[i]==='--manifest')manifestPath=args[++i];else if(args[i]==='--output')output=args[++i];else if(args[i]==='--browser')browserName=args[++i];else if(args[i]==='--require-matrix')requireMatrix=true;else throw Error(`Unknown argument: ${args[i]}`);}
 assert.ok(manifestPath&&output,'Usage: node scripts/qa/portable-runner.mjs --manifest manifest.json --output result.json [--browser chromium|firefox|webkit] [--require-matrix]');
 const manifest=JSON.parse(await readFile(resolve(manifestPath),'utf8'));const result=await execute(manifest,{browserName,output,requireMatrix});
 console.log(`Recorded ${result.results.reduce((n,r)=>n+r.cells.length,0)} bounded static route checks; missing targets: ${result.missing.join(', ')||'none'}.`);
}
