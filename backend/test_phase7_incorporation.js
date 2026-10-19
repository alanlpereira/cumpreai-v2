/**
 * Test Suite Phase 7 - Incorporation of Owners Console, Personal Rewards,
 * Billing & Capacity Plans, and Dual Evidence Origin (Journey vs Legacy).
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const PORT = 8092;
const BASE_DIR = path.resolve(__dirname, '..');
const ARTIFACTS_DIR = 'C:\\Users\\HP\\.gemini\\antigravity\\brain\\50f2b3ed-d65a-4584-967c-385849aa4889';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

let execPath = undefined;
if (fs.existsSync(CHROME_PATH)) execPath = CHROME_PATH;
else if (fs.existsSync(EDGE_PATH)) execPath = EDGE_PATH;

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// Simple Static HTTP Server
function startServer() {
  return new Promise((resolve) => {
    const mimeTypes = {
      '.html': 'text/html; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.js': 'application/javascript; charset=utf-8',
      '.json': 'application/json; charset=utf-8',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.svg': 'image/svg+xml'
    };

    const server = http.createServer((req, res) => {
      let reqPath = req.url.split('?')[0].split('#')[0];
      if (reqPath === '/' || reqPath === '') reqPath = '/index.html';
      const safePath = path.normalize(decodeURIComponent(reqPath)).replace(/^(\.\.[\/\\])+/, '');
      const filePath = path.join(BASE_DIR, safePath);

      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        const ext = path.extname(filePath).toLowerCase();
        res.writeHead(200, {
          'Content-Type': mimeTypes[ext] || 'application/octet-stream',
          'Access-Control-Allow-Origin': '*'
        });
        fs.createReadStream(filePath).pipe(res);
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found: ' + reqPath);
      }
    });

    server.listen(PORT, () => {
      console.log(`[HTTP SERVER] Running at http://localhost:${PORT}`);
      resolve(server);
    });
  });
}

async function runTests() {
  console.log('--- STARTING PHASE 7 INCORPORATION E2E TEST SUITE ---');
  console.log(`Using Browser executable: ${execPath}`);
  const server = await startServer();
  
  const browser = await puppeteer.launch({
    executablePath: execPath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // Auto-accept all alerts/confirms
  page.on('dialog', async (dialog) => {
    console.log(`[DIALOG ACCEPTED]: "${dialog.message()}"`);
    await dialog.accept();
  });

  page.on('console', (msg) => {
    const text = msg.text();
    if (text.includes('ROUTE') || text.includes('SUB-PAGE') || text.includes('GEMINI')) {
      console.log(`[BROWSER]: ${text}`);
    }
  });

  try {
    // ----------------------------------------------------
    // STEP 1: LOGIN AS SUPER USER
    // ----------------------------------------------------
    console.log('\n[TEST 1] Logging in as Super User (Welington Soares)...');
    await page.goto(`http://localhost:${PORT}/index.html#/auth/login`, { waitUntil: 'networkidle0' });
    await sleep(600);

    await page.type('#login-email', 'welingtonsoares@hotmail.com');
    await page.type('#login-pass', 'superadmin123');
    await page.evaluate(() => handleLogin());
    await sleep(1000);

    const isAuth = await page.evaluate(() => {
      return window.state && window.state.member && window.state.member.email.toLowerCase().includes('welington');
    });

    if (!isAuth) throw new Error('Authentication failed for welingtonsoares@hotmail.com');
    console.log('✓ Successfully authenticated Super User.');

    // ----------------------------------------------------
    // STEP 2: CONSOLE DOS PROPRIETÁRIOS (#/gestao/proprietarios)
    // ----------------------------------------------------
    console.log('\n[TEST 2] Navigating to Console dos Proprietários (#/gestao/proprietarios)...');
    await page.evaluate(() => {
      window.router.navigate('/gestao/proprietarios');
    });

    await page.waitForSelector('#subpage-proprietarios', { timeout: 6000 });
    const ownerTitle = await page.$eval('#owner-page-title', el => el.textContent.trim());
    console.log(`✓ Owner Page Rendered. Title: "${ownerTitle}"`);

    // Verify 7 interactive views
    const tabs = ['overview', 'engagement', 'patrimonies', 'participants', 'challenges', 'finance', 'governance'];
    for (const tab of tabs) {
      await page.evaluate((t) => {
        window.switchOwnerView(t);
      }, tab);
      const isVisible = await page.$eval(`#owner-view-${tab}`, el => el.style.display !== 'none');
      if (!isVisible) throw new Error(`Tab view #${tab} did not display correctly`);
    }
    console.log('✓ All 7 Owner Views verified interactively (Overview, Engagement, Patrimonies, Participants, Challenges, Finance, Governance).');

    // Return to Overview
    await page.evaluate(() => window.switchOwnerView('overview'));
    await sleep(500);

    // Capture Owner Console Screenshot (Dark Mode)
    const shotOwnerDark = path.join(ARTIFACTS_DIR, 'screenshot_phase7_proprietarios_console.png');
    await page.screenshot({ path: shotOwnerDark, fullPage: false });
    console.log(`✓ Dark mode screenshot saved: ${shotOwnerDark}`);

    // Switch to High Contrast Light Theme and capture screenshot
    await page.evaluate(() => {
      document.body.classList.add('theme-visual-claro');
    });
    await sleep(500);
    const shotOwnerLight = path.join(ARTIFACTS_DIR, 'screenshot_phase7_proprietarios_console_light.png');
    await page.screenshot({ path: shotOwnerLight, fullPage: false });
    console.log(`✓ Light theme screenshot saved: ${shotOwnerLight}`);

    // Revert to default theme for next tests
    await page.evaluate(() => {
      document.body.classList.remove('theme-visual-claro');
    });

    // ----------------------------------------------------
    // STEP 3: PERSONAL REWARDS PORTFOLIO (#/membro/premios)
    // ----------------------------------------------------
    console.log('\n[TEST 3] Navigating to Member Rewards Portfolio (#/membro/premios)...');
    await page.evaluate(() => {
      window.router.navigate('/membro/premios');
    });

    await page.waitForSelector('#subpage-premios', { timeout: 5000 });
    const rewardHero = await page.$eval('#reward-total-possible', el => el.textContent.trim());
    const rewardReceived = await page.$eval('#reward-total-received', el => el.textContent.trim());
    const rewardCustody = await page.$eval('#reward-total-custody', el => el.textContent.trim());

    console.log(`✓ Rewards Portfolio Rendered:`);
    console.log(`  - Potential Net Total: ${rewardHero}`);
    console.log(`  - Released to Member: ${rewardReceived}`);
    console.log(`  - Vault Custody Confirmed: ${rewardCustody}`);

    const shotRewards = path.join(ARTIFACTS_DIR, 'screenshot_phase7_premios_portfolio.png');
    await page.screenshot({ path: shotRewards, fullPage: false });
    console.log(`✓ Rewards Portfolio screenshot saved: ${shotRewards}`);

    // ----------------------------------------------------
    // STEP 4: BILLING & CAPACITY PLANS (#/membro/planos)
    // ----------------------------------------------------
    console.log('\n[TEST 4] Navigating to Plans & Capacity (#/membro/planos)...');
    await page.evaluate(() => {
      window.router.navigate('/membro/planos');
    });

    await page.waitForSelector('#subpage-planos', { timeout: 5000 });
    console.log('✓ Plans & Capacity Rendered.');

    // Select "Equipe" plan
    await page.evaluate(() => {
      window.selectPlan('team');
    });

    const activeInvoice = await page.$eval('#invoice-plan-name', el => el.textContent.trim());
    const activePrice = await page.$eval('#invoice-plan-price', el => el.textContent.trim());
    console.log(`✓ Plan upgraded dynamically to: ${activeInvoice} (${activePrice})`);

    const shotPlans = path.join(ARTIFACTS_DIR, 'screenshot_phase7_planos_capacidade.png');
    await page.screenshot({ path: shotPlans, fullPage: false });
    console.log(`✓ Plans & Capacity screenshot saved: ${shotPlans}`);

    // ----------------------------------------------------
    // STEP 5: DUAL EVIDENCE ORIGIN (JOURNEY VS LEGACY)
    // ----------------------------------------------------
    console.log('\n[TEST 5] Testing Dual Evidence Origin (Legado anterior vs Jornada)...');
    await page.evaluate(() => {
      window.router.navigate('/membro/operacao');
    });
    await sleep(600);

    await page.evaluate(() => {
      window.openLegacyEvidenceSubmission();
    });
    await sleep(400);

    await page.waitForSelector('#screen-submit.active', { timeout: 5000 });
    const evSourceVal = await page.$eval('#evidenceSource', el => el.value);
    console.log(`✓ Screen-submit active. Selected Evidence Source: "${evSourceVal}"`);

    // Type legacy evidence info
    await page.type('#evidence-legacy-title', 'Publicação Técnica de Inovação Aberta (2024)');
    await page.type('#evidence-url', 'https://github.com/alanlpereira/open-innovation-case');
    
    // Submit legacy evidence
    await page.click('#screen-submit .btn-primary');

    await page.waitForSelector('#screen-recognition.active', { timeout: 5000 });
    const recText = await page.$eval('.recognition-text', el => el.textContent.trim());
    console.log(`✓ Recognition screen activated! Confirmation: "${recText}"`);

    const shotRecognition = path.join(ARTIFACTS_DIR, 'screenshot_phase7_legacy_evidence_recognition.png');
    await page.screenshot({ path: shotRecognition, fullPage: false });
    console.log(`✓ Legacy evidence recognition screenshot saved: ${shotRecognition}`);

    console.log('\n======================================================');
    console.log('🎉 ALL PHASE 7 INCORPORATION TESTS PASSED WITH 100% SUCCESS!');
    console.log('======================================================');

  } catch (err) {
    console.error('\n❌ TEST FAILED:', err.message);
    process.exitCode = 1;
  } finally {
    await browser.close();
    server.close();
  }
}

runTests();
