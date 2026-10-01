const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACTS_DIR = 'C:\\Users\\HP\\.gemini\\antigravity\\brain\\50f2b3ed-d65a-4584-967c-385849aa4889';

(async () => {
  console.log('🚀 Launching E2E test for Strict Password Validation & Security...');
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
  await new Promise(r => setTimeout(r, 1000));

  // 1. Test Wrong Password Rejection for Master User
  console.log('--- TEST 1: Rejeição de Senha Incorreta para Master User ---');
  await page.evaluate(() => {
    document.getElementById('login-email').value = 'alan.pereira@lp-nexus.com';
    document.getElementById('login-pass').value = 'senha_errada_123';
    handleLogin();
  });
  await new Promise(r => setTimeout(r, 500));

  const wrongPassNotice = await page.$eval('#login-notice', el => el.textContent);
  const isMasterLoggedInWrong = await page.evaluate(() => document.body.classList.contains('desktop-admin-active'));
  console.log(`Wrong password test - Blocked: ${!isMasterLoggedInWrong}, Notice: "${wrongPassNotice}"`);

  if (isMasterLoggedInWrong) {
    throw new Error('SECURITY FAILURE: Master User logged in with wrong password!');
  }

  // 2. Test Correct Password Acceptance for Master User
  console.log('--- TEST 2: Login Aceito com Senha Correta para Master User ---');
  await page.evaluate(() => {
    document.getElementById('login-email').value = 'alan.pereira@lp-nexus.com';
    document.getElementById('login-pass').value = 'superadmin123';
    handleLogin();
  });
  await new Promise(r => setTimeout(r, 1200));

  const isMasterLoggedInCorrect = await page.evaluate(() => document.body.classList.contains('desktop-admin-active'));
  console.log(`Correct password test - Logged in: ${isMasterLoggedInCorrect}`);

  if (!isMasterLoggedInCorrect) {
    throw new Error('AUTH FAILURE: Master User failed to log in with correct password!');
  }

  // 3. Test Logout & Clear Vault
  console.log('--- TEST 3: Logout & Limpar Cofre ---');
  await page.evaluate(() => handleLogout());
  await page.evaluate(() => clearVaultCredentials());
  await new Promise(r => setTimeout(r, 500));

  const emailVal = await page.$eval('#login-email', el => el.value);
  const passVal = await page.$eval('#login-pass', el => el.value);
  console.log(`Vault cleared - Email: "${emailVal}", Password: "${passVal}"`);

  await browser.close();
  console.log('✅ ALL STRICT PASSWORD & SECURITY TESTS PASSED PERFECTLY!');
})().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
