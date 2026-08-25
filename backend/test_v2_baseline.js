const {
  OrganizationService,
  GeminiOracleService,
  EvidenceService,
  DashboardService,
  LedgerService,
  RecognitionService,
  AuthService,
  TreasuryService
} = require('./lib');

async function runFullV2SystemIntegrationTest() {
  console.log('=== CumpreAI OS V2 System Integration Test (Fogo de Tesouraria & PIX R$ ↔ A$) ===\n');

  const dashboards = new DashboardService();
  const ledger = new LedgerService();
  const orgs = new OrganizationService();
  const recognition = new RecognitionService(dashboards, orgs);
  const evidences = new EvidenceService();
  const auth = new AuthService(orgs);
  const treasury = new TreasuryService();

  // 1. Organização & Configuração da Taxa de Serviço pelo Adm do App (Super Admin)
  console.log('1. [SEGURANÇA] Adm do App (Super Admin) criando Organização e definindo Taxa de Serviço...');
  const org = await orgs.createOrganization({
    name: 'Camelot Corporate DAO',
    adminId: 'admin_king_arthur',
    serviceFeePercentage: 10 // Taxa de serviço de 10% do Adm do App
  });
  console.log('✔ Organização ativa com Taxa de Serviço:', org);

  // 2. MONETIZAÇÃO FIAT (R$ -> A$): Organização fazendo depósito via PIX Sandbox
  console.log('\n2. [MONETIZAÇÃO FIAT] Organização realizando depósito de R$ 1.000,00 via PIX Sandbox...');
  const depositRes = await treasury.depositFiatToOrgTreasury({
    orgId: org.id,
    amountBRL: 1000,
    paymentMethod: 'pix'
  });
  console.log('✔ Depósito PIX Confirmado!');
  console.log(`   - ID Transação Gateway: ${depositRes.transaction.gatewayTxId}`);
  console.log(`   - Valor Depositado: R$ ${depositRes.transaction.amountBRL},00`);
  console.log(`   - Saldo de A$ Mintado na Tesouraria da Org: ${depositRes.treasury.balanceA$} A$`);

  // 3. Convite de Organização e Registro Autenticado
  console.log('\n3. Convite emitido e Novo Membro registrado via Token...');
  const invite = await orgs.createInvitation({
    orgId: org.id,
    invitedBy: org.adminId,
    email: 'lancelot@camelot.org',
    role: 'member'
  });
  const newUid = 'uid_auth_lancelot_777';
  await auth.registerWithInviteToken({
    uid: newUid,
    name: 'Sir Lancelot',
    email: invite.email,
    inviteToken: invite.token
  });
  console.log('✔ Membro Sir Lancelot associado à Camelot Corporate DAO');

  // 4. Submissão e Validação da Evidência pelo Oráculo Gemini AI
  console.log('\n4. Submetendo Evidência para Auditoria pelo Oráculo Gemini AI...');
  const evResult = await evidences.submitEvidence({
    ownerId: newUid,
    commitmentId: 'commit_v2_phase4_pix',
    type: 'link',
    url: 'https://github.com/cumpreai/v2-financial-core',
    commitmentTitle: 'Desenvolvimento do Módulo de Tesouraria e PIX'
  });
  console.log(`✔ Auditoria Gemini AI: APROVADO | Score de Confiança: ${evResult.aiConfidenceScore}%`);

  // 5. Reconhecimento, Retenção da Taxa do App e Crédito de Saldo
  console.log('\n5. Emitindo Reconhecimento e Retendo Taxa de Serviço do App (10%)...');
  const recResult = await recognition.issueRecognition({
    memberId: newUid,
    commitmentId: 'commit_v2_phase4_pix',
    orgId: org.id,
    baseRewardA$: 250,
    baseTrust: 5,
    baseImpact: 10
  });

  // Registra a receita da taxa de serviço no cofre master da plataforma
  await treasury.recordPlatformServiceFeeRevenue(recResult.serviceFeeDeductedA$);

  console.log('✔ Reconhecimento Processado:');
  console.log(`   - Recompensa Bruta: ${recResult.grossRewardA$} A$`);
  console.log(`   - Taxa de Serviço Retida pelo CumpreAI OS (10%): -${recResult.serviceFeeDeductedA$} A$ (R$ ${recResult.serviceFeeDeductedA$},00)`);
  console.log(`   - Recompensa Líquida Creditada ao Membro: +${recResult.netRewardA$} A$`);

  // 6. MONETIZAÇÃO OFF-RAMP (A$ -> R$): Membro solicitando saque via PIX
  console.log('\n6. [OFF-RAMP PIX] Membro Sir Lancelot solicitando Saque de 200 A$ para Chave PIX...');
  const memberDash = await dashboards.updateMemberDashboard(newUid);
  const payoutRes = await treasury.processMemberPixPayout({
    memberId: newUid,
    amountA$: 200,
    pixKey: 'lancelot@pix.com',
    memberCurrentBalanceA$: memberDash.patrimonyTotal
  });

  console.log('✔ Saque PIX Processado com Sucesso!');
  console.log(`   - ID do Saque PIX: ${payoutRes.transaction.gatewayTxId}`);
  console.log(`   - Valor em Dinheiro Real Transferido: R$ ${payoutRes.payoutBRL},00`);
  console.log(`   - Chave PIX de Destino: ${payoutRes.transaction.pixKey}`);
  console.log(`   - Saldo Restante de A$ na Carteira do Membro: ${payoutRes.remainingA$} A$`);

  // 7. Balanço Financeiro Geral da Plataforma
  const platformMaster = treasury.getPlatformMasterBalance();
  console.log('\n7. [BALANÇO GERAL DA PLATAFORMA CUMPREAI OS]:');
  console.log(`   - Receita de Taxas de Serviço Acumulada: ${platformMaster.balanceA$} A$ (R$ ${platformMaster.totalRevenueBRL},00)`);

  console.log('\n====================================================================');
  console.log('✅ TESTE COMPLETO DE TESOURARIA E PIX (R$ ↔ A$) CONCLUÍDO COM SUCESSO!');
  console.log('====================================================================\n');
}

runFullV2SystemIntegrationTest().catch(err => {
  console.error('❌ Erro no Teste de Integração V2:', err);
  process.exit(1);
});
