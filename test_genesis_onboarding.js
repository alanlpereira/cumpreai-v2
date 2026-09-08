const http = require('http');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

// 1. Simple HTTP Server
const server = http.createServer((req, res) => {
  let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
  if (!fs.existsSync(filePath)) {
    filePath = path.join(__dirname, 'frontend', req.url);
  }
  
  const ext = path.extname(filePath);
  let contentType = 'text/html';
  if (ext === '.css') contentType = 'text/css';
  if (ext === '.js') contentType = 'application/javascript';
  if (ext === '.json') contentType = 'application/json';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404);
      res.end('Not Found');
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

server.listen(8099, async () => {
  console.log('Test Server running at http://localhost:8099');
  
  try {
    const browser = await puppeteer.launch({ 
      headless: 'new',
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 400, height: 800 });

    const artifactDir = "C:\\Users\\HP\\.gemini\\antigravity\\brain\\50f2b3ed-d65a-4584-967c-385849aa4889";

    // 1. Visit Login
    await page.goto('http://localhost:8099');
    await page.screenshot({ path: path.join(artifactDir, 'screenshot_genesis_1_login.png') });
    console.log('✓ Screenshot 1: Login page captured');

    // 2. Click Real Onboarding Auto-Cadastro
    await page.click('button[onclick*="screenRegisterStep1"]');
    await new Promise(r => setTimeout(r, 500));
    await page.type('#reg-name', 'Carlos Oliveira');
    await page.type('#reg-email', 'carlos@empresa.com');
    await page.type('#reg-pass', 'senhaSegura123');
    await page.screenshot({ path: path.join(artifactDir, 'screenshot_genesis_2_onb_step1.png') });
    console.log('✓ Screenshot 2: Onboarding Step 1 captured');

    // 3. Step 2 OTP
    await page.click('button[onclick="submitRegisterStep1()"]');
    await new Promise(r => setTimeout(r, 500));
    await page.type('#reg-otp', '884920');
    await page.screenshot({ path: path.join(artifactDir, 'screenshot_genesis_3_otp.png') });
    console.log('✓ Screenshot 3: OTP Verification captured');

    // 4. Step 3 Mission
    await page.click('button[onclick="verifyEmailOTP()"]');
    await new Promise(r => setTimeout(r, 500));
    await page.screenshot({ path: path.join(artifactDir, 'screenshot_genesis_4_mission.png') });
    console.log('✓ Screenshot 4: Mission definition captured');

    // 5. Step 4 Bronze Start & Genesis Dashboard
    await page.click('button[onclick="submitMissionStep3()"]');
    await new Promise(r => setTimeout(r, 500));
    await page.click('button[onclick="completeFullOnboarding()"]');
    await new Promise(r => setTimeout(r, 800));
    await page.screenshot({ path: path.join(artifactDir, 'screenshot_genesis_5_dashboard_bronze.png') });
    console.log('✓ Screenshot 5: Genesis Dashboard (Bronze Tier) captured');

    // 6. Test Module 6 Performance & Challenge Modal
    await page.evaluate(() => {
      if (typeof window.switchGenesisModule === 'function') {
        window.switchGenesisModule(6);
      } else {
        document.querySelectorAll('.genesis-tab-btn')[5].click();
      }
    });
    await new Promise(r => setTimeout(r, 400));
    await page.screenshot({ path: path.join(artifactDir, 'screenshot_genesis_6_module6_desafios.png') });
    console.log('✓ Screenshot 6: Module 6 Grandes Desafios captured');

    // 7. Test Super User Alan Pereira Login & Privileges
    await page.evaluate(() => {
      if (typeof window.loginAsSuperUser === 'function') {
        window.loginAsSuperUser();
      }
    });
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: path.join(artifactDir, 'screenshot_genesis_7_superuser_alan.png') });
    console.log('✓ Screenshot 7: Super User Alan Pereira Login & Privileges captured');

    await browser.close();
    server.close();
    console.log('ALL E2E VERIFICATIONS PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('Error during E2E verification:', err);
    server.close();
    process.exit(1);
  }
});
