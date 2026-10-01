const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

let execPath = undefined;
if (fs.existsSync(CHROME_PATH)) execPath = CHROME_PATH;
else if (fs.existsSync(EDGE_PATH)) execPath = EDGE_PATH;

(async () => {
  console.log('Starting Phase 2 E2E Verification...');
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

  // 1. LOGIN AS MASTER USER
  console.log('Testing Master User login...');
  await page.click('button[onclick="loginAsSuperUser()"]');
  await new Promise(r => setTimeout(r, 400));
  await page.type('#login-pass', 'superadmin123');
  await page.click('button[type="submit"]');
  await new Promise(r => setTimeout(r, 1200));

  // Take screenshot of Master User Dashboard
  const artifactDir = 'C:/Users/HP/.gemini/antigravity/brain/50f2b3ed-d65a-4584-967c-385849aa4889';
  await page.screenshot({ path: path.join(artifactDir, 'screenshot_phase2_master_dashboard.png'), fullPage: false });
  console.log('Saved screenshot_phase2_master_dashboard.png');

  // 2. TOGGLE TO ORG MANAGER VIEW FROM HEADER SWITCHER
  console.log('Testing header role toggle to Org Manager view...');
  await page.evaluate(() => toggleDashboardRoleView('org'));
  await new Promise(r => setTimeout(r, 600));

  await page.screenshot({ path: path.join(artifactDir, 'screenshot_phase2_org_manager_dashboard.png'), fullPage: false });
  console.log('Saved screenshot_phase2_org_manager_dashboard.png');

  // 3. LOGOUT AND LOGIN AS ORG MANAGER DIRECTLY
  console.log('Testing direct Org Manager login...');
  await page.evaluate(() => handleLogout());
  await new Promise(r => setTimeout(r, 600));

  await page.click('button[onclick="loginAsOrgManager()"]');
  await new Promise(r => setTimeout(r, 400));
  await page.type('#login-pass', 'orgmanager123');
  await page.click('button[type="submit"]');
  await new Promise(r => setTimeout(r, 1200));

  await page.screenshot({ path: path.join(artifactDir, 'screenshot_phase2_org_manager_login.png'), fullPage: false });
  console.log('Saved screenshot_phase2_org_manager_login.png');

  await browser.close();
  console.log('Phase 2 E2E Verification finished successfully!');
})();
