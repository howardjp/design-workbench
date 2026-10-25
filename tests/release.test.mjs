import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
test('experimental release gate accepts its tag and rejects another tag or repository',()=>{
 const run=env=>spawnSync(process.execPath,['scripts/check-react-release.mjs'],{encoding:'utf8',env:{...process.env,GITHUB_REPOSITORY:'howardjp/design-workbench',RELEASE_TAG:'react-v0.1.0',...env}});
 assert.equal(run({}).status,0);
 assert.notEqual(run({RELEASE_TAG:'v0.1.0'}).status,0);
 assert.notEqual(run({GITHUB_REPOSITORY:'other/repository'}).status,0);
});
