import assert from 'node:assert/strict';
import {readFile, rm, mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
import {validateManifest, assertMetadata} from './common.mjs';

// Replace docs-dist with the exact bytes uploaded as release assets before browser tests.
const manifest = validateManifest(JSON.parse(await readFile('preview-dist/manifest.json', 'utf8')), process.env.DESIGN_SOURCE_COMMIT);
await rm('docs-dist', {recursive: true, force: true});
for (const entry of manifest.entries) {
  const archive = resolve('preview-dist', entry.archive);
  const bytes = await readFile(archive);
  assert.equal(bytes.length, entry.bytes);
  assert.equal(createHash('sha256').update(bytes).digest('hex'), entry.sha256);
  const paths = execFileSync('tar', ['-tzf', archive], {encoding: 'utf8'}).trim().split('\n');
  assert.ok(paths.every(path => path.startsWith('react/') && !path.includes('\\') && !path.split('/').includes('..')));
  const listing = execFileSync('tar', ['-tvzf', archive], {encoding: 'utf8'}).trim().split('\n');
  assert.ok(listing.every(line => ['-', 'd'].includes(line[0])));
  const directory = resolve('docs-dist', entry.family);
  await mkdir(directory, {recursive: true});
  execFileSync('tar', ['-xzf', archive, '--strip-components=1', '--directory', directory, '--no-same-owner', '--no-same-permissions']);
  assertMetadata(JSON.parse(await readFile(`${directory}/preview.json`, 'utf8')), entry);
}
console.log('Both pinned archives verified and extracted for browser testing');
