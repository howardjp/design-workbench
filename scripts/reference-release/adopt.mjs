import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {api, optional, paginate, poll, summary, hosts, sourceRepository, validateManifest, assertProtection, assertMetadata, successfulCloudflareCheck} from './common.mjs';

export async function adopt() {
const family = process.env.RELEASE_FAMILY;
assert.ok(Object.hasOwn(hosts, family), 'Unknown adoption family');
const host = hosts[family];
const manifest = validateManifest(JSON.parse(await readFile('preview-dist/manifest.json', 'utf8')), process.env.DESIGN_SOURCE_COMMIT);
const entry = manifest.entries.find(e => e.family === family);
const tag = `design-v${entry.artifactVersion}`;
const pin = {...entry, archiveUrl: `https://github.com/${sourceRepository}/releases/download/${tag}/${entry.archive}`};
const root = `/repos/${host.repository}`;
const path = 'site/react-reference.json';
const branch = `automation/react-reference-${entry.artifactVersion}`;
const repository = await api(root);
assert.equal(repository.default_branch, 'main');
const current = await api(`${root}/contents/${path}?ref=main`);
const previous = JSON.parse(Buffer.from(current.content, 'base64').toString());
// Refuse to roll an already newer source back when an old workflow is retried.
if (previous.sourceCommit !== entry.sourceCommit) {
  const comparison = await api(`/repos/${sourceRepository}/compare/${previous.sourceCommit}...${entry.sourceCommit}`, {token: process.env.SOURCE_GH_TOKEN});
  assert.equal(comparison.status, 'ahead', 'Requested reference must descend from the currently adopted source');
}
let prs = await paginate(`${root}/pulls?state=all&head=${host.repository.split('/')[0]}:${branch}&base=main`);
assert.ok(prs.length <= 1, 'Ambiguous adoption PR history; inspect manually');
let pr = prs[0];
if (!pr) {
  assert.notDeepEqual(previous, pin, 'Pin is already present without a matching adoption PR; verify manually');
  const base = await api(`${root}/git/ref/heads/main`);
  let ref = await optional(`${root}/git/ref/heads/${branch}`);
  if (!ref) ref = await api(`${root}/git/refs`, {method: 'POST', body: {ref: `refs/heads/${branch}`, sha: base.object.sha}});
  const file = await api(`${root}/contents/${path}?ref=${encodeURIComponent(branch)}`);
  const branchPin = JSON.parse(Buffer.from(file.content, 'base64').toString());
  if (JSON.stringify(branchPin) !== JSON.stringify(pin)) {
    assert.equal(ref.object.sha, base.object.sha, 'Existing automation branch changed; inspect rather than overwrite it');
    await api(`${root}/contents/${path}`, {method: 'PUT', body: {
      branch, sha: file.sha, message: `Adopt ${family} React reference ${entry.artifactVersion}`,
      content: Buffer.from(JSON.stringify(pin, null, 2) + '\n').toString('base64'),
    }});
  }
  pr = await api(`${root}/pulls`, {method: 'POST', body: {
    head: branch, base: 'main', title: `Adopt React reference ${entry.artifactVersion}`,
    body: `Adopts the tested ${family} reference archive.\n\n- Version: \`${entry.artifactVersion}\`\n- Source commit: \`${entry.sourceCommit}\`\n- SHA-256: \`${entry.sha256}\`\n- [Release](${pin.archiveUrl.slice(0, pin.archiveUrl.lastIndexOf('/')).replace('/download/', '/tag/')})\n\nOnly the reference pin changes. The host build validates the archive. Automation requires strict main protection and successful Theme verification CI before merging, then checks Cloudflare's result for the merge commit and the live /preview.json. npm publication is unchanged.`,
  }});
}
await summary(`Adoption PR: ${pr.html_url}`);
pr = await api(`${root}/pulls/${pr.number}`);
if (!pr.merged) {
  assert.equal(pr.state, 'open', 'Adoption PR was closed without merge; do not recreate it automatically');
  // Fail closed even if the token could otherwise bypass an unprotected branch.
  assertProtection(await api(`${root}/branches/main/protection`));
  const head = pr.head.sha;
  const files = await paginate(`${root}/pulls/${pr.number}/files`);
  assert.deepEqual(files.map(file => file.filename), [path], 'Adoption PR must only change the archive pin');
  const proposed = await api(`${root}/contents/${path}?ref=${head}`);
  assert.deepEqual(JSON.parse(Buffer.from(proposed.content, 'base64').toString()), pin);
  await poll('host PR CI and an up-to-date mergeable branch', async () => {
    pr = await api(`${root}/pulls/${pr.number}`);
    assert.equal(pr.head.sha, head, 'PR head changed during verification');
    assert.equal(pr.state, 'open', 'PR closed during verification; rerun to verify a manual merge');
    const runs = await paginate(`${root}/actions/workflows/ci.yml/runs?event=pull_request&head_sha=${head}`, 'workflow_runs');
    const run = runs.filter(run => run.head_sha === head && run.event === 'pull_request')
      .sort((a, b) => b.id - a.id)[0];
    if (!run || run.status !== 'completed') return false;
    assert.equal(run.conclusion, 'success', `Host CI failed: ${run.html_url}`);
    const jobs = await paginate(`${root}/actions/runs/${run.id}/jobs`,'jobs');
    assert.ok(jobs.some(job => job.name === 'verify' && job.conclusion === 'success'), 'Host verify job must succeed, not skip');
    // "clean" + strict required checks also prevents merging stale results after a base update.
    return pr.mergeable === true && pr.mergeable_state === 'clean';
  }, 15);
  assertProtection(await api(`${root}/branches/main/protection`));
  const result = await api(`${root}/pulls/${pr.number}/merge`, {method: 'PUT', body: {sha: head, merge_method: 'squash'}});
  assert.equal(result.merged, true);
  pr = await api(`${root}/pulls/${pr.number}`);
}
assert.equal(pr.merged, true);
assert.match(pr.merge_commit_sha, /^[a-f0-9]{40}$/);
const mergeSha = pr.merge_commit_sha;
await summary(`Merged ${pr.html_url} at \`${mergeSha}\`. Waiting for deployment verification.`);
const deployed = await poll('Cloudflare deployment for the exact host merge commit', async () => {
  const checks = await paginate(`${root}/commits/${mergeSha}/check-runs?filter=latest`, 'check_runs');
  const check = checks.find(c => c.head_sha === mergeSha && c.app?.id === 85455 && c.name === `Workers Builds: ${host.worker}`);
  if (check?.status === 'completed' && check.conclusion !== 'success')
    throw new Error(`Cloudflare deployment failed: ${check.html_url}`);
  return successfulCloudflareCheck(checks, mergeSha, host.worker);
}, 12);
await poll('live React metadata matching all release pins', async () => {
  try {
    const url = new URL(host.live);
    url.searchParams.set('verify', `${mergeSha}-${Date.now()}`);
    const response = await fetch(url, {cache: 'no-store', headers: {'cache-control': 'no-cache'}, signal: AbortSignal.timeout(20000)});
    if (!response.ok) return false;
    assertMetadata(await response.json(), pin);
    return true;
  } catch (error) {
    console.log(`Live metadata not yet verified: ${error.message}`);
    return false;
  }
}, 5);
await summary(`Verified [Cloudflare deployment](${deployed.html_url}) and [live React metadata](${host.live}): artifact \`${entry.artifactVersion}\`, preview \`${entry.preview.version}\`, source \`${entry.sourceCommit}\`.`);

}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await adopt();
