/**
 * 本地采集脚本：自动登录百度一见，采集监控中心摄像头及相关页面。
 *
 * 运行：
 *   npm install
 *   npx playwright install chromium
 *   npm run capture
 *
 * 采集产物保存在 output/ 目录：
 *   login-*.png                 登录流程截图（用于诊断）
 *   <slug>.html / <slug>.png    每个页面的 DOM 与截图
 *   camera-fullpage.png         摄像头页整页截图
 *   camera-styles.css           摄像头页生效样式（跨域样式会被浏览器拒绝，尽力而为）
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const USERNAME = process.env.YIJIAN_USER || '865278304a';
const PASSWORD = process.env.YIJIAN_PASS || '123qwe.com';

const TARGET_URL =
  'https://yijian-next.cloud.baidu.com/app/app/monitor/center/camera';

// 登录后附带采集的其它页面，方便还原侧边栏 + 监控中心多个子页面的真实样子。
const EXTRA_PAGES = [
  {
    slug: 'monitor-aiMonitor',
    url: 'https://yijian-next.cloud.baidu.com/app/app/monitor/center/aiMonitor',
  },
  {
    slug: 'monitor-alarm',
    url: 'https://yijian-next.cloud.baidu.com/app/app/monitor/alarm',
  },
  {
    slug: 'monitor-alarm-archive',
    url: 'https://yijian-next.cloud.baidu.com/app/app/monitor/alarm-archive',
  },
  {
    slug: 'device',
    url: 'https://yijian-next.cloud.baidu.com/app/app/device',
  },
];

const OUTPUT_DIR = path.resolve(__dirname, 'output');

function ensureOutputDir() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
}

function log(...args) {
  console.log('[capture]', ...args);
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForLoggedIn(page, timeout = 120000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const url = page.url();
    if (
      url.includes('yijian-next.cloud.baidu.com/app/app/') &&
      !url.includes('passport')
    ) {
      return true;
    }
    await sleep(800);
  }
  return false;
}

async function attemptAutoLogin(page) {
  log('尝试自动填充登录表单…');

  // 百度通行证登录表单字段变化较多，逐个候选 selector 尝试。
  const userSelectors = [
    'input#TANGRAM__PSP_4__userName',
    'input[name="userName"]',
    'input[name="username"]',
    'input[id*="userName"]',
    'input[placeholder*="手机"]',
    'input[placeholder*="邮箱"]',
  ];
  const passSelectors = [
    'input#TANGRAM__PSP_4__password',
    'input[name="password"]',
    'input[type="password"]',
  ];
  const submitSelectors = [
    'input#TANGRAM__PSP_4__submit',
    'input[type="submit"][value*="登录"]',
    'button:has-text("登录")',
    'input[value="登录"]',
    'a:has-text("登录")',
  ];

  // 先点一下"账号密码登录"切换按钮（某些样式默认是扫码登录）。
  const switchCandidates = [
    'a:has-text("账号密码登录")',
    'div:has-text("账号密码登录")',
    'span:has-text("账号密码登录")',
  ];
  for (const sel of switchCandidates) {
    const el = await page.$(sel);
    if (el) {
      try {
        await el.click({ timeout: 1500 });
        await sleep(800);
        log('已切换到账号密码登录');
        break;
      } catch (_) {}
    }
  }

  async function firstVisible(selectors) {
    for (const sel of selectors) {
      const el = await page.$(sel);
      if (el) {
        try {
          const visible = await el.isVisible();
          if (visible) return el;
        } catch (_) {}
      }
    }
    return null;
  }

  const userInput = await firstVisible(userSelectors);
  const passInput = await firstVisible(passSelectors);

  if (!userInput || !passInput) {
    log('未能定位登录表单字段，可能需要你在浏览器里手动登录。');
    return false;
  }

  await userInput.fill('');
  await userInput.type(USERNAME, { delay: 40 });
  await passInput.fill('');
  await passInput.type(PASSWORD, { delay: 40 });

  await page.screenshot({
    path: path.join(OUTPUT_DIR, 'login-filled.png'),
    fullPage: false,
  });

  const submitBtn = await firstVisible(submitSelectors);
  if (submitBtn) {
    await submitBtn.click();
    log('已点击登录按钮');
  } else {
    log('未找到登录按钮，尝试在密码框上回车提交…');
    await passInput.press('Enter');
  }
  return true;
}

async function capturePage(page, slug, url) {
  log(`采集页面 ${slug} -> ${url}`);
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
  } catch (err) {
    log(`页面打开失败 (${slug}):`, err.message);
    return;
  }

  try {
    await page.waitForLoadState('networkidle', { timeout: 15000 });
  } catch (_) {
    // 视频监控后台大多持续有心跳，忽略超时
  }
  await sleep(3500);

  try {
    const html = await page.content();
    fs.writeFileSync(path.join(OUTPUT_DIR, `${slug}.html`), html, 'utf-8');
  } catch (err) {
    log(`保存 DOM 失败 (${slug}):`, err.message);
  }

  try {
    await page.screenshot({
      path: path.join(OUTPUT_DIR, `${slug}.png`),
      fullPage: false,
    });
  } catch (err) {
    log(`截图失败 (${slug}):`, err.message);
  }

  if (slug === 'camera') {
    try {
      await page.screenshot({
        path: path.join(OUTPUT_DIR, 'camera-fullpage.png'),
        fullPage: true,
      });
    } catch (err) {
      log('整页截图失败:', err.message);
    }

    try {
      const cssText = await page.evaluate(() => {
        const chunks = [];
        for (const sheet of Array.from(document.styleSheets)) {
          try {
            if (!sheet.cssRules) continue;
            for (const rule of Array.from(sheet.cssRules)) {
              chunks.push(rule.cssText);
            }
          } catch (_) {}
        }
        return chunks.join('\n');
      });
      fs.writeFileSync(
        path.join(OUTPUT_DIR, 'camera-styles.css'),
        cssText,
        'utf-8'
      );
    } catch (err) {
      log('收集样式失败:', err.message);
    }
  }
}

(async () => {
  ensureOutputDir();

  log('启动浏览器…');
  const browser = await chromium.launch({
    headless: false,
    args: ['--start-maximized', '--disable-blink-features=AutomationControlled'],
  });

  const context = await browser.newContext({
    viewport: { width: 1680, height: 960 },
    locale: 'zh-CN',
    timezoneId: 'Asia/Shanghai',
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
      '(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  });

  const page = await context.newPage();

  log('打开目标页面:', TARGET_URL);
  await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded' });
  await sleep(2000);

  await page.screenshot({
    path: path.join(OUTPUT_DIR, 'login-before.png'),
    fullPage: false,
  });

  await attemptAutoLogin(page);

  log('等待登录成功…（最多 2 分钟，期间若遇到验证码请在浏览器里手动处理）');
  const ok = await waitForLoggedIn(page, 120000);
  await page.screenshot({
    path: path.join(OUTPUT_DIR, 'login-after.png'),
    fullPage: false,
  });
  if (!ok) {
    log('未检测到成功跳转；仍尝试继续采集（可能需要你在浏览器里手动完成登录）。');
  } else {
    log('登录成功，当前 URL:', page.url());
  }

  // 确保停留在目标摄像头页
  if (!page.url().includes('/monitor/center/camera')) {
    try {
      await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded' });
      await sleep(2000);
    } catch (_) {}
  }

  await capturePage(page, 'camera', TARGET_URL);

  for (const { slug, url } of EXTRA_PAGES) {
    await capturePage(page, slug, url);
  }

  log('采集完成，输出目录:', OUTPUT_DIR);
  await browser.close();
})().catch((err) => {
  console.error('[capture] 运行出错:', err);
  process.exit(1);
});
