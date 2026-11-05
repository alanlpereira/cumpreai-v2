const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function generateAll() {
  console.log('Iniciando navegador Chrome...');
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=none']
  });

  // 1. Gera o Relatório Executivo A4
  const docHtmlPath = 'C:/Users/HP/.gemini/antigravity/brain/50f2b3ed-d65a-4584-967c-385849aa4889/planejamento_lancamento_piloto_cumpreai.html';
  const docPdfPath = 'C:/Users/HP/.gemini/antigravity/brain/50f2b3ed-d65a-4584-967c-385849aa4889/planejamento_lancamento_piloto_cumpreai.pdf';

  console.log('Carregando Relatório Executivo A4...');
  const page1 = await browser.newPage();
  await page1.goto('file:///' + docHtmlPath.replace(/\\/g, '/'), {
    waitUntil: 'networkidle0',
    timeout: 30000
  });

  console.log('Renderizando Relatório Executivo A4...');
  await page1.pdf({
    path: docPdfPath,
    format: 'A4',
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: '<div></div>',
    footerTemplate: `
      <div style="font-size: 7.5pt; color: #94a3b8; width: 100%; display: flex; justify-content: space-between; padding: 0 14mm; font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;">
        <span>CumpreAi &bull; Programa Piloto &bull; Confidencial</span>
        <span>Página <span class="pageNumber"></span> de <span class="totalPages"></span></span>
      </div>
    `,
    margin: {
      top: '12mm',
      bottom: '15mm',
      left: '12mm',
      right: '12mm'
    }
  });
  await page1.close();

  // 2. Gera a Apresentação Executiva em Slides 16:9
  const slidesHtmlPath = 'C:/Users/HP/.gemini/antigravity/brain/50f2b3ed-d65a-4584-967c-385849aa4889/apresentacao_executiva_piloto_cumpreai.html';
  const slidesPdfPath = 'C:/Users/HP/.gemini/antigravity/brain/50f2b3ed-d65a-4584-967c-385849aa4889/apresentacao_executiva_piloto_cumpreai.pdf';

  console.log('Carregando Apresentação em Slides 16:9...');
  const page2 = await browser.newPage();
  await page2.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 2 });
  await page2.goto('file:///' + slidesHtmlPath.replace(/\\/g, '/'), {
    waitUntil: 'networkidle0',
    timeout: 30000
  });

  console.log('Renderizando Slides 16:9 em PDF...');
  await page2.pdf({
    path: slidesPdfPath,
    width: '1920px',
    height: '1080px',
    printBackground: true,
    margin: { top: '0px', bottom: '0px', left: '0px', right: '0px' }
  });
  await page2.close();

  await browser.close();

  const statsDoc = fs.statSync(docPdfPath);
  const statsSlides = fs.statSync(slidesPdfPath);

  console.log('\n--- GERAÇÃO CONCLUÍDA COM SUCESSO! ---');
  console.log(`1. Relatório A4: ${docPdfPath} (${(statsDoc.size / 1024).toFixed(1)} KB)`);
  console.log(`2. Apresentação 16:9: ${slidesPdfPath} (${(statsSlides.size / 1024).toFixed(1)} KB)`);
}

generateAll().catch(err => {
  console.error('Erro na geração:', err);
  process.exit(1);
});
