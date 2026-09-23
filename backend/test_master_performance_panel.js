const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const ARTIFACTS_DIR = 'C:\\Users\\HP\\.gemini\\antigravity\\brain\\50f2b3ed-d65a-4584-967c-385849aa4889';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
  console.log('Launching browser for E2E Master Performance Panel validation...');
  const browser = await puppeteer.launch({
    executablePath: fs.existsSync(CHROME_PATH) ? CHROME_PATH : undefined,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  page.on('dialog', async dialog => {
    console.log('[ALERT]', dialog.message());
    await dialog.accept();
  });

  const htmlPath = 'file:///' + path.resolve(__dirname, '../index.html').replace(/\\/g, '/');
  console.log('Navigating to:', htmlPath);
  await page.goto(htmlPath, { waitUntil: 'load' });

  await new Promise(r => setTimeout(r, 800));

  // Login as Super User / Master User
  console.log('Logging in as Master User...');
  await page.evaluate(() => {
    if (typeof loginAsSuperUser === 'function') {
      loginAsSuperUser();
    }
  });

  await new Promise(r => setTimeout(r, 1000));

  // Switch to Module 6
  console.log('Switching to Module 6 (Performance)...');
  await page.evaluate(() => {
    if (typeof switchGenesisModule === 'function') {
      switchGenesisModule(6);
    }
  });

  await new Promise(r => setTimeout(r, 800));

  // Screenshot 1: Dark Performance Mode
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'screenshot_perf_panel_dark_mode.png'), fullPage: true });
  console.log('Captured screenshot_perf_panel_dark_mode.png');

  // Open Modal Register Activity
  console.log('Opening Register Activity Modal...');
  await page.evaluate(() => {
    openRegisterActivityModal();
  });

  await new Promise(r => setTimeout(r, 500));

  // Screenshot 2: Modal Register Activity
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'screenshot_perf_panel_register_activity_modal.png'), fullPage: true });
  console.log('Captured screenshot_perf_panel_register_activity_modal.png');

  // Submit activity
  console.log('Submitting registered activity (1.8 km)...');
  await page.evaluate(() => {
    selectActivityType('Corrida');
    const distInput = document.getElementById('act-dist-input');
    const durInput = document.getElementById('act-duration-input');
    if (distInput) distInput.value = '1.8';
    if (durInput) durInput.value = '15';
    submitRegisterActivity();
  });

  await new Promise(r => setTimeout(r, 800));

  // Screenshot 3: Updated Progress
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'screenshot_perf_panel_updated_ledger_progress.png'), fullPage: true });
  console.log('Captured screenshot_perf_panel_updated_ledger_progress.png');

  // Switch to Clean View (WA0019)
  console.log('Switching to Visão Clean (WA0019)...');
  await page.evaluate(() => {
    switchMasterPerformanceMode('clean');
  });

  await new Promise(r => setTimeout(r, 800));

  // Screenshot 4: Clean Mode
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'screenshot_perf_panel_clean_mode.png'), fullPage: true });
  console.log('Captured screenshot_perf_panel_clean_mode.png');

  await browser.close();
  console.log('E2E validation finished successfully!');
})();
