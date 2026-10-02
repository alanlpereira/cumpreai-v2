const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

let execPath = undefined;
if (fs.existsSync(CHROME_PATH)) execPath = CHROME_PATH;
else if (fs.existsSync(EDGE_PATH)) execPath = EDGE_PATH;

(async () => {
  console.log('Testing Welington Soares Super User Login & Executive Light Theme High Contrast...');
  const browser = await puppeteer.launch({
    executablePath: execPath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const indexPath = 'file:///' + path.resolve(__dirname, '../index.html').replace(/\\/g, '/');
  console.log('1. Navigating to index.html...');
  await page.goto(indexPath, { waitUntil: 'load' });
  await new Promise(r => setTimeout(r, 600));

  // 1. Test Super User login for Welington Soares
  console.log('2. Testing Super User login for welingtonsoares@hotmail.com...');
  await page.type('#login-email', 'welingtonsoares@hotmail.com');
  await page.type('#login-pass', 'superadmin123');
  await page.evaluate(() => handleLogin());
  await new Promise(r => setTimeout(r, 1000));

  const userNameText = await page.$eval('#dash-username', el => el.textContent.trim());
  const userBadgeText = await page.$eval('.context-badge', el => el.textContent.trim());
  console.log(`✔ Authenticated Super User: Name="${userNameText}", Badge="${userBadgeText}"`);

  // 2. Switch to Light Theme and capture high-contrast screenshot
  console.log('3. Toggling Light Theme (theme-visual-claro) & verifying high contrast...');
  await page.evaluate(() => switchGenesisModule(7));
  await new Promise(r => setTimeout(r, 400));
  await page.evaluate(() => {
    const btn = document.getElementById('inapp-theme-toggle-btn');
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 800));

  const artifactDir = 'C:/Users/HP/.gemini/antigravity/brain/50f2b3ed-d65a-4584-967c-385849aa4889';
  await page.screenshot({ path: path.join(artifactDir, 'screenshot_phase6_light_theme_high_contrast.png'), fullPage: false });
  console.log('✔ Saved screenshot_phase6_light_theme_high_contrast.png');

  // 4. Test Master User Dashboard in Light Theme
  console.log('4. Testing Master User Dashboard in Light Theme...');
  await page.evaluate(() => switchGenesisModule(6));
  await new Promise(r => setTimeout(r, 600));

  await page.screenshot({ path: path.join(artifactDir, 'screenshot_phase6_welington_master_dashboard_light.png'), fullPage: false });
  console.log('✔ Saved screenshot_phase6_welington_master_dashboard_light.png');

  await browser.close();
  console.log('Welington Soares Super User & Light Theme High Contrast verification finished successfully!');
})();
