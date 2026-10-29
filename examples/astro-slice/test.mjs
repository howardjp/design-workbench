import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createServer } from 'node:http';
import { readFile, readdir } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import catalog from '../page-archetypes/content/catalog.json' with { type: 'json' };
import { supported } from './src/supported.mjs';
import { renderMarkdown } from './src/markdown.mjs';
assert.match(renderMarkdown('[local](/examples/about/)', '/preview/'), /href="\/preview\/examples\/about\/"/);
assert.match(renderMarkdown('![view](/images/view.svg)', '/preview/'), /src="\/preview\/images\/view.svg"/);
assert.doesNotMatch(renderMarkdown('[bad](javascript:alert(1))'), /href=/);
assert.doesNotMatch(renderMarkdown('<script>alert(1)</script>'), /<script>/);

const pages = catalog.pages.filter(page => supported.includes(page.id));
const browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_PATH ? {executablePath: process.env.CHROMIUM_PATH} : {}) });
try {
  for (const family of ['martlet', 'krigsvold']) for (const base of ['/', '/preview/']) {
    const built = spawnSync('npm', ['run', 'build'], {env: {...process.env, ASTRO_TELEMETRY_DISABLED:'1', NIGHTJAR_FAMILY:family, NIGHTJAR_BASE:base}, encoding:'utf8'});
    if (built.status !== 0) throw new Error(built.stdout + built.stderr);
    const directory = resolve('dist', family);
    const cssDir = resolve(directory, '_astro');
    const styles = (await Promise.all((await readdir(cssDir)).filter(x=>x.endsWith('.css')).map(x=>readFile(resolve(cssDir,x),'utf8')))).join('\n');
    assert.match(styles, new RegExp(family));
    assert.doesNotMatch(styles, new RegExp(family === 'martlet' ? 'krigsvold' : 'martlet'));
    const server = createServer(async (req, res) => {
      const url = new URL(req.url, 'http://localhost');
      if (!url.pathname.startsWith(base)) { res.writeHead(404).end(); return; }
      const rel = decodeURIComponent(url.pathname.slice(base.length));
      const file = resolve(directory, rel.endsWith('/') ? rel+'index.html' : rel);
      if (!file.startsWith(directory + '/')) { res.writeHead(403).end(); return; }
      try { const data=await readFile(file); const mime={'.html':'text/html','.css':'text/css','.woff2':'font/woff2','.woff':'font/woff','.svg':'image/svg+xml'}; res.writeHead(200, {'Content-Type':mime[extname(file)] || 'application/octet-stream'}).end(data); } catch { res.writeHead(404).end(); }
    });
    await new Promise(r=>server.listen(0,'127.0.0.1',r));
    try {
      const origin=`http://127.0.0.1:${server.address().port}`;
      for (const record of pages) {
        const context=await browser.newContext({viewport:{width:320,height:800}});
        const page=await context.newPage();
        const missing=[];
        page.on('response', response=>{ if(response.status() >= 400) missing.push(response.url()); });
        await page.goto(`${origin}${base}examples/${record.id}/`, {waitUntil:'load'});
        await page.evaluate(() => document.fonts.ready);
        assert.equal(await page.locator('h1').count(),1);
        assert.equal(await page.locator('h1').innerText(),record.title);
        assert.equal(await page.locator('main').count(),1);
        assert.equal(await page.locator(`[data-example="${record.id}"]`).count(),1);
        for (const section of record.sections) {
          assert.equal(await page.locator(`section[aria-labelledby="${section.id}"] h2`).innerText(),section.title);
          if (section.body) {
            const expected = await page.evaluate(html => { const d = document.createElement('div'); d.innerHTML = html; return d.textContent.replace(/\s+/g,' ').trim(); }, renderMarkdown(section.body, base));
            const actual = (await page.locator(`section[aria-labelledby="${section.id}"] .recipe-prose`).textContent()).replace(/\s+/g,' ').trim();
            assert.equal(actual, expected);
          }
          if (section.kind === 'listing') for (const item of section.items) {
            const row = page.locator(`section[aria-labelledby="${section.id}"] li`).filter({has:page.getByRole('link',{name:item.title,exact:true})});
            assert.equal(await row.locator('p').last().innerText(), item.summary);
            if (item.date) assert.equal(await row.locator('time').getAttribute('datetime'), item.date);
            if (item.tag) assert.match(await row.innerText(), new RegExp(item.tag));
          }
          if (section.kind === 'facts') for (const fact of section.facts) {
            const row=page.locator(`section[aria-labelledby="${section.id}"] dl > div`).filter({has:page.getByText(fact.label,{exact:true})});
            assert.equal(await row.locator('dd').innerText(),fact.value);
          }
          for (const link of [...(section.actions ?? []), ...(section.items ?? []).map(i=>({label:i.title,url:i.url}))]) {
            assert.equal(await page.locator(`section[aria-labelledby="${section.id}"]`).getByRole('link',{name:link.label,exact:true}).getAttribute('href'),base.replace(/\/$/,'')+link.url);
            assert.ok(catalog.pages.some(p => link.url === `/examples/${p.id}/`), `Unknown catalog destination ${link.url}`);
          }
        }
        assert.deepEqual(missing, [], 'Page resources must load');
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'No horizontal overflow at 320px');
        if (['home','guide','person'].includes(record.id)) {
          const results=await new AxeBuilder({page}).analyze();
          assert.deepEqual(results.violations.map(({id})=>id), [], 'Axe violations');
        }
        if (record.id === 'guide') assert.equal(await page.locator('#arrival + .recipe-prose ol li').count(),4);
        if (record.id === 'opportunity') assert.equal(await page.locator('#requirements + .recipe-prose ul li').count(),3);
        if (record.id === 'changelog') assert.equal(await page.locator('#v1-2 + .recipe-prose h3').count(),2);
        await context.close();
      }
      console.log(`${family} ${base}: 17 pages, content, routes, assets and 320px; representative axe passed`);
    } finally { server.closeAllConnections(); await new Promise(r=>server.close(r)); }
  }
} finally { await browser.close(); }
