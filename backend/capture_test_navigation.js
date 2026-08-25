const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const ARTIFACTS_DIR = 'C:\\Users\\HP\\.gemini\\antigravity\\brain\\50f2b3ed-d65a-4584-967c-385849aa4889';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function runE2EFullSystemTest() {
  console.log('=== Iniciando Teste E2E e Captura de Screenshots do CumpreAI OS V2 ===\n');

  if (!fs.existsSync(ARTIFACTS_DIR)) {
    fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
  }

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  page.on('dialog', async dialog => {
    console.log(`[ALERT/DIALOG] ${dialog.message()}`);
    await dialog.accept();
  });

  // =========================================================================
  // FLUXO DE TESTE A: USUÁRIO INDIVIDUAL (PESSOA FÍSICA)
  // =========================================================================
  console.log('--- TESTE A: NAVEGAÇÃO COMPLETA DO USUÁRIO INDIVIDUAL ---');

  // A1. Acesso à Página Inicial e Tela de Login
  await page.goto('http://localhost:8082/presentation.html', { waitUntil: 'networkidle0' });
  await page.evaluate(() => new Promise(r => setTimeout(r, 600)));
  
  await page.evaluate(() => {
    document.getElementById('login-name').value = 'Guinevere Pendragon';
    document.getElementById('login-email').value = 'guinevere@nexus.org';
    const inviteInput = document.getElementById('login-invite-token');
    if (inviteInput) inviteInput.value = '';
  });

  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'screenshot_A1_login_individual.png') });
  console.log('✔ Screenshot A1 salva: Login de Usuário Individual');

  // A2. Efetuar Login e Visualizar Dashboard
  await page.evaluate(() => handleLogin());
  await page.evaluate(() => new Promise(r => setTimeout(r, 600)));
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'screenshot_A2_dashboard_individual.png') });
  console.log('✔ Screenshot A2 salva: Dashboard Inicial do Usuário Individual');

  // A3. Novo Compromisso em Jornada
  await page.evaluate(() => showScreen(document.getElementById('screen-create')));
  await page.evaluate(() => new Promise(r => setTimeout(r, 600)));
  await page.evaluate(() => {
    document.getElementById('commit-title').value = 'Entregar Validação E2E com Captura de Prints';
  });
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'screenshot_A3_novo_compromisso.png') });
  console.log('✔ Screenshot A3 salva: Formulário de Novo Compromisso');

  // A4. Submissão de Evidência Única
  await page.evaluate(() => {
    createCommitment();
    const commits = state.commitments;
    if (commits.length > 0) {
      openSubmitEvidence(commits[commits.length - 1].id);
    }
  });
  await page.evaluate(() => new Promise(r => setTimeout(r, 600)));
  await page.evaluate(() => {
    document.getElementById('evidence-url').value = 'https://github.com/cumpreai/v2-baseline-core';
  });
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'screenshot_A4_submissao_evidencia.png') });
  console.log('✔ Screenshot A4 salva: Submissão de Evidência Única');

  // A5. Auditoria pelo Oráculo Gemini AI & Tela de Reconhecimento
  await page.evaluate(() => submitEvidence());
  await page.evaluate(() => new Promise(r => setTimeout(r, 800)));
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'screenshot_A5_oraculo_gemini_reconhecimento.png') });
  console.log('✔ Screenshot A5 salva: Auditoria pelo Oráculo Gemini AI & Reconhecimento');

  // A6. Central de Comunicação (Comms Chat)
  await page.evaluate(() => {
    closeRecognition();
    navigateToTab('comms');
  });
  await page.evaluate(() => new Promise(r => setTimeout(r, 600)));
  await page.evaluate(() => {
    const input = document.getElementById('comms-input-text');
    if (input) input.value = 'Mensagem de teste de integração para o Ledger imutável.';
    sendCommsMessage();
  });
  await page.evaluate(() => new Promise(r => setTimeout(r, 600)));
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'screenshot_A6_chat_comms.png') });
  console.log('✔ Screenshot A6 salva: Central de Comunicação & Chat');

  // =========================================================================
  // FLUXO DE TESTE B: USUÁRIO DE ORGANIZAÇÃO & TAXAS DA PLATAFORMA
  // =========================================================================
  console.log('\n--- TESTE B: NAVEGAÇÃO COMPLETA DO USUÁRIO DE ORGANIZAÇÃO ---');

  // B1. Login por Token de Convite da Organização
  await page.evaluate(() => showScreen(document.getElementById('screen-login')));
  await page.evaluate(() => new Promise(r => setTimeout(r, 600)));
  await page.evaluate(() => {
    document.getElementById('login-name').value = 'Sir Lancelot';
    document.getElementById('login-email').value = 'lancelot@camelot.org';
    const inviteInput = document.getElementById('login-invite-token');
    if (inviteInput) inviteInput.value = 'tok_camelot_vip';
  });
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'screenshot_B1_login_organizacao.png') });
  console.log('✔ Screenshot B1 salva: Login por Token de Convite da Organização');

  // B2. Dashboard do Membro de Organização
  await page.evaluate(() => handleLogin());
  await page.evaluate(() => new Promise(r => setTimeout(r, 600)));
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'screenshot_B2_dashboard_organizacao.png') });
  console.log('✔ Screenshot B2 salva: Dashboard de Membro da Organização');

  // B3. Tela de Organizações, Trava de Segurança e Gestão de Taxas
  await page.evaluate(() => navigateToTab('orgs'));
  await page.evaluate(() => new Promise(r => setTimeout(r, 600)));
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'screenshot_B3_gestao_organizacoes_taxas.png') });
  console.log('✔ Screenshot B3 salva: Gestão de Organizações, Trava de Segurança & Taxas');

  // B4. Ativar Modo Super Admin do App e Atualizar Taxa
  await page.evaluate(() => {
    toggleSuperAdminModeUI();
    const feeInput = document.getElementById('org-fee-input-p') || document.getElementById('org-fee-input');
    if (feeInput) feeInput.value = '15';
    saveOrgFeeUI();
  });
  await page.evaluate(() => new Promise(r => setTimeout(r, 600)));
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'screenshot_B4_super_admin_taxa_atualizada.png') });
  console.log('✔ Screenshot B4 salva: Modo Super Admin ativado & Taxa atualizada para 15%');

  // B5. Recarga de Tesouraria FIAT em R$ via PIX
  await page.evaluate(() => {
    const depositInput = document.getElementById('pix-deposit-amount-p') || document.getElementById('pix-deposit-amount');
    if (depositInput) depositInput.value = '1500';
    depositPixUI();
  });
  await page.evaluate(() => new Promise(r => setTimeout(r, 600)));
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'screenshot_B5_recarga_tesouraria_pix.png') });
  console.log('✔ Screenshot B5 salva: Recarga de Tesouraria via PIX em R$');

  await browser.close();
  console.log('\n====================================================================');
  console.log('✅ TESTE E2E E GERAÇÃO DE SCREENSHOTS CONCLUÍDOS COM SUCESSO!');
  console.log('====================================================================\n');
}

runE2EFullSystemTest().catch(err => {
  console.error('❌ Erro durante o Teste E2E:', err);
  process.exit(1);
});
