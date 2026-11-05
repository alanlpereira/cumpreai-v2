const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function generateTestPlaybookPDF() {
  const htmlPath = path.resolve('C:/Users/HP/.gemini/antigravity/brain/50f2b3ed-d65a-4584-967c-385849aa4889/planejamento_testes_funcionalidades_piloto.html');
  const pdfPath = path.resolve('C:/Users/HP/.gemini/antigravity/brain/50f2b3ed-d65a-4584-967c-385849aa4889/planejamento_testes_funcionalidades_piloto.pdf');

  console.log('Iniciando Google Chrome...');
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  
  console.log(`Carregando HTML do Caderno de Testes: ${htmlPath}`);
  await page.goto('file:///' + htmlPath.replace(/\\/g, '/'), {
    waitUntil: 'networkidle0',
    timeout: 30000
  });

  console.log('Renderizando PDF A4 executivo com paginação...');
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: '<div></div>',
    footerTemplate: `
      <div style="font-size: 7pt; color: #94a3b8; width: 100%; display: flex; justify-content: space-between; padding: 0 14mm; font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;">
        <span>CumpreAi &bull; Caderno de Homologação de Testes Piloto</span>
        <span>Página <span class="pageNumber"></span> de <span class="totalPages"></span></span>
      </div>
    `,
    margin: {
      top: '12mm',
      bottom: '14mm',
      left: '12mm',
      right: '12mm'
    }
  });

  await browser.close();

  const stats = fs.statSync(pdfPath);
  console.log(`\nPDF do Caderno de Testes gerado com sucesso!`);
  console.log(`Caminho: ${pdfPath}`);
  console.log(`Tamanho: ${(stats.size / 1024).toFixed(1)} KB`);
}

generateTestPlaybookPDF().catch(err => {
  console.error('Erro ao compilar PDF:', err);
  process.exit(1);
});
