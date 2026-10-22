import {chromium, expect} from '@playwright/test';
import {openRegistry} from '../server/store.mjs';
import {createWorkbenchServer} from '../server/http.mjs';
import {resolve} from 'node:path';
import {mkdirSync} from 'node:fs';
const root = new URL('../', import.meta.url).pathname;
mkdirSync(resolve(root, 'docs/qa'), {recursive: true});
const store = openRegistry(':memory:');
const server = createWorkbenchServer({store, dist: resolve(root, 'dist')});
await new Promise(done => server.listen(0, '127.0.0.1', done));
const url = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch(process.env.PLAYWRIGHT_EXECUTABLE_PATH ? {executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH, args: ['--no-sandbox']} : {});
try {
  for (const family of ['martlet', 'krigsvold']) {
    const page = await browser.newPage({viewport: {width: 1440, height: 1000}});
    await page.goto(`${url}/${family}/?view=overview`);
    await expect(page.getByRole('heading', {name: 'System overview', exact: true})).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({path: resolve(root, `docs/qa/${family}-current-overview.png`), fullPage: true});
    await page.goto(`${url}/${family}/?view=settings`);
    await page.getByRole('tab', {name: 'Draft recovery', exact: true}).click();
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({path: resolve(root, `docs/qa/${family}-settings.png`), fullPage: true});
    await page.close();
  }
} finally {
  await browser.close();
  await new Promise(done => {server.close(done);server.closeAllConnections();});
  store.close();
}
