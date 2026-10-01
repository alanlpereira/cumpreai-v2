const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

let execPath = undefined;
if (fs.existsSync(CHROME_PATH)) execPath = CHROME_PATH;
else if (fs.existsSync(EDGE_PATH)) execPath = EDGE_PATH;

(async () => {
  console.log('Inspecting layout empty space after login...');
  const browser = await puppeteer.launch({
    executablePath: execPath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const indexPath = 'file:///' + path.resolve(__dirname, '../index.html').replace(/\\/g, '/');
  await page.goto(indexPath, { waitUntil: 'load' });

  // Login as SuperUser
  await page.click('button[onclick="loginAsSuperUser()"]');
  await new Promise(r => setTimeout(r, 400));
  await page.type('#login-pass', 'superadmin123');
  await page.click('button[type="submit"]');
  await new Promise(r => setTimeout(r, 1200));

  // Inspect layout elements
  const metrics = await page.evaluate(() => {
    const getInfo = (selector) => {
      const el = document.querySelector(selector);
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      return {
        selector,
        top: rect.top,
        height: rect.height,
        paddingTop: style.paddingTop,
        marginTop: style.marginTop,
        display: style.display,
        position: style.position,
        transform: style.transform
      };
    };

    return {
      scrollY: window.scrollY,
      body: getInfo('body'),
      presHeader: getInfo('.pres-header'),
      phoneContainer: getInfo('.phone-container'),
      simulatorPanel: getInfo('.simulator-panel'),
      smartphoneFrame: getInfo('.smartphone-frame'),
      smartphoneScreen: getInfo('.smartphone-screen'),
      screenWrapper: getInfo('.screen-wrapper'),
      genMod6: getInfo('#gen-mod-6'),
      screenHome: getInfo('#screen-home')
    };
  });

  console.log('Layout Metrics:', JSON.stringify(metrics, null, 2));

  const artifactDir = 'C:/Users/HP/.gemini/antigravity/brain/50f2b3ed-d65a-4584-967c-385849aa4889';
  await page.screenshot({ path: path.join(artifactDir, 'screenshot_black_space_issue.png'), fullPage: false });
  console.log('Saved screenshot_black_space_issue.png');

  await browser.close();
})();
