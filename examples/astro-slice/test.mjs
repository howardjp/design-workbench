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
      try { const data=await readFile(file); const mime={'.html':'text/html','.css':'text/css','.woff2':'font/woff2','.woff':'font/woff','.svg':'image/svg+xml','.js':'text/javascript'}; res.writeHead(200, {'Content-Type':mime[extname(file)] || 'application/octet-stream'}).end(data); } catch { res.writeHead(404).end(); }
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
            const row = page.locator(`section[aria-labelledby="${section.id}"] li`).filter({has:page.locator('a').filter({hasText:item.title})});
            assert.equal(await row.locator('p').last().textContent(), item.summary);
            if (item.date) assert.equal(await row.locator('time').getAttribute('datetime'), item.date);
            if (item.tag) assert.match(await row.textContent(), new RegExp(item.tag));
          }
          if (section.kind === 'figure') {
            const figure=page.locator(`section[aria-labelledby="${section.id}"] figure`);
            const image=figure.locator('img');
            assert.equal(await image.getAttribute('alt'), section.alt);
            assert.equal(await figure.locator('figcaption').textContent(), section.caption);
            assert.ok((await image.getAttribute('src')).startsWith(`${base}_astro/`));
            await image.scrollIntoViewIfNeeded();
            await page.waitForFunction(img=>img.complete && img.naturalWidth>0,await image.elementHandle());
          }
          if (section.kind === 'table') {
            const table=page.locator(`section[aria-labelledby="${section.id}"] table`);
            assert.equal(await table.locator('caption').innerText(), section.title);
            assert.deepEqual(await table.locator('thead th').allTextContents(), section.headers);
            for (let i=0; i<section.rows.length; i++) assert.deepEqual(await table.locator('tbody tr').nth(i).locator('th, td').allTextContents(), section.rows[i]);
          }
          if (section.kind === 'facts') for (const fact of section.facts) {
            const row=page.locator(`section[aria-labelledby="${section.id}"] dl > div`).filter({has:page.getByText(fact.label,{exact:true})});
            assert.equal(await row.locator('dd').innerText(),fact.value);
          }
          for (const link of [...(section.actions ?? []), ...(section.items ?? []).filter(i=>i.url).map(i=>({label:i.title,url:i.url}))]) {
            assert.equal(await page.locator(`section[aria-labelledby="${section.id}"] a`).filter({hasText:link.label}).getAttribute('href'),base.replace(/\/$/,'')+link.url);
            assert.ok(catalog.pages.some(p => link.url === `/examples/${p.id}/`), `Unknown catalog destination ${link.url}`);
          }
        }
        assert.deepEqual(missing, [], 'Page resources must load');
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'No horizontal overflow at 320px');
        if (record.id === 'home') {
          const menu=page.getByRole('button',{name:'Menu',exact:true});
          const nav=page.getByRole('navigation',{name:'Primary navigation'});
          assert.equal(await nav.isVisible(),false);
          await menu.focus(); await page.keyboard.press('Enter');
          assert.equal(await menu.getAttribute('aria-expanded'),'true');
          assert.equal(await nav.isVisible(),true);
          await page.keyboard.press('Escape');
          assert.equal(await nav.isVisible(),false);
          assert.equal(await menu.evaluate(el=>el===document.activeElement),true);
          await menu.click(); await page.getByRole('button',{name:'Dark mode'}).click();
          assert.equal(await page.locator('html').getAttribute(`data-${family}`),'dark');
          await page.reload();
          assert.equal(await page.locator('html').getAttribute(`data-${family}`),'dark');
          await menu.click();
          assert.equal(await page.getByRole('button',{name:'Light mode'}).getAttribute('aria-pressed'),'true');
          await page.evaluate(() => Promise.all(document.getAnimations().map(animation => animation.finished.catch(() => {}))));
          const darkAxe=await new AxeBuilder({page}).analyze();
          assert.deepEqual(darkAxe.violations.map(({id,nodes})=>({id,html:nodes.map(n=>n.html)})), [], `Dark axe: ${family} ${base}`);
          await page.getByRole('button',{name:'Light mode'}).click();
          assert.equal(await page.locator('html').getAttribute(`data-${family}`),'light');
          await page.evaluate(() => Promise.all(document.getAnimations().map(animation => animation.finished.catch(() => {}))));
          if (family === 'krigsvold') {
            const backgrounds=await page.locator('#welcome ~ .recipe-actions a').evaluateAll(nodes=>nodes.map(node=>getComputedStyle(node).backgroundColor));
            assert.equal(backgrounds.length,2);
            assert.notEqual(backgrounds[0],backgrounds[1], 'Secondary action must retain its outline treatment');
            await page.setViewportSize({width:1440,height:900});
            const label=await page.locator('#welcome').boundingBox();
            const content=await page.locator('#welcome ~ .recipe-prose').boundingBox();
            assert.ok(label && content && content.x > label.x + label.width, 'Desktop region label precedes its content');
            await page.setViewportSize({width:320,height:800});
          }
        }
        if (['home','guide','person','article','event','archive','search','contact','sign-up','two-factor','gallery','collection-item','workspace','fleet','chat'].includes(record.id)) {
          const results=await new AxeBuilder({page}).analyze();
          assert.deepEqual(results.violations.map(({id,nodes})=>({id,html:nodes.map(n=>n.html)})), [], `Axe violations: ${family} ${base} ${record.id}`);
        }
        if (record.id === 'article') {
          assert.equal(await page.locator(`time[datetime="${record.date}"]`).count(),1);
          assert.ok((await page.locator('main').innerText()).includes(record.author));
          for (const tag of record.tags) assert.equal(await page.getByRole('link',{name:tag,exact:true}).getAttribute('href'), `${base}examples/categories/`);
          assert.equal(await page.getByRole('link',{name:'All writing'}).getAttribute('href'), `${base}examples/archive/`);
        }
        if (['workspace','fleet'].includes(record.id)) {
          const fixture=record.sections.find(section=>section.kind==='workspace').items;
          const workspace=page.locator('[data-workspace]');
          const rows=workspace.locator('[data-record]');
          const filter=workspace.getByLabel('Filter records');
          const review=workspace.getByRole('button',{name:'Mark reviewed locally'});
          const reset=workspace.getByRole('button',{name:'Reset demonstration'});
          let requests=0; page.on('request',()=>requests++);
          assert.equal(await rows.count(),fixture.length);
          assert.equal(await workspace.locator('[data-record-count]').textContent(),`${fixture.length} of ${fixture.length} records shown.`);
          assert.equal(await review.isDisabled(),true);
          await rows.nth(1).getByRole('button',{name:fixture[1].title}).focus();
          await page.keyboard.press('Enter');
          assert.equal(await rows.nth(1).getByRole('button',{name:fixture[1].title}).getAttribute('aria-pressed'),'true');
          assert.ok((await workspace.locator('[data-active-record]').textContent()).includes(fixture[1].summary));
          await review.click();
          assert.equal(await rows.nth(1).locator('[data-record-status]').textContent(),'Reviewed locally');
          assert.equal(await workspace.locator('[data-workspace-status]').textContent(),'Marked reviewed in page memory. No server record was changed.');
          await filter.fill(fixture[0].title);
          assert.equal(await rows.locator(':scope:visible').count(),1);
          assert.equal(await review.isDisabled(),true);
          assert.ok((await workspace.locator('[data-active-record]').textContent()).includes('outside this filter'));
          await reset.click();
          assert.equal(await rows.nth(1).locator('[data-record-status]').textContent(),fixture[1].status);
          assert.equal(await filter.inputValue(),'');
          assert.equal(await rows.locator(':scope:visible').count(),fixture.length);
          assert.equal(requests,0);
        }
        if (record.id === 'chat') {
          const form=page.locator('[data-chat]');
          const input=form.getByLabel('Message');
          const list=page.locator('[data-messages]');
          let requests=0; page.on('request',()=>requests++);
          assert.equal(await list.locator('li').count(),2);
          await input.fill('   ');
          await form.getByRole('button',{name:'Add to this preview'}).click();
          assert.equal(await input.evaluate(el=>el.validity.customError),true);
          assert.equal(await list.locator('li').count(),2);
          await input.fill('<img src=x onerror=alert(1)>');
          await form.getByRole('button',{name:'Add to this preview'}).click();
          assert.equal(await list.locator('li').count(),3);
          assert.equal(await list.locator('li').last().locator('p').textContent(),'<img src=x onerror=alert(1)>');
          assert.equal(await list.locator('img').count(),0);
          assert.equal(await input.inputValue(),'');
          assert.equal(await input.evaluate(el=>el===document.activeElement),true);
          assert.equal(await form.locator('[data-chat-status]').textContent(),'Added to this preview. Not sent to anyone; cleared when you leave or reload.');
          await form.getByRole('button',{name:'Reset conversation'}).click();
          assert.equal(await list.locator('li').count(),2);
          assert.equal(await form.locator('[data-chat-status]').textContent(),'Conversation reset. Nothing was delivered.');
          assert.equal(requests,0);
        }
        if (record.id === 'reference') {
          assert.equal(await page.locator(`time[datetime="${record.date}"]`).count(),1);
          assert.ok((await page.locator('main').innerText()).includes(record.author));
          assert.equal(await page.locator('#example + .recipe-prose pre code').count(),1);
        }
        if (record.id === 'gallery') {
          const entries=record.sections.find(s=>s.kind==='gallery').items;
          const gallery=page.locator('[data-gallery]');
          const links=gallery.locator('[data-enlarge]');
          assert.equal(await links.count(),entries.length);
          for (let i=0; i<entries.length; i++) {
            const image=links.nth(i).locator('img');
            assert.equal(await image.getAttribute('alt'),entries[i].alt);
            assert.equal(await image.evaluate(el=>el.closest('figure').querySelector('figcaption').textContent),entries[i].caption);
            assert.ok((await links.nth(i).getAttribute('href')).startsWith(`${base}_astro/`));
            await image.scrollIntoViewIfNeeded();
            await page.waitForFunction(img=>img.complete && img.naturalWidth>0,await image.elementHandle());
          }
          await links.first().focus();
          await page.keyboard.press('Enter');
          const dialog=page.getByRole('dialog',{name:'Image detail'});
          assert.equal(await dialog.isVisible(),true);
          assert.equal(await dialog.locator('img').getAttribute('alt'),entries[0].alt);
          assert.equal(await dialog.locator('figcaption').textContent(),entries[0].caption);
          const dialogAxe=await new AxeBuilder({page}).analyze();
          assert.deepEqual(dialogAxe.violations.map(({id})=>id),[], 'Gallery dialog axe violations');
          await page.keyboard.press('Escape');
          assert.equal(await dialog.isVisible(),false);
          assert.equal(await links.first().evaluate(el=>el===document.activeElement),true);
          await links.nth(1).click();
          assert.equal(await dialog.locator('img').getAttribute('alt'),entries[1].alt);
          await dialog.getByRole('button',{name:'Close image'}).click();
          assert.equal(await dialog.isVisible(),false);
          assert.equal(await links.nth(1).evaluate(el=>el===document.activeElement),true);
        }
        if (record.id === 'event') {
          for (const value of [record.event.start, record.event.end]) assert.equal(await page.locator(`time[datetime="${value}"]`).count(),1);
          for (const value of [record.event.location,record.event.registration,record.event.timezone]) assert.ok((await page.locator('aside').innerText()).includes(value));
        }
        if (record.id === 'archive') {
          const nav = page.locator('[data-pagination]');
          assert.equal(await page.locator('[data-list-item]:visible').count(), 3);
          assert.equal(await nav.locator('[data-page-status]').innerText(), 'Page 1 of 2');
          assert.equal(await nav.locator('[data-previous]').isDisabled(), true);
          await nav.locator('[data-next]').focus();
          await page.keyboard.press('Enter');
          assert.equal(await nav.locator('[data-page-status]').innerText(), 'Page 2 of 2');
          assert.equal(await page.locator('[data-list-item]:visible').count(), 3);
          assert.equal(await nav.locator('[data-next]').isDisabled(), true);
          assert.equal(await nav.locator('[data-previous]').evaluate(el=>el===document.activeElement), true);
          await page.emulateMedia({media:'print'});
          assert.equal(await page.locator('[data-list-item]:visible').count(), 6);
          assert.equal(await nav.isVisible(), false);
          await page.emulateMedia({media:'screen'});
          await nav.locator('[data-previous]').click();
          assert.equal(await nav.locator('[data-page-status]').innerText(), 'Page 1 of 2');
        }
        if (record.id === 'search') {
          await page.goto(`${origin}${base}examples/search/?q=Conditions%20at%20the%20station`);
          const query=page.getByLabel('Search the example record');
          assert.equal(await query.inputValue(), 'Conditions at the station');
          const unavailable=page.locator('[data-search-results] li').filter({hasText:'Conditions at the station'});
          assert.equal(await unavailable.locator('a').count(),0);
          assert.equal(await unavailable.locator('[data-destination]').getAttribute('data-destination'), `${base}examples/sensors/`);
          assert.equal(await unavailable.getByText('Not yet available in this Astro preview.').count(),1);
          await query.fill('shoreline');
          await page.getByRole('button',{name:'Search',exact:true}).click();
          const matching=catalog.pages.filter(entry=>`${entry.title} ${entry.summary} ${entry.category}`.toLocaleLowerCase().includes('shoreline'));
          assert.equal(await page.locator('[data-search-results] li').count(), matching.length);
          assert.equal(new URL(page.url()).searchParams.get('q'), 'shoreline');
          for (const entry of matching) {
            const heading = page.locator('[data-search-results]').getByRole('heading',{name:entry.title,exact:true});
            if (supported.includes(entry.id)) assert.equal(await heading.getByRole('link',{name:entry.title,exact:true}).getAttribute('href'), `${base}examples/${entry.id}/`);
            else { assert.equal(await heading.locator('a').count(),0); assert.equal(await heading.locator('span').getAttribute('data-destination'), `${base}examples/${entry.id}/`); }
          }
          await query.fill('<img src=x onerror=alert(1)>');
          await page.getByRole('button',{name:'Search',exact:true}).click();
          assert.equal(await page.locator('[data-search-results] img').count(),0);
          assert.ok((await page.locator('[data-search-status]').textContent()).includes('<img src=x onerror=alert(1)>'));
          await page.goto(`${origin}${base}examples/search/?q=${'x'.repeat(250)}`);
          assert.equal((await query.inputValue()).length, 200);
          assert.equal(new URL(page.url()).searchParams.get('q').length, 200);
          await query.fill('');
          await page.getByRole('button',{name:'Search',exact:true}).click();
          assert.equal(new URL(page.url()).searchParams.has('q'), false);
          assert.equal(await page.locator('[data-search-results] li').count(),0);
        }
        if (['contact','sign-in','sign-up','password-reset','two-factor','coming-soon'].includes(record.id)) {
          const form=page.locator('[data-demo-form]');
          assert.equal(await form.getByRole('button',{name:'Validate example'}).isDisabled(),false);
          if (family === 'krigsvold') {
            const resetBg = await form.getByRole('button',{name:'Clear'}).evaluate(el=>getComputedStyle(el).backgroundColor);
            assert.equal(resetBg, 'rgba(0, 0, 0, 0)');
          }
          const pageUrl=page.url();
          let requests=0; page.on('request',()=>requests++);
          await form.getByRole('button',{name:'Validate example'}).click();
          assert.equal(await form.evaluate(el=>el.checkValidity()),false);
          assert.equal(await form.locator('[data-form-status]').textContent(),'');
          if (['contact','sign-up'].includes(record.id)) await form.getByLabel('Name',{exact:true}).fill('Example Person');
          if (record.id !== 'two-factor') await form.getByLabel('Email address').fill('example@example.test');
          if (['sign-in','sign-up'].includes(record.id)) {
            await form.getByLabel('Example password').fill('short');
            assert.equal(await form.getByLabel('Example password').evaluate(el=>el.checkValidity()),false);
            await form.getByLabel('Example password').fill('invented-password');
          }
          if (record.id === 'two-factor') {
            await form.getByLabel('Six-digit example code').fill('123');
            assert.equal(await form.getByLabel('Six-digit example code').evaluate(el=>el.checkValidity()),false);
            await form.getByLabel('Six-digit example code').fill('123456');
          }
          if (record.id === 'contact') await form.getByLabel('Message').fill('An invented message.');
          if (['coming-soon','sign-up'].includes(record.id)) await form.getByLabel('I understand this is a local demonstration.').check();
          await form.getByRole('button',{name:'Validate example'}).click();
          assert.equal(await form.locator('[data-form-status]').textContent(),'Example validated locally. Nothing was sent, saved, or authenticated.');
          if (['sign-in','sign-up'].includes(record.id)) assert.equal(await form.getByLabel('Example password').inputValue(),'');
          if (record.id === 'two-factor') assert.equal(await form.getByLabel('Six-digit example code').inputValue(),'');
          assert.equal(page.url(),pageUrl);
          assert.equal(requests,0);
          await form.getByRole('button',{name:'Clear'}).click();
          assert.equal(await form.locator('[data-form-status]').textContent(),'');
        }
        if (record.id === 'guide') assert.equal(await page.locator('#arrival + .recipe-prose ol li').count(),4);
        if (record.id === 'opportunity') assert.equal(await page.locator('#requirements + .recipe-prose ul li').count(),3);
        if (record.id === 'changelog') assert.equal(await page.locator('#v1-2 + .recipe-prose h3').count(),2);
        await context.close();
      }
      const indexContext=await browser.newContext({viewport:{width:320,height:800}});
      const indexPage=await indexContext.newPage();
      await indexPage.goto(`${origin}${base}examples/`);
      assert.equal(await indexPage.locator('h1').count(), 1);
      assert.equal(await indexPage.locator('.catalog h3').count(), catalog.pages.length);
      for (const entry of catalog.pages) {
        const heading = indexPage.locator('.catalog').getByRole('heading',{name:entry.title,exact:true});
        if (supported.includes(entry.id)) assert.equal(await heading.getByRole('link',{name:entry.title,exact:true}).getAttribute('href'), `${base}examples/${entry.id}/`);
        else { assert.equal(await heading.locator('a').count(),0); assert.equal(await heading.locator('span').getAttribute('data-destination'), `${base}examples/${entry.id}/`); }
      }
      const indexAxe=await new AxeBuilder({page:indexPage}).analyze();
      assert.deepEqual(indexAxe.violations.map(({id,nodes})=>({id,html:nodes.map(n=>n.html)})), [], `Axe violations: ${family} ${base} catalog index`);
      assert.equal(await indexPage.getByText('Not yet available in this Astro preview.',{exact:true}).count(), catalog.pages.length-supported.length);
      assert.equal(await indexPage.evaluate(()=>document.documentElement.scrollWidth <= innerWidth), true);
      await indexContext.close();
      const noJs=await browser.newContext({javaScriptEnabled:false});
      const staticPage=await noJs.newPage();
      await staticPage.goto(`${origin}${base}examples/archive/`);
      assert.equal(await staticPage.getByRole('navigation',{name:'Primary navigation'}).isVisible(), true);
      assert.equal(await staticPage.locator('[data-list-item]:visible').count(), 6);
      assert.equal(await staticPage.locator('[data-pagination]').isVisible(), false);
      await staticPage.goto(`${origin}${base}examples/search/`);
      assert.equal(await staticPage.getByRole('link',{name:'Browse the complete example index'}).getAttribute('href'), `${base}examples/`);
      await staticPage.goto(`${origin}${base}examples/gallery/`);
      const staticImageLink=staticPage.locator('[data-enlarge]').first();
      const staticImageHref=await staticImageLink.getAttribute('href');
      assert.ok(staticImageHref.startsWith(`${base}_astro/`));
      assert.equal((await staticPage.request.get(`${origin}${staticImageHref}`)).status(),200);
      await staticPage.goto(`${origin}${base}examples/sign-in/`);
      assert.equal(await staticPage.locator('[data-demo-fields] input').first().isDisabled(),true);
      assert.equal(await staticPage.getByRole('button',{name:'Validate example'}).isDisabled(),true);
      assert.match(await staticPage.locator('noscript').textContent(), /JavaScript is needed for local form validation/);
      await staticPage.goto(`${origin}${base}examples/workspace/`);
      assert.equal(await staticPage.locator('[data-record]').count(),3);
      assert.equal(await staticPage.getByLabel('Filter records').isDisabled(),true);
      assert.equal(await staticPage.locator('[data-select-record]').first().isDisabled(),true);
      await staticPage.goto(`${origin}${base}examples/chat/`);
      assert.equal(await staticPage.locator('[data-messages] li').count(),2);
      assert.equal(await staticPage.getByLabel('Message').isDisabled(),true);
      await noJs.close();
      console.log(`${family} ${base}: ${pages.length} pages; content, routes, pagination, print, no-JS and representative axe passed`);
    } finally { server.closeAllConnections(); await new Promise(r=>server.close(r)); }
  }
} finally { await browser.close(); }
