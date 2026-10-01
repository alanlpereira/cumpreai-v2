const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACTS_DIR = 'C:\\Users\\HP\\.gemini\\antigravity\\brain\\50f2b3ed-d65a-4584-967c-385849aa4889';

(async () => {
  console.log('Testing Widescreen Desktop Top Spacing with Master User...');
  const browser = await puppeteer.launch({
    executablePath: fs.existsSync(CHROME_PATH) ? CHROME_PATH : undefined,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1680, height: 1050 });

  const htmlPath = 'file:///' + path.resolve(__dirname, '../index.html').replace(/\\/g, '/');
  await page.goto(htmlPath, { waitUntil: 'load' });

  await new Promise(r => setTimeout(r, 1000));

  // Login as Super User
  await page.evaluate(() => {
    loginAsSuperUser();
    handleLogin();
  });

  await new Promise(r => setTimeout(r, 1200));

  // Capture top header region screenshot
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'screenshot_desktop_top_spacing_check.png'), fullPage: false });
  console.log('Saved screenshot_desktop_top_spacing_check.png');

  await browser.close();
})();
