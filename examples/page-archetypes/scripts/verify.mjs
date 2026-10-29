import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Validator } from '@cfworker/json-schema';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const catalog = JSON.parse(fs.readFileSync(path.join(root, 'content/catalog.json')));
const schema = JSON.parse(fs.readFileSync(path.join(root, 'contracts/catalog.schema.json')));
const validator = new Validator(schema, '2020-12', true);
const result = validator.validate(catalog);
assert.ok(result.valid, JSON.stringify(result.errors, null, 2));
const ids = new Set(catalog.pages.map(page => page.id));
assert.equal(ids.size, catalog.pages.length, 'Page IDs must be unique');
const urls = new Set([...ids].map(id => `/examples/${id}/`));
urls.add('/examples/');
for (const page of catalog.pages) {
  const sectionIds = new Set(page.sections.map(section => section.id));
  assert.equal(sectionIds.size, page.sections.length, `${page.id}: duplicate section IDs`);
  for (const section of page.sections) {
    if (section.kind === 'table') assert.ok(section.rows.every(row => row.length === section.headers.length), `${page.id}: ragged table`);
    const inspect = value => {
      if (!value || typeof value !== 'object') return;
      for (const [key, item] of Object.entries(value)) {
        if (key === 'url') assert.ok(urls.has(item) || fs.existsSync(path.join(root, 'jekyll', item)), `Broken fixture destination: ${item}`);
        if (key === 'image') assert.ok(fs.existsSync(path.join(root, 'jekyll', item)), `Missing asset: ${item}`);
        if (typeof item === 'object') inspect(item);
      }
    };
    inspect(section);
  }
  assert.ok(!JSON.stringify(page).match(/{[{%]|className=|class=/), `${page.id}: framework syntax in content contract`);
}
for (const family of ['martlet', 'krigsvold']) {
  const site = path.join(root, '../jekyll', family);
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(site, '_data/examples.json'))), catalog, `${family}: stale content export`);
  for (const page of catalog.pages) {
    assert.ok(fs.existsSync(path.join(site, '_layouts', `example-${page.composition}.html`)));
    const front = fs.readFileSync(path.join(site, 'examples', `${page.id}.html`), 'utf8');
    assert.ok(front.includes(`"record_id": "${page.id}"`));
  }
  const shell = JSON.parse(fs.readFileSync(path.join(site, '_data/shell.json')));
  const { createHash } = await import('node:crypto');
  assert.equal(createHash('sha256').update(fs.readFileSync(path.join(site, 'assets/css/shell.css'))).digest('hex'), shell.sha256, `${family}: authoritative shell changed`);
}
// Negative tests ensure contract checks reject missing semantic requirements and unsafe destinations.
for (const mutate of [
  c => { delete c.pages.find(p => p.id === 'event').event; },
  c => { c.pages[0].sections[0].actions[0].url = 'javascript:alert(1)'; },
  c => { c.pages[0].sections[0].kind = 'unknown-widget'; },
  c => { delete c.pages.find(p => p.id === 'article').author; }
]) {
  const invalid = structuredClone(catalog); mutate(invalid);
  assert.equal(validator.validate(invalid).valid, false, 'Contract accepted an invalid fixture');
}
console.log(`Verified ${catalog.pages.length} portable recipes, semantic contracts, destinations, parity, and both shell hashes.`);

const dashboardData=JSON.parse(fs.readFileSync(path.join(root,'content/dashboards.json')));
const dashboardSchema=JSON.parse(fs.readFileSync(path.join(root,'contracts/dashboards.schema.json')));
const dashboardResult=new Validator(dashboardSchema,'2020-12',true).validate(dashboardData);
assert.ok(dashboardResult.valid,JSON.stringify(dashboardResult.errors));
for(const key of ['people','services','alerts'])assert.equal(new Set(dashboardData[key].map(item=>item.id)).size,dashboardData[key].length);
for(const alert of dashboardData.alerts)assert.ok(dashboardData.services.some(service=>service.id===alert.service_id));
for(const family of ['martlet','krigsvold'])assert.deepEqual(JSON.parse(fs.readFileSync(path.join(root,'../jekyll',family,'_data/dashboards.json'))),dashboardData);
console.log('Verified shared synthetic dashboard data and referential integrity.');
