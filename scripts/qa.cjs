const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { chromium } = require('playwright');

const base = process.env.QA_URL || 'http://127.0.0.1:4173/';
const pages = fs.readdirSync(path.join(__dirname, '..')).filter(name => name.endsWith('.html'));
const widths = (process.env.QA_WIDTHS || '320,390,768,1024,1440').split(',').map(Number);
const output = process.env.QA_OUTPUT || '/tmp/sunshine-qa';
fs.mkdirSync(output, { recursive: true });

async function main() {
  const browser = await chromium.launch({
    headless: true,
    ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}),
    args: ['--disable-gpu']
  });
  const report = { base, widths, pages: [], failures: [], accessibility: [], links: 0 };
  const links = new Set();
  const ids = {};
  try {
    for (const width of widths) {
      for (const name of pages) {
        const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        page.on('response', response => {
          if (response.url().startsWith(base) && response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);
        });
        try {
          await page.goto(new URL(name, base).href, { waitUntil: 'load' });
          await page.locator('main h1').waitFor();
          await page.evaluate(async () => {
            await document.fonts.ready;
            await Promise.all(Array.from(document.images).map(img => {
              img.loading = 'eager';
              return img.decode().catch(() => {});
            }));
          });
          const state = await page.evaluate(() => ({
            width: innerWidth,
            scroll: document.documentElement.scrollWidth,
            badImages: [...document.images].filter(img => !img.naturalWidth).map(img => img.src),
            headings: document.querySelectorAll('h1').length,
            links: [...document.querySelectorAll('a[href],use[href]')].map(a => new URL(a.getAttribute('href'), location.href).href),
            ids: [...document.querySelectorAll('[id]')].map(el => el.id),
            leakedTemplates: /\{\{/.test(document.body.innerText),
            lang: document.documentElement.lang
          }));
          assert.equal(state.width, width);
          assert.ok(state.scroll <= width + 1, `Horizontal overflow: ${state.scroll}px at ${width}px`);
          assert.deepEqual(state.badImages, []);
          assert.equal(state.headings, 1);
          assert.equal(state.lang, 'en');
          assert.equal(state.leakedTemplates, false);
          assert.deepEqual(errors, []);
          state.links.filter(url => url.startsWith(base)).forEach(url => links.add(url));
          ids[new URL(name, base).pathname] = state.ids;
          if (width === widths[0]) {
            await page.addScriptTag({ path: require.resolve('axe-core/axe.min.js') });
            const result = await page.evaluate(async () => window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] } }));
            report.accessibility.push(...result.violations.map(v => ({ page: name, id: v.id, impact: v.impact, count: v.nodes.length, nodes: v.nodes.slice(0, 4).map(n => ({ html: n.html, summary: n.failureSummary })) })));
          }
          if (width <= 1200) {
            const toggle = page.locator('#hamburger');
            await toggle.click();
            assert.equal(await toggle.getAttribute('aria-expanded'), 'true');
            assert.ok(await page.locator('#mobilemenu').isVisible());
            await page.keyboard.press('Escape');
            assert.equal(await toggle.getAttribute('aria-expanded'), 'false');
          }
          if (['index.html', 'contact.html', 'enrollment.html'].includes(name) && width === widths[0]) {
            const form = page.locator('form');
            assert.equal(await form.evaluate(f => f.checkValidity()), false);
            await form.locator('input[name="parent-name"]').fill('Release QA');
            await form.locator('input[name="email"]').fill('not-an-email');
            assert.equal(await form.evaluate(f => f.checkValidity()), false);
            await form.locator('input[name="email"]').fill('qa@example.com');
            assert.equal(await form.evaluate(f => f.checkValidity()), true);
            // Exercise UI feedback without launching an email client or contacting the business.
            await page.evaluate(() => { window.sunshine.openEmailDraft = event => { event.preventDefault(); return true; }; });
            await form.locator('button[type="submit"]').click();
            assert.match(await page.locator('[role="status"]').innerText(), /Nothing has been sent/);
            assert.equal(await form.locator('input[name="parent-name"]').inputValue(), 'Release QA');
          }
          if (name === 'index.html' && [390, 1440].includes(width)) {
            for (let i = 0; i < 6; i++) {
              await page.locator('.ss-room-node').nth(i).click();
              assert.equal(await page.locator('.ss-room-node').nth(i).getAttribute('aria-pressed'), 'true');
              assert.equal(await page.locator('.ss-room-node[aria-pressed="true"]').count(), 1);
            }
          }
          if (name === 'contact.html' && width === widths[0]) {
            const question = page.locator('.ss-faq-button').nth(1);
            await question.click();
            assert.equal(await question.getAttribute('aria-expanded'), 'true');
            await question.click();
            assert.equal(await question.getAttribute('aria-expanded'), 'false');
          }
          await page.evaluate(() => scrollTo(0, 0));
          await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
          if ([390, 1024, 1440].includes(width)) await page.screenshot({ path: path.join(output, `${name}-${width}.png`) });
          report.pages.push({ name, width, passed: true });
        } catch (error) {
          report.failures.push({ name, width, error: error.message });
          await page.screenshot({ path: path.join(output, `FAIL-${name}-${width}.png`) });
        } finally { await page.close(); }
      }
      console.log(`Reviewed ${pages.length} pages at ${width}px`);
    }
    const context = await browser.newContext();
    for (const url of links) {
      const target = new URL(url);
      const fragment = decodeURIComponent(target.hash.slice(1));
      target.hash = '';
      if (fragment && ids[target.pathname] && !ids[target.pathname].includes(fragment)) report.failures.push({ url, error: 'Missing anchor' });
      const response = await context.request.get(target.href);
      if (!response.ok()) report.failures.push({ url, error: `HTTP ${response.status()}` });
      if (target.pathname.endsWith('.pdf') && !(await response.body()).subarray(0, 5).equals(Buffer.from('%PDF-'))) report.failures.push({ url, error: 'Invalid PDF response' });
      report.links++;
    }
    await context.close();
    const sandbox = { window: { location: {} }, document: { addEventListener() {} } };
    vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../site.js'), 'utf8'), sandbox);
    let prevented = false;
    const field = { value: 'Taylor & family', closest: () => ({ childNodes: [{ textContent: 'Parent name' }] }) };
    const form = { reportValidity: () => true, dataset: { inquiry: 'enrollment' }, querySelectorAll: () => [field] };
    assert.equal(sandbox.window.sunshine.openEmailDraft({ preventDefault() { prevented = true; }, currentTarget: form }), true);
    assert.ok(prevented);
    assert.match(decodeURIComponent(sandbox.window.location.href), /Enrollment inquiry&body=Parent name: Taylor & family/);
    fs.writeFileSync(path.join(output, 'report.json'), JSON.stringify(report, null, 2));
    console.log(JSON.stringify({ renderChecks: report.pages.length, links: report.links, failures: report.failures, accessibility: report.accessibility.map(v => ({ page: v.page, id: v.id, count: v.count })) }, null, 2));
    if (report.failures.length || report.accessibility.length) process.exitCode = 1;
  } finally { await browser.close(); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
