import assert from 'node:assert/strict';
import {appendFile} from 'node:fs/promises';

export const sourceRepository = 'k3jph/design-workbench';
export const hosts = {
  martlet: {repository: 'martlettheme/martlettheme', live: 'https://react.martletdesign.dev/preview.json', worker: 'martlettheme'},
  krigsvold: {repository: 'krigsvoldtheme/krigsvoldtheme', live: 'https://react.krigsvolddesign.dev/preview.json', worker: 'krigsvoldtheme'},
};
export function validateManifest(manifest, sourceCommit) {
  assert.match(sourceCommit, /^[a-f0-9]{40}$/);
  assert.match(manifest.version, /^\d+\.\d+\.\d+$/);
  assert.equal(manifest.entries.length, 2);
  for (const family of Object.keys(hosts)) {
    const entries = manifest.entries.filter(entry => entry.family === family);
    assert.equal(entries.length, 1);
    const entry = entries[0];
    assert.equal(entry.sourceCommit, sourceCommit);
    assert.equal(entry.artifactVersion, `${manifest.version}-sha.${sourceCommit}`);
    assert.equal(entry.preview.version, manifest.version);
    assert.equal(entry.archive, `${family}-react-reference-${entry.artifactVersion}.tar.gz`);
    assert.match(entry.sha256, /^[a-f0-9]{64}$/);
    assert.ok(Number.isSafeInteger(entry.bytes) && entry.bytes > 0);
    assert.equal(entry.base, '/');
    assert.equal(entry.readOnlyReference, true);
  }
  return manifest;
}
export function assertMetadata(actual, expected) {
  for (const key of ['family', 'artifactVersion', 'sourceCommit', 'base', 'readOnlyReference'])
    assert.equal(actual[key], expected[key], `Preview ${key} mismatch`);
  assert.deepEqual(actual.preview, expected.preview);
}
export function assertProtection(protection) {
  const checks = protection.required_status_checks;
  assert.equal(checks?.strict, true, 'Require branches to be up to date before merging');
  assert.ok(checks.checks?.some(check => check.context === 'verify' && check.app_id === 15368),
    'Require the verify check from GitHub Actions (app 15368)');
  assert.equal(protection.enforce_admins?.enabled, true, 'Enforce protection for administrators too');
}
export function successfulCloudflareCheck(checks, sha, worker) {
  return checks.find(check => check.head_sha === sha && check.app?.id === 85455 &&
    check.name === `Workers Builds: ${worker}` && check.status === 'completed' && check.conclusion === 'success');
}
export async function api(path, {method = 'GET', body, token = process.env.GH_TOKEN, raw = false, headers = {}} = {}) {
  assert.ok(token, 'GH_TOKEN is required');
  const url = path.startsWith('https://') ? path : `https://api.github.com${path}`;
  assert.ok(['api.github.com', 'uploads.github.com'].includes(new URL(url).hostname));
  const response = await fetch(url, {method, headers: {
    authorization: `Bearer ${token}`, accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28', ...headers,
  }, body: body === undefined ? undefined : raw ? body : JSON.stringify(body), signal: AbortSignal.timeout(60000)});
  if (!response.ok) {
    const error = new Error(`GitHub ${method} ${new URL(url).pathname}: ${response.status} ${await response.text()}`);
    error.status = response.status;
    throw error;
  }
  return response.status === 204 ? null : response.json();
}
export async function optional(path, options) {
  try {return await api(path, options);} catch (error) {if (error.status === 404) return null; throw error;}
}
export async function paginate(path, key) {
  const all = [];
  for (let page = 1; ; page++) {
    const result = await api(`${path}${path.includes('?') ? '&' : '?'}per_page=100&page=${page}`);
    const rows = key ? result[key] : result;
    all.push(...rows);
    if (rows.length < 100) return all;
  }
}
export async function summary(message) {
  console.log(message);
  if (process.env.GITHUB_STEP_SUMMARY) await appendFile(process.env.GITHUB_STEP_SUMMARY, message + '\n');
}
export async function poll(description, check, minutes = 12) {
  const until = Date.now() + minutes * 60000;
  do {
    const result = await check();
    if (result) return result;
    await new Promise(resolve => setTimeout(resolve, 15000));
  } while (Date.now() < until);
  throw new Error(`Timed out waiting for ${description}; rerun to resume. No success is inferred from a merge.`);
}
