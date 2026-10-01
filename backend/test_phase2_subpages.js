const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

let execPath = undefined;
if (fs.existsSync(CHROME_PATH)) execPath = CHROME_PATH;
else if (fs.existsSync(EDGE_PATH)) execPath = EDGE_PATH;

(async () => {
  console.log('Testing Phase 2 Sub-Pages Extraction & Structure...');

  const pagesDir = path.resolve(__dirname, '../frontend/pages');
  const requiredSubpages = [
    'auth/login.html',
    'auth/onboarding.html',
    'membro/entrada.html',
    'membro/missao.html',
    'membro/operacao.html',
    'membro/patrimonio.html',
    'membro/ecossistema.html',
    'membro/perfil.html',
    'gestao/master.html',
    'gestao/org.html',
    'marketplace.html'
  ];

  console.log('1. Verifying existence of sub-page HTML files in frontend/pages/...');
  for (const pageFile of requiredSubpages) {
    const fullPath = path.join(pagesDir, pageFile);
    if (!fs.existsSync(fullPath)) {
      throw new Error(`Missing required sub-page file: ${fullPath}`);
    }
    const size = fs.statSync(fullPath).size;
    console.log(`  ✔ Found ${pageFile} (${size} bytes)`);
  }

  console.log('2. Running Puppeteer E2E sub-page router navigation test...');
  const browser = await puppeteer.launch({
    executablePath: execPath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const indexPath = 'file:///' + path.resolve(__dirname, '../index.html').replace(/\\/g, '/');
  await page.goto(indexPath, { waitUntil: 'load' });
  await new Promise(r => setTimeout(r, 600));

  // Master User Login
  await page.click('button[onclick="loginAsSuperUser()"]');
  await new Promise(r => setTimeout(r, 400));
  await page.type('#login-pass', 'superadmin123');
  await page.evaluate(() => handleLogin());
  await new Promise(r => setTimeout(r, 1000));

  const masterHash = await page.evaluate(() => window.location.hash);
  console.log('Master User Sub-page Route:', masterHash);

  // Switch to Patrimonio subpage
  await page.evaluate(() => window.router.navigate('/membro/patrimonio'));
  await new Promise(r => setTimeout(r, 600));

  const patrimonyHash = await page.evaluate(() => window.location.hash);
  console.log('Patrimônio Sub-page Route:', patrimonyHash);

  // Switch to Perfil subpage
  await page.evaluate(() => window.router.navigate('/membro/perfil'));
  await new Promise(r => setTimeout(r, 600));

  const perfilHash = await page.evaluate(() => window.location.hash);
  console.log('Perfil Sub-page Route:', perfilHash);

  await browser.close();
  console.log('Phase 2 Sub-Pages verification completed successfully!');
})();
