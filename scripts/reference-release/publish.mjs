import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {api, optional, paginate, sourceRepository, validateManifest, summary} from './common.mjs';

export async function publish() {
const manifest = validateManifest(JSON.parse(await readFile('preview-dist/manifest.json', 'utf8')), process.env.DESIGN_SOURCE_COMMIT);
const entry = manifest.entries[0];
const tag = `design-v${entry.artifactVersion}`;
const root = `/repos/${sourceRepository}`;
// Never move tags or replace assets, even on reruns. A new commit means a new release.
let ref = await optional(`${root}/git/ref/tags/${tag}`);
if (!ref) ref = await api(`${root}/git/refs`, {method: 'POST', body: {ref: `refs/tags/${tag}`, sha: entry.sourceCommit}});
assert.equal(ref.object.sha, entry.sourceCommit, 'Existing release tag points at a different commit');
let release = await optional(`${root}/releases/tags/${tag}`);
// The tag endpoint only returns published releases. Authenticated listing also
// includes drafts, so an interrupted upload can resume without a duplicate release.
if (!release) {
  const drafts = (await paginate(`${root}/releases`)).filter(item => item.tag_name === tag && item.draft);
  assert.ok(drafts.length <= 1, 'Multiple drafts for the same reference tag');
  release = drafts[0];
}
if (!release) release = await api(`${root}/releases`, {method: 'POST', body: {
  tag_name: tag, target_commitish: entry.sourceCommit, name: `React references ${entry.artifactVersion}`,
  draft: true, prerelease: true,
  body: `Reference archives tested in Chromium, Firefox and WebKit.\n\nSource: ${entry.sourceCommit}\n\n` +
    manifest.entries.map(e => `- ${e.archive}: SHA-256 \`${e.sha256}\``).join('\n'),
}});
for (const name of [...manifest.entries.map(e => e.archive), 'manifest.json']) {
  const bytes = await readFile(`preview-dist/${name}`);
  const digest = createHash('sha256').update(bytes).digest('hex');
  const existing = release.assets.find(asset => asset.name === name);
  if (existing) {
    // GitHub's server-computed digest is mandatory: no overwrite fallback.
    assert.equal(existing.digest, `sha256:${digest}`, `Existing ${name} differs or has no server digest`);
    assert.equal(existing.size, bytes.length);
  } else {
    assert.equal(release.draft, true, 'Cannot add missing assets to a published release');
    const uploaded = await api(`${release.upload_url.split('{')[0]}?name=${encodeURIComponent(name)}`, {
      method: 'POST', body: bytes, raw: true, headers: {'content-type': 'application/octet-stream'},
    });
    assert.equal(uploaded.digest, `sha256:${digest}`);
  }
}
if (release.draft) release = await api(`${root}/releases/${release.id}`, {method: 'PATCH', body: {draft: false, make_latest: 'false'}});
await summary(`Published tested React references: ${release.html_url}`);

}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await publish();
