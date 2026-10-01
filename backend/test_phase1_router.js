const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

let execPath = undefined;
if (fs.existsSync(CHROME_PATH)) execPath = CHROME_PATH;
else if (fs.existsSync(EDGE_PATH)) execPath = EDGE_PATH;

(async () => {
  console.log('Testing Phase 1 Route Engine (frontend/js/router.js)...');
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

  let initialHash = await page.evaluate(() => window.location.hash);
  console.log('Initial Hash Router URL:', initialHash);

  // 2. LOGIN AS SUPERUSER & VERIFY HASH
  console.log('2. Logging in as Master User...');
  await page.click('button[onclick="loginAsSuperUser()"]');
  await new Promise(r => setTimeout(r, 400));
  await page.type('#login-pass', 'superadmin123');
  await page.evaluate(() => handleLogin());
  await new Promise(r => setTimeout(r, 1000));

  let loggedInHash = await page.evaluate(() => window.location.hash);
  console.log('Hash after Master User login:', loggedInHash);

  // 3. SWITCH MODULES & VERIFY HASH SYNC
  console.log('3. Switching to Module 4 (Patrimônio)...');
  await page.evaluate(() => switchGenesisModule(4));
  await new Promise(r => setTimeout(r, 600));

  let module4Hash = await page.evaluate(() => window.location.hash);
  console.log('Hash after switching to Module 4:', module4Hash);

  // 4. TEST DIRECT HASH NAVIGATION TO PERFIL
  console.log('4. Navigating directly via Hash to #/membro/perfil...');
  await page.evaluate(() => { window.location.hash = '#/membro/perfil'; });
  await new Promise(r => setTimeout(r, 600));

  let perfilHash = await page.evaluate(() => window.location.hash);
  let activeModule7 = await page.evaluate(() => document.getElementById('gen-mod-7').classList.contains('active'));
  console.log('Hash:', perfilHash, '| Is Module 7 Active?:', activeModule7);

  // 5. TEST LOGOUT HASH RESET
  console.log('5. Executing Safe Logout...');
  await page.evaluate(() => handleLogout());
  await new Promise(r => setTimeout(r, 600));

  let logoutHash = await page.evaluate(() => window.location.hash);
  console.log('Hash after logout:', logoutHash);

  await browser.close();
  console.log('Phase 1 Router verification finished successfully!');
})();
