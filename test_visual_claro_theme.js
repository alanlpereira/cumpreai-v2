const http = require('http');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const rootDir = 'C:\\Users\\HP\\.gemini\\antigravity\\scratch\\cumpreai_simulatorV2';
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

server.listen(8090, async () => {
  console.log('Testing Visual Claro Theme on http://localhost:8090');
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 768 });

  const pageUrl = 'http://localhost:8090';

  // 1. Initial Load (Cyberpunk Dark Mode)
  await page.goto(pageUrl, { waitUntil: 'networkidle2' });
  await delay(800);
  const p1 = path.join(artifactDir, 'screenshot_theme_1_dark.png');
  await page.screenshot({ path: p1 });
  console.log('Saved:', p1);

  // 2. Click Theme Toggle to switch to Visual Claro Executivo
  console.log('Switching to Visual Claro Executivo theme...');
  await page.evaluate(() => toggleTheme());
  await delay(800);

  const isLight = await page.evaluate(() => document.body.classList.contains('theme-visual-claro'));
  console.log('Theme visual claro active:', isLight);

  const p2 = path.join(artifactDir, 'screenshot_theme_2_visual_claro_login.png');
  await page.screenshot({ path: p2 });
  console.log('Saved:', p2);

  // 3. Login as Super User under Visual Claro Executivo
  console.log('Logging in as Super User under Visual Claro theme...');
  await page.evaluate(() => loginAsSuperUser());
  await delay(1000);
  const p3 = path.join(artifactDir, 'screenshot_theme_3_visual_claro_superuser.png');
  await page.screenshot({ path: p3 });
  console.log('Saved:', p3);

  // 4. Switch to Module 6 (Grandes Desafios) under Visual Claro Executivo
  console.log('Switching to Module 6 under Visual Claro theme...');
  await page.evaluate(() => switchGenesisModule(6));
  await delay(1000);
  const p4 = path.join(artifactDir, 'screenshot_theme_4_visual_claro_module6.png');
  await page.screenshot({ path: p4 });
  console.log('Saved:', p4);

  await browser.close();
  server.close();
  console.log('VISUAL CLARO THEME TEST COMPLETED SUCCESSFULLY!');
});
