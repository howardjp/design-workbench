import {test, expect, type Page} from '@playwright/test';

// Authority and scope: docs/grammar-conformance.md. Canonical copies are hash-checked
// before this suite runs. These are reference defaults, not universal app layouts.
type Family = 'martlet' | 'krigsvold';
const reference = (family: Family, query: string) =>
  `http://127.0.0.1:${family === 'martlet' ? 4189 : 4188}/${family}/?${query}`;
async function ready(page: Page) {
  await expect(page.locator('main h1')).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
}

for (const family of ['martlet', 'krigsvold'] as const) {
  test(`${family}: G02: field, group and region relationships survive enlarged text`, async ({page}) => {
    await page.setViewportSize({width: 1440, height: 1000});
    await page.goto(reference(family, 'page=patterns'));
    const form = page.getByRole('form', {name: 'Publication request'});
    for (const size of [100, 200]) {
      await page.addStyleTag({content: `html {font-size:${size}% !important}`});
      const relationships = await form.evaluate((element, family) => {
        const field = element.querySelector(`.${family}-field`)!;
        const label = field.querySelector('label')!;
        const input = field.querySelector('input')!;
        const hint = field.querySelector(`.${family}-hint`)!;
        const next = field.nextElementSibling!;
        const groups = element.querySelector('.reference-form-groups')!;
        const rect = (e: Element) => e.getBoundingClientRect();
        return {
          rem: parseFloat(getComputedStyle(document.documentElement).fontSize),
          labelToInput: rect(input).top - rect(label).bottom,
          inputToHint: rect(hint).top - rect(input).bottom,
          fieldToField: rect(next).top - rect(field).bottom,
          groupToGroup: parseFloat(getComputedStyle(groups).rowGap),
          hintOwned: (input.getAttribute('aria-describedby') ?? '').split(' ').includes(hint.id),
        };
      }, family);
      expect(relationships.hintOwned).toBe(true);
      for (const localGap of [relationships.labelToInput, relationships.inputToHint]) {
        expect(localGap).toBeCloseTo(0.5 * relationships.rem, 0);
      }
      expect(relationships.fieldToField).toBeCloseTo(1.5 * relationships.rem, 0);
      expect(relationships.groupToGroup).toBeCloseTo((family === 'martlet' ? 2.5 : 3) * relationships.rem, 0);
      expect(relationships.fieldToField).toBeGreaterThan(relationships.inputToHint);
      expect(relationships.groupToGroup).toBeGreaterThan(relationships.fieldToField);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
  });

  test(`${family}: G04: loaded type roles preserve family hierarchy`, async ({page}) => {
    await page.setViewportSize({width: 1440, height: 1000});
    for (const mode of ['light', 'dark']) {
      await page.goto(reference(family, `page=patterns&mode=${mode}`));
      await ready(page);
      const roles = await page.evaluate((family) => {
        const style = (selector: string) => {
          const s = getComputedStyle(document.querySelector(selector)!);
          return {family: s.fontFamily, weight: s.fontWeight, transform: s.textTransform};
        };
        const fonts = [...document.fonts].filter(f => f.status === 'loaded').map(f => f.family.replaceAll('"', ''));
        return {
          heading: style('main h1'),
          input: style('input[required]'),
          brand: style(`.${family}-reference-brand`),
          fonts,
        };
      }, family);
      const heading = family === 'martlet' ? 'Cambo' : 'Roboto Slab';
      const ui = family === 'martlet' ? 'Lato' : 'Roboto';
      const identity = family === 'martlet' ? 'Cinzel' : 'Roboto Slab';
      expect(roles.heading.family.split(',')[0].replaceAll('"', '')).toBe(heading);
      expect(roles.heading.weight).toBe(family === 'martlet' ? '400' : '700');
      expect(roles.input.family.split(',')[0].replaceAll('"', '')).toBe(ui);
      expect(roles.brand.family.split(',')[0].replaceAll('"', '')).toBe(identity);
      for (const font of [heading, ui, identity]) expect(roles.fonts).toContain(font);
    }
  });

  test(`${family}: G14: contents retain parent and child hierarchy`, async ({page}) => {
    await page.goto(reference(family, 'component=TableOfContents'));
    const contents = page.locator(`.${family}-contents`).filter({has: page.getByRole('link', {name: 'Purpose', exact: true})});
    await expect(contents).toBeVisible();
    await expect(contents.locator('ol')).toHaveCount(0);
    const parent = contents.locator('li[data-depth="2"]');
    const child = contents.locator('li[data-depth="3"]');
    await expect(parent.getByRole('link', {name: 'Purpose', exact: true})).toHaveAttribute('href', '#example-purpose');
    await expect(child.getByRole('link', {name: 'Practice', exact: true})).toHaveAttribute('href', '#example-practice');
    for (const width of [1440, 320]) {
      await page.setViewportSize({width, height: 1000});
      const hierarchy = await contents.evaluate(e => {
        const parent = e.querySelector('[data-depth="2"]')!;
        const child = e.querySelector('[data-depth="3"]')!;
        return {
          parentWeight: +getComputedStyle(parent).fontWeight,
          childWeight: +getComputedStyle(child).fontWeight,
          parentX: parent.getBoundingClientRect().left,
          childX: child.getBoundingClientRect().left + parseFloat(getComputedStyle(child).paddingInlineStart),
        };
      });
      expect(hierarchy.parentWeight).toBeGreaterThan(hierarchy.childWeight);
      expect(hierarchy.childX).toBeGreaterThan(hierarchy.parentX);
      await expect(child.getByRole('link')).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
  });

  test(`${family}: G14: footer preserves identity and grouped destinations`, async ({page}) => {
    await page.goto(reference(family, 'page=patterns'));
    const footer = page.locator(`.${family}-master-site-footer`);
    await expect(footer.getByRole('link', {name:'James Howard website'})).toHaveAttribute('href','https://jameshoward.us/');
    await expect(footer).toContainText('A website of James Howard');
    await expect(footer).toContainText(`react.${family}design.dev`);
    await expect(footer.getByRole('link',{name:'React reference',exact:true})).toHaveAttribute('href',`https://react.${family}design.dev/`);
    const heading = await footer.locator('h2').first().evaluate(e => {
      const s = getComputedStyle(e);
      return {family:s.fontFamily, weight:s.fontWeight, size:s.fontSize, leading:s.lineHeight, smoothing:s.getPropertyValue('-webkit-font-smoothing')};
    });
    // Rendered origin cascades, rather than agreement between two translations.
    expect(heading.weight).toBe(family === 'martlet' ? '400' : '600');
    if(family === 'krigsvold' && heading.smoothing) expect(heading.smoothing).toBe('antialiased');
    expect(heading.family).toContain(family === 'martlet' ? 'Cambo' : 'Roboto');
    expect(parseFloat(heading.leading)).toBeCloseTo(family === 'martlet' ? 17.3696 : 15.808, 1);

    for (const width of [1440, 320]) {
      await page.setViewportSize({width, height: 1000});
      await footer.scrollIntoViewIfNeeded();
      const base = footer.locator(`.${family}-master-footer-${family === 'martlet' ? 'bottom' : 'base'}`);
      if(family === 'martlet' && width===1440) {
        const centers=await base.evaluate(e=>Array.from(e.children).map(child=>{const r=child.getBoundingClientRect();return r.top+r.height/2;}));
        expect(Math.abs(centers[0]-centers[1])).toBeLessThan(1);
      }

      await expect(base).toContainText('James P. Howard, II');
      const groups = footer.locator(`.${family}-master-footer-grid`);
      const geometry = await groups.evaluate(e => {
        const regions = [...e.children].map(child => {
          const r = child.getBoundingClientRect();
          return {left: r.left, right: r.right, top: r.top, bottom: r.bottom};
        });
        return {regions, width: document.documentElement.clientWidth};
      });
      expect(geometry.regions.length).toBe(family === 'martlet' ? 3 : 5);
      for (const region of geometry.regions) {
        expect(region.left).toBeGreaterThanOrEqual(0);
        expect(region.right).toBeLessThanOrEqual(geometry.width + 1);
      }
      for (let a = 0; a < geometry.regions.length; a++) for (let b = a + 1; b < geometry.regions.length; b++) {
        const first = geometry.regions[a], second = geometry.regions[b];
        const overlapX = Math.min(first.right, second.right) - Math.max(first.left, second.left);
        const overlapY = Math.min(first.bottom, second.bottom) - Math.max(first.top, second.top);
        expect(overlapX > 1 && overlapY > 1, 'Footer groups must not overlap').toBe(false);
      }
      expect((await base.boundingBox())!.y).toBeGreaterThan((await groups.boundingBox())!.y);
      await expect(footer.getByRole('link').first()).toBeVisible();
    }
  });
}

test('krigsvold: G05: popup becomes an in-flow mobile submenu', async ({page}) => {
  await page.setViewportSize({width: 1440, height: 1000});
  await page.goto(reference('krigsvold', 'mode=dark'));
  const header = page.locator('.krigsvold-app-header');
  const disclosure = header.locator('details').first();
  const summary = disclosure.locator('summary');
  const popup = disclosure.locator('.krigsvold-reference-menu');
  await summary.click();
  await expect(popup).toBeVisible();
  const desktop = await popup.evaluate(e => ({bg: getComputedStyle(e).backgroundColor, position: getComputedStyle(e).position}));
  expect(desktop).toEqual({bg: 'rgb(255, 255, 255)', position: 'absolute'});
  await page.keyboard.press('Escape');
  await expect(summary).toBeFocused();
  await expect(popup).not.toBeVisible();
  await page.setViewportSize({width: 320, height: 1000});
  await header.getByRole('button', {name: 'Menu', exact: true}).click();
  await summary.click();
  await expect(popup).toBeVisible();
  const mobile = await popup.evaluate(e => ({bg: getComputedStyle(e).backgroundColor, position: getComputedStyle(e).position, shadow: getComputedStyle(e).boxShadow}));
  expect(mobile).toEqual({bg: 'rgba(0, 0, 0, 0)', position: 'static', shadow: 'none'});
  await page.keyboard.press('Escape');
  await expect(header.getByRole('button', {name: 'Menu', exact: true})).toBeFocused();
  await expect(popup).not.toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
