const puppeteer = require('puppeteer');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
  console.log('Testing LIVE site deployment at https://cumprei-v2.alp-nexus.com/ ...');
  const browser = await puppeteer.launch({
    executablePath: fs.existsSync(CHROME_PATH) ? CHROME_PATH : undefined,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setCacheEnabled(false); // Force bypass cache
  await page.setViewport({ width: 1680, height: 1050 });

  console.log('Navigating to live URL with cache disabled...');
  await page.goto('https://cumprei-v2.alp-nexus.com/?nocache=' + Date.now(), { waitUntil: 'networkidle0' });

  await new Promise(r => setTimeout(r, 1500));

  const hasLoginPassInput = await page.evaluate(() => {
    const el = document.getElementById('login-pass');
    return el ? true : false;
  });

  const hasTogglePassBtn = await page.evaluate(() => {
    const el = document.getElementById('toggle-login-pass-btn');
    return el ? true : false;
  });

  const titleText = await page.evaluate(() => document.title);

  console.log('Live Page Title:', titleText);
  console.log('Live Has #login-pass Input:', hasLoginPassInput);
  console.log('Live Has #toggle-login-pass-btn:', hasTogglePassBtn);

  await page.screenshot({ path: 'C:\\Users\\HP\\.gemini\\antigravity\\brain\\50f2b3ed-d65a-4584-967c-385849aa4889\\screenshot_live_verification.png', fullPage: false });
  console.log('Saved screenshot_live_verification.png');

  await browser.close();
})();
