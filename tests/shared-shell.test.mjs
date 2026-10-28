import{test}from'node:test';import assert from'node:assert/strict';import{readFile}from'node:fs/promises';import{createHash}from'node:crypto';
for(const family of ['martlet','krigsvold'])test(`${family}: imported Astro shell is byte-identical to its manifest`,async()=>{
const root=`docs-app/src/shell/${family}`,manifest=JSON.parse(await readFile(`${root}/manifest.json`,'utf8'));assert.equal(manifest.family,family);assert.equal(createHash('sha256').update(await readFile(`${root}/${manifest.stylesheet}`)).digest('hex'),manifest.sha256);
const chrome=JSON.parse(await readFile(`${root}/chrome.json`,'utf8'));assert.ok(chrome.header.includes('aria-expanded="false"'));assert.ok(chrome.footer.includes('site-footer'));
});
