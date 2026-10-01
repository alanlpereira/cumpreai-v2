const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('file:///' + path.resolve(__dirname, '../index.html').replace(/\\/g, '/'), { waitUntil: 'load' });
  await page.click('button[onclick="loginAsSuperUser()"]');
  await new Promise(r => setTimeout(r, 400));
  await page.type('#login-pass', 'superadmin123');
  await page.click('button[type="submit"]');
  await new Promise(r => setTimeout(r, 1200));

  const children = await page.evaluate(() => {
    const wrapper = document.querySelector('.screen-wrapper');
    if (!wrapper) return [];
    return Array.from(wrapper.children).map(child => {
      const rect = child.getBoundingClientRect();
      const style = window.getComputedStyle(child);
      return {
        id: child.id,
        className: child.className,
        display: style.display,
        height: rect.height,
        top: rect.top,
        visibility: style.visibility,
        position: style.position
      };
    });
  });

  console.log('Screen Wrapper Children:', JSON.stringify(children, null, 2));
  await browser.close();
})();
