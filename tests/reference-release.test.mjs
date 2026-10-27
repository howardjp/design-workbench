import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, mkdir, writeFile, rm, readFile, utimes} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {validateManifest, assertMetadata, assertProtection, successfulCloudflareCheck} from '../scripts/reference-release/common.mjs';
import {publish} from '../scripts/reference-release/publish.mjs';
import {adopt} from '../scripts/reference-release/adopt.mjs';

const sha = 'a'.repeat(40), head = 'b'.repeat(40), merge = 'c'.repeat(40);
const version = `0.3.0-sha.${sha}`;
const bytes = Buffer.from('tested archive fixture');
const digest = createHash('sha256').update(bytes).digest('hex');
const manifest = () => ({version:'0.3.0', entries:['martlet','krigsvold'].map(family => ({
  family, preview:{version:'0.3.0',stage:'preview'},artifactVersion:version,sourceCommit:sha,
  base:'/',readOnlyReference:true,archive:`${family}-react-reference-${version}.tar.gz`,sha256:digest,bytes:bytes.length,
}))});
const protection = () => ({required_status_checks:{strict:true,checks:[{context:'verify',app_id:15368}]},enforce_admins:{enabled:true}});
const cloudflare = () => ({head_sha:merge,app:{id:85455},name:'Workers Builds: martlettheme',status:'completed',conclusion:'success',html_url:'https://example.test/deployment'});

test('manifest rejects mixed commits, versions, path escapes and missing families', () => {
  validateManifest(manifest(), sha);
  for (const change of [m=>m.entries[0].sourceCommit=head,m=>m.entries[0].artifactVersion='latest',m=>m.entries[0].archive='../escape',m=>m.entries.pop(),m=>m.entries[0].sha256='bad',m=>m.entries[0].preview.version='9.0.0']) {
    const m=manifest(); change(m); assert.throws(()=>validateManifest(m,sha));
  }
});
test('live metadata must match both versions, family and exact source', () => {
  const pin=manifest().entries[0]; assertMetadata(pin,pin);
  for (const field of ['family','artifactVersion','sourceCommit','base','readOnlyReference'])
    assert.throws(()=>assertMetadata({...pin,[field]:'wrong'},pin));
  assert.throws(()=>assertMetadata({...pin,preview:{version:'0.2.0'}},pin));
});
test('merge protection fails closed on missing, loose, spoofable or bypassable checks', () => {
  assertProtection(protection());
  for (const change of [p=>p.required_status_checks=null,p=>p.required_status_checks.strict=false,p=>p.required_status_checks.checks[0].app_id=null,p=>p.enforce_admins.enabled=false]) {
    const p=protection(); change(p); assert.throws(()=>assertProtection(p));
  }
});
test('Cloudflare success is specific to the app, worker and merged host commit', () => {
  assert.ok(successfulCloudflareCheck([cloudflare()],merge,'martlettheme'));
  for (const fields of [{head_sha:head},{app:{id:15368}},{conclusion:'failure'},{status:'in_progress'},{name:'Workers Builds: other'}])
    assert.equal(successfulCloudflareCheck([{...cloudflare(),...fields}],merge,'martlettheme'),undefined);
});

async function fixture(fn) {
  const cwd=process.cwd(), dir=await mkdtemp(join(tmpdir(),'reference-release-test-'));
  const saved={fetch:globalThis.fetch,env:{...process.env},now:Date.now,timer:globalThis.setTimeout};
  try {
    process.chdir(dir); await mkdir('preview-dist');
    await writeFile('preview-dist/manifest.json',JSON.stringify(manifest()));
    for(const e of manifest().entries)await writeFile(`preview-dist/${e.archive}`,bytes);
    process.env.DESIGN_SOURCE_COMMIT=sha;process.env.GH_TOKEN='fixture-only';process.env.RELEASE_FAMILY='martlet';
    delete process.env.GITHUB_STEP_SUMMARY;
    await fn();
  } finally {process.chdir(cwd);globalThis.fetch=saved.fetch;Date.now=saved.now;globalThis.setTimeout=saved.timer;process.env=saved.env;await rm(dir,{recursive:true,force:true});}
}
const json=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{'content-type':'application/json'}});

test('publication resumes an interrupted draft, then publishes; retries never overwrite', async () => fixture(async () => {
  let ref=null, release=null,interrupt=true;const mutations=[];
  globalThis.fetch=async(url,options)=>{
    const u=new URL(url),method=options.method??'GET';
    if(method!=='GET')mutations.push([method,u.pathname]);
    if(u.pathname.includes('/git/ref/tags/'))return ref?json(ref):json({},404);
    if(u.pathname.endsWith('/git/refs')){ref={object:{sha}};return json(ref);}
    if(u.pathname.includes('/releases/tags/'))return release && !release.draft?json(release):json({},404);
    if(u.pathname.endsWith('/releases') && method==='GET')return json(release?[release]:[]);
    if(u.pathname.endsWith('/releases')){release={id:1,tag_name:`design-v${version}`,draft:true,assets:[],upload_url:'https://uploads.github.com/assets{?name}',html_url:'https://example.test/release'};return json(release);}
    if(u.hostname==='uploads.github.com'){
      if(interrupt && release.assets.length===1){interrupt=false;throw Error('Interrupted upload');}
      assert.equal(release.draft,true);
      const asset={name:u.searchParams.get('name'),digest:'sha256:'+createHash('sha256').update(options.body).digest('hex'),size:options.body.length};
      release.assets.push(asset);return json(asset);
    }
    if(u.pathname.endsWith('/releases/1')){assert.equal(release.assets.length,3);release.draft=false;return json(release);}
    throw Error('Unexpected request '+url);
  };
  await assert.rejects(publish(),/Interrupted upload/);assert.equal(release.draft,true);assert.equal(release.assets.length,1);
  await publish();assert.equal(release.draft,false);const count=mutations.length;
  await publish();assert.equal(mutations.length,count);
  release.assets[0].digest='sha256:'+'0'.repeat(64);
  await assert.rejects(publish(),/differs/);assert.equal(mutations.length,count);
}));

async function adoptionScenario({ci='success',changed=false,protectedBranch=true,deploy='success',merged=false,liveWrong=false,newPr=false,stale=false}={}) {
  const pin={...manifest().entries[0],archiveUrl:`https://github.com/k3jph/design-workbench/releases/download/design-v${version}/${manifest().entries[0].archive}`};
  let didMerge=merged, mergeCalls=0, liveCalls=0,created=!newPr,written=false;
  const oldPin={...pin,sourceCommit:'d'.repeat(40)};
  const pr=()=>({number:1,html_url:'https://example.test/pr',state:didMerge?'closed':'open',merged:didMerge,head:{sha:head},merge_commit_sha:didMerge?merge:null,mergeable:true,mergeable_state:'clean'});
  const file=()=>({sha:head,content:Buffer.from(JSON.stringify(pin)).toString('base64')});
  globalThis.fetch=async(url,options={})=>{
    const u=new URL(url);
    if(u.hostname==='react.martletdesign.dev') {liveCalls++;return json(liveWrong?{...pin,artifactVersion:'old'}:pin);}
    if(u.pathname.includes('/compare/'))return json({status:stale?'behind':'ahead'});
    if(u.pathname.endsWith('/git/ref/heads/main'))return json({object:{sha:merge}});
    if(u.pathname.includes('/git/ref/heads/automation/'))return json({},404);
    if(u.pathname.endsWith('/git/refs'))return json({object:{sha:merge}});
    if(u.pathname.endsWith('/contents/site/react-reference.json')){
      if(options.method==='PUT'){written=true;assert.deepEqual(JSON.parse(Buffer.from(JSON.parse(options.body).content,'base64').toString()),pin);return json({});}
      return newPr && !written ? json({...file(),content:Buffer.from(JSON.stringify(oldPin)).toString('base64')}) : json(file());
    }
    if(u.pathname.endsWith('/pulls')){
      if(options.method==='POST'){assert.equal(written,true);created=true;return json(pr());}
      return json(created?[pr()]:[]);
    }
    if(u.pathname.endsWith('/pulls/1'))return json(pr());
    if(u.pathname.endsWith('/branches/main/protection'))return protectedBranch?json(protection()):json({},403);
    if(u.pathname.endsWith('/pulls/1/files'))return json([{filename:changed?'worker/index.mjs':'site/react-reference.json'}]);
    if(u.pathname.endsWith('/actions/workflows/ci.yml/runs'))return json({workflow_runs:[{id:9,head_sha:head,event:'pull_request',pull_requests:[{number:1}],status:'completed',conclusion:ci,html_url:'https://example.test/ci'}]});
    if(u.pathname.endsWith('/actions/runs/9/jobs'))return json({jobs:[{name:'verify',conclusion:ci}]});
    if(u.pathname.endsWith('/pulls/1/merge')){assert.equal(JSON.parse(options.body).sha,head);didMerge=true;mergeCalls++;return json({merged:true});}
    if(u.pathname.endsWith('/check-runs'))return json({check_runs:[{...cloudflare(),conclusion:deploy}]});
    if(u.pathname.endsWith('/martlettheme/martlettheme'))return json({default_branch:'main'});
    throw Error('Unexpected request '+url);
  };
  return {run:adopt,stats:()=>({mergeCalls,liveCalls}),created:()=>created};
}
for(const scenario of [{ci:'failure'},{ci:'skipped'},{changed:true},{protectedBranch:false},{newPr:true,stale:true}])
  test(`adoption cannot merge: ${JSON.stringify(scenario)}`, async()=>fixture(async()=>{
    const s=await adoptionScenario(scenario);await assert.rejects(s.run());assert.equal(s.stats().mergeCalls,0);
  }));
test('adoption merges a verified pin and verifies exact deployment and live metadata',async()=>fixture(async()=>{
  const s=await adoptionScenario();await s.run();assert.deepEqual(s.stats(),{mergeCalls:1,liveCalls:1});
}));
test('a failed Cloudflare deployment never becomes verified',async()=>fixture(async()=>{
  const s=await adoptionScenario({deploy:'failure'});await assert.rejects(s.run(),/Cloudflare deployment failed/);assert.deepEqual(s.stats(),{mergeCalls:1,liveCalls:0});
}));
test('rerun after merge only verifies deployment; it does not merge again',async()=>fixture(async()=>{
  const s=await adoptionScenario({merged:true});await s.run();assert.deepEqual(s.stats(),{mergeCalls:0,liveCalls:1});
}));

test('new adoption creates a pinned single-file PR before gated merging',async()=>fixture(async()=>{
  const s=await adoptionScenario({newPr:true});await s.run();assert.equal(s.created(),true);assert.equal(s.stats().mergeCalls,1);
}));
test('stale live preview never reports success after a successful deployment',async()=>fixture(async()=>{
  let clock=0;Date.now=()=>clock;globalThis.setTimeout=(callback)=>{clock+=60000;callback();};
  const s=await adoptionScenario({liveWrong:true});await assert.rejects(s.run(),/Timed out waiting for live React metadata/);
  assert.equal(s.stats().mergeCalls,1);assert.ok(s.stats().liveCalls>1);
}));
test('embedded skill ZIP is independent of filesystem timestamps',async()=>{
  const dir=await mkdtemp(join(tmpdir(),'reference-zip-'));
  try {
    const root=join(dir,'skill');await mkdir(root);await writeFile(join(root,'SKILL.md'),'fixture');
    const script=fileURLToPath(new URL('../scripts/zip-reproducible.py',import.meta.url));
    execFileSync('python3',[script,root,join(dir,'first.zip')]);
    await utimes(join(root,'SKILL.md'),new Date(1000000000000),new Date(1000000000000));
    execFileSync('python3',[script,root,join(dir,'second.zip')]);
    assert.deepEqual(await readFile(join(dir,'first.zip')),await readFile(join(dir,'second.zip')));
  } finally {await rm(dir,{recursive:true,force:true});}
});
