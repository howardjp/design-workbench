// Exercise reviewed starter patches using integrity-locked public npm packages.
// This copies inputs into an ephemeral directory and never publishes or deploys.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {cp, lstat, mkdtemp, readFile, readdir, rm, symlink, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {dirname, join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';

const root = resolve(fileURLToPath(new URL('../../../', import.meta.url)));
const here = dirname(fileURLToPath(import.meta.url));
const version = process.env.NIGHTJAR_ASTRO_MATRIX;
const engine = process.env.DESIGN_BROWSER || 'chromium';
assert.ok(['astro5', 'astro7'].includes(version), 'Set NIGHTJAR_ASTRO_MATRIX to astro5 or astro7');
assert.ok(['chromium', 'firefox', 'webkit'].includes(engine));
const dependencies = join(here, version, 'node_modules');
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
async function files(dir, prefix='') {
  const result = {};
  for (const name of (await readdir(join(dir,prefix))).sort()) {
    const path = join(prefix,name), stat = await lstat(join(dir,path));
    assert.ok(!stat.isSymbolicLink(), `Unexpected symlink: ${path}`);
    if (stat.isDirectory()) Object.assign(result, await files(dir,path));
    else if (stat.isFile()) result[path] = digest(await readFile(join(dir,path)));
    else throw Error(`Unexpected non-file: ${path}`);
  }
  return result;
}
function run(command,args,cwd,extra={}) {
  const result=spawnSync(command,args,{cwd,env:{...process.env,...extra},encoding:'utf8',timeout:240000,maxBuffer:16*1024*1024});
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  assert.equal(result.status,0,`${command} ${args.join(' ')} failed: ${result.error || result.signal || result.status}`);
}
const temp=await mkdtemp(join(tmpdir(),'nightjar-astro-consumer-'));
try {
  for (const family of ['martlet','krigsvold']) {
    const manifest=JSON.parse(await readFile(join(here,family,'provenance.json'),'utf8'));
    const installed=join(dependencies,'@'+family,'astro'), candidate=join(temp,family+'-package');
    assert.deepEqual(await files(installed),manifest.baselineFiles,`${family}: published package bytes must match pinned source`);
    assert.deepEqual(await files(join(here,family)),{...manifest.testHarnessFiles,'provenance.json':digest(await readFile(join(here,family,'provenance.json')))},`${family}: test harness differs from reviewed source`);
    await cp(installed,candidate,{recursive:true});
    for (const patch of ['safe-form','subpath']) run('git',['apply','--unidiff-zero','--include=starter/**',join(root,'docs/qa/nightjar-iii-astro-patches',`${family}-${patch}.patch`)],candidate);
    const actualStarter=Object.fromEntries(Object.entries(await files(join(candidate,'starter'))).map(([path,hash])=>[`starter/${path}`,hash]));
    assert.deepEqual(actualStarter,manifest.patchedStarterFiles,`${family}: applied starter differs from reviewed candidate`);
    const site=join(temp,family+'-site'); await cp(join(candidate,'starter'),site,{recursive:true});
    await symlink(dependencies,join(site,'node_modules'),'dir');
    run('npm',['run','build'],site,{ASTRO_TELEMETRY_DISABLED:'1'});
    const flags={DESIGN_BROWSER:engine, ...(family==='martlet'?{MARTLET_BROWSER:'1'}:{KRIGSVOLD_BROWSER:'1'})};
    run(process.execPath,[join(here,family,'browser.mjs'),join(site,'dist')],root,flags);
    await writeFile(join(site,'astro.config.mjs'),"import { defineConfig } from 'astro/config'; export default defineConfig({base:'/preview'});\n");
    run('npm',['run','build'],site,{ASTRO_TELEMETRY_DISABLED:'1'});
    run(process.execPath,[join(here,family,'subpath-check.mjs'),join(site,'dist')],root,flags);
    console.log(`${family}: ${version}, ${engine}, source-verified starter root and subpath passed`);
  }
} finally { await rm(temp,{recursive:true,force:true}); }
