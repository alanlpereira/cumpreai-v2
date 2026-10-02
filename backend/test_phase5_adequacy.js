const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

let execPath = undefined;
if (fs.existsSync(CHROME_PATH)) execPath = CHROME_PATH;
else if (fs.existsSync(EDGE_PATH)) execPath = EDGE_PATH;

(async () => {
  console.log('Testing Phase 5 Adequacy & Reference Alignment (WA0019, WA0020, v13.1 Matrix)...');
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

  // Login as Master User to unlock full navigation
  console.log('2. Logging in as Master User...');
  await page.click('button[onclick="loginAsSuperUser()"]');
  await new Promise(r => setTimeout(r, 400));
  await page.type('#login-pass', 'superadmin123');
  await page.evaluate(() => handleLogin());
  await new Promise(r => setTimeout(r, 1000));

  const artifactDir = 'C:/Users/HP/.gemini/antigravity/brain/50f2b3ed-d65a-4584-967c-385849aa4889';

  // 3. TEST SUB-PAGE ROUTE: #/membro/performance (WA0020)
  console.log('3. Navigating to #/membro/performance (Modo Performance & Desafio 5K)...');
  await page.evaluate(() => { window.location.hash = '#/membro/performance'; });
  await new Promise(r => setTimeout(r, 800));

  await page.screenshot({ path: path.join(artifactDir, 'screenshot_phase5_performance_wa0020.png'), fullPage: false });
  console.log('✔ Saved screenshot_phase5_performance_wa0020.png');

  // 4. TEST SUB-PAGE ROUTE: #/membro/ligas (WA0019)
  console.log('4. Navigating to #/membro/ligas (Ligas e Equipes)...');
  await page.evaluate(() => { window.location.hash = '#/membro/ligas'; });
  await new Promise(r => setTimeout(r, 800));

  await page.screenshot({ path: path.join(artifactDir, 'screenshot_phase5_ligas_wa0019.png'), fullPage: false });
  console.log('✔ Saved screenshot_phase5_ligas_wa0019.png');

  // 5. TEST SUB-PAGE ROUTE: #/membro/ecossistema (Matrix v13.1)
  console.log('5. Navigating to #/membro/ecossistema (Matriz Comparativa v13.1)...');
  await page.evaluate(() => { window.location.hash = '#/membro/ecossistema'; });
  await new Promise(r => setTimeout(r, 800));

  await page.screenshot({ path: path.join(artifactDir, 'screenshot_phase5_ecossistema_v13_matrix.png'), fullPage: false });
  console.log('✔ Saved screenshot_phase5_ecossistema_v13_matrix.png');

  await browser.close();
  console.log('Phase 5 Adequacy & Reference Alignment completed successfully!');
})();
