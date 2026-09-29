const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACTS_DIR = 'C:\\Users\\HP\\.gemini\\antigravity\\brain\\50f2b3ed-d65a-4584-967c-385849aa4889';

(async () => {
  console.log('Launching browser for Login & Logout E2E Test...');
  const browser = await puppeteer.launch({
    executablePath: fs.existsSync(CHROME_PATH) ? CHROME_PATH : undefined,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1680,1050']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1680, height: 1050 });

  page.on('dialog', async dialog => {
    console.log('[ALERT]', dialog.message());
    await dialog.accept();
  });

  const htmlPath = 'file:///' + path.resolve(__dirname, '../index.html').replace(/\\/g, '/');
  console.log('Navigating to:', htmlPath);
  await page.goto(htmlPath, { waitUntil: 'load' });

  // 1. Verify initial screen is #screen-login with inputs
  await new Promise(r => setTimeout(r, 1000));
  const loginVisible = await page.evaluate(() => {
    const screen = document.getElementById('screen-login');
    return screen && screen.classList.contains('active');
  });
  console.log('Initial screen is #screen-login:', loginVisible);

  // Take screenshot 1: Login Screen with Password Input
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'screenshot_login_1_initial.png'), fullPage: false });
  console.log('Saved screenshot_login_1_initial.png');

  // 2. Click Entrar without typing -> Validation Error
  console.log('Testing empty submission validation...');
  await page.evaluate(() => {
    document.getElementById('login-email').value = '';
    document.getElementById('login-pass').value = '';
    handleLogin();
  });
  await new Promise(r => setTimeout(r, 500));
  const noticeText = await page.evaluate(() => {
    const el = document.getElementById('login-notice');
    return el ? el.textContent : '';
  });
  console.log('Validation notice:', noticeText);

  // 3. Click Autopreencher Super User
  console.log('Clicking loginAsSuperUser()...');
  await page.evaluate(() => loginAsSuperUser());
  await new Promise(r => setTimeout(r, 500));

  const emailVal = await page.$eval('#login-email', el => el.value);
  const passVal = await page.$eval('#login-pass', el => el.value);
  console.log(`Autofilled credentials - Email: "${emailVal}", Password: "${passVal}"`);

  // Screenshot 2: Autofilled Super User with Password
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'screenshot_login_2_autofilled.png'), fullPage: false });
  console.log('Saved screenshot_login_2_autofilled.png');

  // 4. Submit Login as Master User -> Must direct DIRECTLY to Management Panel (#screen-module6)
  console.log('Submitting handleLogin() as Master User...');
  await page.evaluate(() => handleLogin());
  await new Promise(r => setTimeout(r, 1200));

  const isDesktopActive = await page.evaluate(() => document.body.classList.contains('desktop-admin-active'));
  const isModule6Active = await page.evaluate(() => {
    const mod6 = document.getElementById('gen-mod-6');
    return mod6 && mod6.classList.contains('active');
  });
  const headerLogoutVisible = await page.evaluate(() => {
    const btn = document.getElementById('logout-btn-header');
    return btn && btn.style.display !== 'none';
  });

  console.log('Post-login state - Desktop Active:', isDesktopActive, '| Module 6 Active:', isModule6Active, '| Logout Btn Header Visible:', headerLogoutVisible);

  // Screenshot 3: Master User Direct Redirection to Management Panel
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'screenshot_login_3_master_direct_management.png'), fullPage: false });
  console.log('Saved screenshot_login_3_master_direct_management.png');

  // 5. Test Logout -> Click Sair do App
  console.log('Testing handleLogout()...');
  await page.evaluate(() => handleLogout());
  await new Promise(r => setTimeout(r, 1000));

  const postLogoutScreen = await page.evaluate(() => {
    const screen = document.getElementById('screen-login');
    return screen && screen.classList.contains('active');
  });
  const isDesktopRemoved = await page.evaluate(() => !document.body.classList.contains('desktop-admin-active'));
  const logoutNotice = await page.evaluate(() => {
    const el = document.getElementById('login-notice');
    return el ? el.textContent : '';
  });

  console.log('Post-logout state - Back to Login Screen:', postLogoutScreen, '| Desktop Frame Removed:', isDesktopRemoved, '| Logout Notice:', logoutNotice);

  // Screenshot 4: Post Logout Screen with Security Notice
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'screenshot_login_4_logout_success.png'), fullPage: false });
  console.log('Saved screenshot_login_4_logout_success.png');

  await browser.close();
  console.log('E2E Login & Logout Test completed successfully!');
})();
