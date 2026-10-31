import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {mkdtempSync, mkdirSync, readFileSync, rmSync, symlinkSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {archive,execute,pinned,readPin,validateManifest} from '../scripts/qa/portable-runner.mjs';

const sha='1234567890abcdef1234567890abcdef12345678';
function manifest(){return {version:1,repositories:{fixture:{path:'/tmp/fixture',commit:sha}},fixture:{repository:'fixture',catalog:'catalog.json',dashboards:'dashboards.json'},targets:[{family:'martlet',framework:'jekyll',repository:'fixture',commands:[['python3','build.py','--out','{output}']]}]};}

test('manifest rejects moving refs, unsafe fixture paths, duplicates and unknown targets',()=>{
 assert.doesNotThrow(()=>validateManifest(manifest()));
 let data=manifest();data.repositories.fixture.commit='main';assert.throws(()=>validateManifest(data),/full commit/);
 data=manifest();data.fixture.catalog='../outside';assert.throws(()=>validateManifest(data),/repository-relative/);
 data=manifest();data.targets.push({...data.targets[0]});assert.throws(()=>validateManifest(data),/duplicate target/);
 data=manifest();data.targets[0].repository='missing';assert.throws(()=>validateManifest(data),/unknown repository/);
 data=manifest();data.targets[0].commands=[['node',null]];assert.throws(()=>validateManifest(data),/argument array/);
});

test('complete-matrix mode refuses partial coverage before opening repositories',async()=>{
 await assert.rejects(execute(manifest(),{requireMatrix:true}),/complete matrix requires both families/);
});

test('existing result files are never overwritten or mistaken for a new run',async()=>{
 const temp=mkdtempSync(join(tmpdir(),'nightjar-result-test-'));try{const output=join(temp,'result.json');writeFileSync(output,'prior evidence');await assert.rejects(execute(manifest(),{output}),/Output already exists/);assert.equal(readFileSync(output,'utf8'),'prior evidence');}finally{rmSync(temp,{recursive:true,force:true});}
});

test('pinned offline archive uses committed bytes, not a later checkout or dirty files',()=>{
 const temp=mkdtempSync(join(tmpdir(),'nightjar-pin-test-'));try{
  const repo=join(temp,'repo'),out=join(temp,'out');mkdirSync(repo);mkdirSync(out);
  const git=(...args)=>execFileSync('git',args,{cwd:repo,encoding:'utf8'}).trim();
  git('init','-q');git('config','user.name','Fixture');git('config','user.email','fixture@example.test');writeFileSync(join(repo,'catalog.json'),'first');git('add','catalog.json');git('commit','-qm','first');const first=git('rev-parse','HEAD');
  writeFileSync(join(repo,'catalog.json'),'second');git('commit','-qam','second');writeFileSync(join(repo,'catalog.json'),'uncommitted');writeFileSync(join(repo,'untracked.txt'),'not in archive');
  assert.doesNotThrow(()=>pinned(repo,first));assert.throws(()=>pinned(repo,'HEAD'),/full 40-character/);assert.equal(readPin(repo,first,'catalog.json'),'first');archive(repo,first,out);
  assert.equal(readFileSync(join(out,'catalog.json'),'utf8'),'first');assert.throws(()=>readFileSync(join(out,'untracked.txt')),{code:'ENOENT'});assert.throws(()=>readFileSync(join(out,'.git','HEAD')),{code:'ENOENT'});
  symlinkSync('/tmp',join(repo,'outside'));git('add','outside');git('commit','-qm','add unsafe symlink');assert.throws(()=>pinned(repo,git('rev-parse','HEAD')),/symlinks and submodules/);
 }finally{rmSync(temp,{recursive:true,force:true});}
});
