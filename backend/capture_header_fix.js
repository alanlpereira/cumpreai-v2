const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

let execPath = undefined;
if (fs.existsSync(CHROME_PATH)) execPath = CHROME_PATH;
else if (fs.existsSync(EDGE_PATH)) execPath = EDGE_PATH;

(async () => {
  console.log('Capturing header fix screenshots...');
  const browser = await puppeteer.launch({
    executablePath: execPath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const indexPath = 'file:///' + path.resolve(__dirname, '../index.html').replace(/\\/g, '/');
  await page.goto(indexPath, { waitUntil: 'load' });
  await new Promise(r => setTimeout(r, 800));

  const artifactDir = 'C:/Users/HP/.gemini/antigravity/brain/50f2b3ed-d65a-4584-967c-385849aa4889';

  // 1. Initial screen with persistent top header bar
  await page.screenshot({ path: path.join(artifactDir, 'screenshot_header_fix_initial.png'), fullPage: false });
  console.log('Saved screenshot_header_fix_initial.png');

  // 2. Logged in Master User with sticky top header bar & Saída Segura button
  await page.click('button[onclick="loginAsSuperUser()"]');
  await new Promise(r => setTimeout(r, 400));
  await page.type('#login-pass', 'superadmin123');
  await page.click('button[type="submit"]');
  await new Promise(r => setTimeout(r, 1200));

  await page.screenshot({ path: path.join(artifactDir, 'screenshot_header_fix_loggedin.png'), fullPage: false });
  console.log('Saved screenshot_header_fix_loggedin.png');

  await browser.close();
  console.log('Header fix screenshots captured successfully!');
})();
