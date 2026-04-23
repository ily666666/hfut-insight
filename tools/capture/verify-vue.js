const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1600, height: 900 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(`[pageerror] ${e.message}`));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`[console.error] ${m.text()}`);
  });
  page.on('requestfailed', (req) => {
    errors.push(`[requestfailed] ${req.url()} ${req.failure()?.errorText || ''}`);
  });

  const url = 'http://localhost:5173/monitor/camera';
  console.log('>> goto', url);
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
  } catch (e) {
    console.log('goto error:', e.message);
  }
  await page.waitForTimeout(2000);

  const out = path.resolve(__dirname, 'output', 'vue-live-monitor.png');
  await page.screenshot({ path: out, fullPage: false });
  console.log('>> saved', out);

  const title = await page.title();
  const html = await page.content();
  console.log(`title="${title}" html-length=${html.length}`);
  console.log('rootHtml:', html.slice(html.indexOf('<div id="app"'), html.indexOf('<div id="app"') + 400));

  if (errors.length) {
    console.log('ERRORS:\n' + errors.join('\n'));
  } else {
    console.log('no js/console errors');
  }

  await browser.close();
})();
