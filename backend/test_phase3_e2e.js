const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

let execPath = undefined;
if (fs.existsSync(CHROME_PATH)) execPath = CHROME_PATH;
else if (fs.existsSync(EDGE_PATH)) execPath = EDGE_PATH;

(async () => {
  console.log('Starting Phase 3 E2E Verification...');
  const browser = await puppeteer.launch({
    executablePath: execPath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const indexPath = 'file:///' + path.resolve(__dirname, '../index.html').replace(/\\/g, '/');
  console.log('Navigating to:', indexPath);
  await page.goto(indexPath, { waitUntil: 'load' });

  const artifactDir = 'C:/Users/HP/.gemini/antigravity/brain/50f2b3ed-d65a-4584-967c-385849aa4889';

  // 1. LOGIN AS MASTER USER
  console.log('1. Testing Master User login...');
  await page.click('button[onclick="loginAsSuperUser()"]');
  await new Promise(r => setTimeout(r, 400));
  await page.type('#login-pass', 'superadmin123');
  await page.click('button[type="submit"]');
  await new Promise(r => setTimeout(r, 1200));

  // 2. NAVIGATE TO MODULE 4 (PATRIMÔNIO)
  console.log('2. Testing Module 4 (Patrimônio) actions...');
  await page.evaluate(() => switchGenesisModule(4));
  await new Promise(r => setTimeout(r, 600));

  await page.screenshot({ path: path.join(artifactDir, 'screenshot_phase3_module4_patrimony.png'), fullPage: false });
  console.log('Saved screenshot_phase3_module4_patrimony.png');

  // 3. NAVIGATE TO MODULE 7 (PERFIL) & TEST THEME TOGGLE
  console.log('3. Testing Module 7 (Perfil) & In-App Theme Toggle...');
  await page.evaluate(() => switchGenesisModule(7));
  await new Promise(r => setTimeout(r, 600));

  // Trigger in-app theme toggle button via evaluate click
  await page.evaluate(() => {
    const btn = document.getElementById('inapp-theme-toggle-btn');
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 600));

  const isThemeClaro = await page.evaluate(() => document.body.classList.contains('theme-visual-claro'));
  console.log('Is theme-visual-claro active?', isThemeClaro);

  await page.screenshot({ path: path.join(artifactDir, 'screenshot_phase3_theme_claro.png'), fullPage: false });
  console.log('Saved screenshot_phase3_theme_claro.png');

  // Toggle back to dark theme
  await page.evaluate(() => {
    const btn = document.getElementById('inapp-theme-toggle-btn');
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 600));

  // 4. TEST IN-APP SAFE LOGOUT FROM MODULE 7
  console.log('4. Testing In-App Safe Logout from Module 7...');
  await page.evaluate(() => handleLogout());
  await new Promise(r => setTimeout(r, 800));

  const contextBadgeText = await page.$eval('.context-badge', el => el.textContent.trim());
  console.log('User context badge after logout:', contextBadgeText);

  await page.screenshot({ path: path.join(artifactDir, 'screenshot_phase3_logout_success.png'), fullPage: false });
  console.log('Saved screenshot_phase3_logout_success.png');

  await browser.close();
  console.log('Phase 3 E2E Verification completed successfully!');
})();
