import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
assert.equal(process.env.GITHUB_REPOSITORY,'k3jph/design-workbench');
for(const family of ['martlet','krigsvold']) {
 const pkg=JSON.parse(await readFile(`packages/${family}-react/package.json`,'utf8'));
 assert.equal(pkg.private,false);assert.match(pkg.version,/^0\.\d+\.\d+$/);
 assert.equal(process.env.RELEASE_TAG,'react-v'+pkg.version);
 assert.equal(pkg.publishConfig.tag,'next');assert.equal(pkg.publishConfig.access,'public');
 assert.equal(pkg.publishConfig.provenance,true);
 assert.equal(pkg.name,`@${family}/react`);
}
console.log('Experimental package identity and next-tag publication verified');
