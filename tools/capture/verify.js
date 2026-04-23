/**
 * 验证仿真页面：用与采集原站相同的视口尺寸截图，便于并排比对。
 *
 * 运行：
 *   node verify.js
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const OUTPUT_DIR = path.resolve(__dirname, 'output');
const TARGET = 'http://localhost:5173/';

(async () => {
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1680, height: 960 },
    locale: 'zh-CN',
  });
  const page = await context.newPage();

  console.log('[verify] 打开:', TARGET);
  await page.goto(TARGET, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  await page.screenshot({
    path: path.join(OUTPUT_DIR, 'replica.png'),
    fullPage: false,
  });

  console.log('[verify] 截图已保存:', path.join(OUTPUT_DIR, 'replica.png'));
  await browser.close();
})();
