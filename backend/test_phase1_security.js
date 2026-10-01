const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACTS_DIR = 'C:\\Users\\HP\\.gemini\\antigravity\\brain\\50f2b3ed-d65a-4584-967c-385849aa4889';

(async () => {
  console.log('🚀 Launching E2E test for FASE 1: Autenticação Estrita & Segurança...');
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

  // 1. Test Clear Vault Credentials
  console.log('--- TEST 1: Limpar Credenciais do Cofre ---');
  await page.evaluate(() => {
    document.getElementById('login-email').value = 'test@example.com';
    document.getElementById('login-pass').value = 'secret123';
  });
  await page.evaluate(() => clearVaultCredentials());
  await new Promise(r => setTimeout(r, 500));

  const emailVal = await page.$eval('#login-email', el => el.value);
  const passVal = await page.$eval('#login-pass', el => el.value);
  const noticeText = await page.$eval('#login-notice', el => el.textContent);
  console.log(`Vault cleared status - Email: "${emailVal}", Password: "${passVal}", Notice: "${noticeText}"`);

  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'screenshot_phase1_vault_cleared.png'), fullPage: false });
  console.log('Saved screenshot_phase1_vault_cleared.png');

  // 2. Test Unauthenticated Navigation Block
  console.log('--- TEST 2: Bloqueio de Navegação Direta Sem Autenticação ---');
  await page.evaluate(() => switchGenesisModule(6));
  await new Promise(r => setTimeout(r, 500));

  const secNoticeModule = await page.$eval('#login-notice', el => el.textContent);
  const isLoginActive = await page.$eval('#screen-login', el => el.classList.contains('active'));
  console.log(`Navigation Guard (switchGenesisModule) - Blocked: ${isLoginActive}, Notice: "${secNoticeModule}"`);

  await page.evaluate(() => navigateToTab('explore'));
  await new Promise(r => setTimeout(r, 500));
  const secNoticeTab = await page.$eval('#login-notice', el => el.textContent);
  console.log(`Navigation Guard (navigateToTab) - Blocked Notice: "${secNoticeTab}"`);

  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'screenshot_phase1_security_block.png'), fullPage: false });
  console.log('Saved screenshot_phase1_security_block.png');

  // 3. Test Master User Successful Login
  console.log('--- TEST 3: Login Estrito de Master User ---');
  await page.evaluate(() => loginAsSuperUser());
  await page.evaluate(() => handleLogin());
  await new Promise(r => setTimeout(r, 1200));

  const isDesktopActive = await page.evaluate(() => document.body.classList.contains('desktop-admin-active'));
  const isModule6Active = await page.evaluate(() => {
    const mod6 = document.getElementById('gen-mod-6');
    return mod6 && mod6.classList.contains('active');
  });
  console.log(`Post-login Master User - Desktop Active: ${isDesktopActive}, Module 6 Active: ${isModule6Active}`);

  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'screenshot_phase1_login_success.png'), fullPage: false });
  console.log('Saved screenshot_phase1_login_success.png');

  await browser.close();
  console.log('✅ Phase 1 E2E tests completed successfully!');
})().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
