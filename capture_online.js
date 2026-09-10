const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:\\Users\\HP\\.gemini\\antigravity\\brain\\50f2b3ed-d65a-4584-967c-385849aa4889';

async function run() {
  console.log("Launching Chrome from:", chromePath);
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 768 });

  const urlsToTest = [
    'https://alanlpereira.github.io/cumpreai-v2/',
    'https://cumpreai.alp-nexus.com/',
    'https://cumpreai-v2.alp-nexus.com/'
  ];

  let activeUrl = null;
  for (const url of urlsToTest) {
    console.log(`Testing URL reachability: ${url}...`);
    try {
      const resp = await page.goto(url, { waitUntil: 'networkidle2', timeout: 10000 });
      if (resp && resp.ok()) {
        console.log(`SUCCESS: ${url} responded with status ${resp.status()}`);
        activeUrl = url;
        break;
      } else {
        console.log(`URL ${url} returned status ${resp ? resp.status() : 'null'}`);
      }
    } catch (e) {
      console.log(`URL ${url} unreachable: ${e.message}`);
    }
  }

  if (!activeUrl) {
    console.log("Fallback to GitHub Pages URL: https://alanlpereira.github.io/cumpreai-v2/");
    activeUrl = 'https://alanlpereira.github.io/cumpreai-v2/';
  }

  console.log(`\n=== RUNNING E2E SCREENSHOT VERIFICATION ON: ${activeUrl} ===`);
  await page.goto(activeUrl, { waitUntil: 'networkidle2' });
  await page.waitForTimeout(1000);

  // 1. Initial Login Page
  const path1 = path.join(artifactDir, 'screenshot_online_1_login.png');
  await page.screenshot({ path: path1 });
  console.log(`Saved: ${path1}`);

  // 2. Click Super User preset button
  console.log("Testing Super User preset login online...");
  const superUserBtn = await page.$("button[onclick='loginAsSuperUser()']");
  if (superUserBtn) {
    await superUserBtn.click();
    await page.waitForTimeout(1200);
    const path2 = path.join(artifactDir, 'screenshot_online_2_superuser_dashboard.png');
    await page.screenshot({ path: path2 });
    console.log(`Saved: ${path2}`);
  }

  // 3. Test Real Onboarding Modal
  console.log("Navigating to Real Onboarding Flow online...");
  await page.goto(activeUrl, { waitUntil: 'networkidle2' });
  await page.waitForTimeout(500);

  // Click 'Cadastre-se' button
  const registerTab = await page.$("button[onclick=\"switchTab('register')\"]");
  if (registerTab) {
    await registerTab.click();
    await page.waitForTimeout(500);
  }

  const path3 = path.join(artifactDir, 'screenshot_online_3_onboarding_step1.png');
  await page.screenshot({ path: path3 });
  console.log(`Saved: ${path3}`);

  // Advance Onboarding Step 1 -> Step 2 OTP
  const onbNextBtn = await page.$("#btn-onb-step1");
  if (onbNextBtn) {
    await onbNextBtn.click();
    await page.waitForTimeout(500);
    const path4 = path.join(artifactDir, 'screenshot_online_4_otp_validation.png');
    await page.screenshot({ path: path4 });
    console.log(`Saved: ${path4}`);
  }

  // Complete OTP validation -> Dashboard Bronze
  const fillOtpBtn = await page.$("button[onclick='autoFillOTP()']");
  if (fillOtpBtn) {
    await fillOtpBtn.click();
    await page.waitForTimeout(300);
  }
  const verifyOtpBtn = await page.$("button[onclick='verifyOTP()']");
  if (verifyOtpBtn) {
    await verifyOtpBtn.click();
    await page.waitForTimeout(1000);
    const path5 = path.join(artifactDir, 'screenshot_online_5_bronze_dashboard.png');
    await page.screenshot({ path: path5 });
    console.log(`Saved: ${path5}`);
  }

  // 4. Test Module 6: Grandes Desafios online
  console.log("Navigating to Module 6 (Grandes Desafios) online...");
  const mod6Btn = await page.$("button[onclick=\"switchModule(6)\"]");
  if (mod6Btn) {
    await mod6Btn.click();
    await page.waitForTimeout(800);
    const path6 = path.join(artifactDir, 'screenshot_online_6_grandes_desafios.png');
    await page.screenshot({ path: path6 });
    console.log(`Saved: ${path6}`);
  }

  await browser.close();
  console.log("\n=== ONLINE SCREENSHOT VERIFICATION COMPLETE! ===");
}

run().catch(err => {
  console.error("FATAL ERROR:", err);
  process.exit(1);
});
