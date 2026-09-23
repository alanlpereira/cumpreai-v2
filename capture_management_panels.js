const http = require('http');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const rootDir = __dirname;
const artifactDir = 'C:\\Users\\HP\\.gemini\\antigravity\\brain\\50f2b3ed-d65a-4584-967c-385849aa4889';
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const delay = ms => new Promise(r => setTimeout(r, ms));

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg'
};

const server = http.createServer((req, res) => {
  let reqUrl = req.url.split('?')[0];
  if (reqUrl === '/') reqUrl = '/index.html';
  const filePath = path.join(rootDir, reqUrl);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(8094, async () => {
  console.log('Running Management Panel Verification on http://localhost:8094');
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 768 });

  const pageUrl = 'http://localhost:8094';

  // 1. Login Screen with Autofill & Remember Credentials checkbox
  await page.goto(pageUrl, { waitUntil: 'networkidle2' });
  await delay(500);
  await page.evaluate(() => loginAsSuperUser());
  await delay(500);
  const p1 = path.join(artifactDir, 'screenshot_panel_1_login_autofill.png');
  await page.screenshot({ path: p1 });
  console.log('Saved:', p1);

  // 2. Submit Login as Master User -> Dashboard
  await page.evaluate(() => handleLogin());
  await delay(1000);
  const p2 = path.join(artifactDir, 'screenshot_panel_2_master_user_dashboard.png');
  await page.screenshot({ path: p2 });
  console.log('Saved:', p2);

  // 3. Switch to Module 4: Gestão do Ecossistema (Master User Control Panel)
  await page.evaluate(() => switchGenesisModule(4));
  await delay(1000);
  const p3 = path.join(artifactDir, 'screenshot_panel_3_master_user_ecosystem.png');
  await page.screenshot({ path: p3 });
  console.log('Saved:', p3);

  // 4. Return to Login and Autopreencher Org Manager
  await page.goto(pageUrl, { waitUntil: 'networkidle2' });
  await delay(500);
  await page.evaluate(() => loginAsOrgManager());
  await delay(500);
  const p4 = path.join(artifactDir, 'screenshot_panel_4_org_manager_login.png');
  await page.screenshot({ path: p4 });
  console.log('Saved:', p4);

  // 5. Submit Login as Org Manager -> Org Dashboard & Modules
  await page.evaluate(() => handleLogin());
  await delay(1000);
  const p5 = path.join(artifactDir, 'screenshot_panel_5_org_manager_dashboard.png');
  await page.screenshot({ path: p5 });
  console.log('Saved:', p5);

  await browser.close();
  server.close();
  console.log('MANAGEMENT PANEL SCREENSHOTS CAPTURED SUCCESSFULLY!');
});
