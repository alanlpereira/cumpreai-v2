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

server.listen(8088, async () => {
  console.log('Static server running on http://localhost:8088');
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 768 });

  const pageUrl = 'http://localhost:8088';

  // 1. Login Page & Super User Button
  await page.goto(pageUrl, { waitUntil: 'networkidle2' });
  await delay(800);
  const p1 = path.join(artifactDir, 'screenshot_online_1_login.png');
  await page.screenshot({ path: p1 });
  console.log('Saved:', p1);

  // 2. Super User Login
  const superUserBtn = await page.$("button[onclick='loginAsSuperUser()']");
  if (superUserBtn) {
    await superUserBtn.click();
    await delay(1200);
    const p2 = path.join(artifactDir, 'screenshot_online_2_superuser_dashboard.png');
    await page.screenshot({ path: p2 });
    console.log('Saved:', p2);
  }

  // 3. Real Onboarding Step 1
  await page.goto(pageUrl, { waitUntil: 'networkidle2' });
  await delay(500);
  const regTab = await page.$("button[onclick=\"switchTab('register')\"]");
  if (regTab) await regTab.click();
  await delay(500);
  const p3 = path.join(artifactDir, 'screenshot_online_3_onboarding_step1.png');
  await page.screenshot({ path: p3 });
  console.log('Saved:', p3);

  // 4. Step 2 - OTP Code
  const step1Btn = await page.$("#btn-onb-step1");
  if (step1Btn) await step1Btn.click();
  await delay(500);
  const p4 = path.join(artifactDir, 'screenshot_online_4_otp_validation.png');
  await page.screenshot({ path: p4 });
  console.log('Saved:', p4);

  // 5. Complete OTP -> Bronze Dashboard
  const autoOtpBtn = await page.$("button[onclick='autoFillOTP()']");
  if (autoOtpBtn) await autoOtpBtn.click();
  await delay(300);
  const verifyOtpBtn = await page.$("button[onclick='verifyOTP()']");
  if (verifyOtpBtn) await verifyOtpBtn.click();
  await delay(1200);
  const p5 = path.join(artifactDir, 'screenshot_online_5_bronze_dashboard.png');
  await page.screenshot({ path: p5 });
  console.log('Saved:', p5);

  // 6. Module 6 - Grandes Desafios
  const mod6Btn = await page.$("button[onclick=\"switchModule(6)\"]");
  if (mod6Btn) await mod6Btn.click();
  await delay(1000);
  const p6 = path.join(artifactDir, 'screenshot_online_6_grandes_desafios.png');
  await page.screenshot({ path: p6 });
  console.log('Saved:', p6);

  await browser.close();
  server.close();
  console.log('ALL SCREENSHOTS CAPTURED SUCCESSFULLY!');
});
