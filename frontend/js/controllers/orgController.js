/**
 * CumpreAi OS v2 - Org Controller
 * Handles B2B Organization treasury management, B2B invite tokens, and team payouts/bonuses.
 */

function rechargeOrgTreasuryPix() {
  const amountStr = prompt("Informe o valor da recarga em Reais (R$) via PIX para a Tesouraria da Organização:", "5000");
  if (!amountStr) return;
  const brl = parseFloat(amountStr);
  if (isNaN(brl) || brl <= 0) {
    alert("Valor de recarga inválido.");
    return;
  }

  const kpiTreasury = document.getElementById("org-kpi-treasury");
  if (kpiTreasury) {
    const currentVal = parseFloat(kpiTreasury.textContent.replace(/[^0-9]/g, '')) || 12000;
    const newVal = currentVal + brl;
    kpiTreasury.textContent = `${newVal.toLocaleString('pt-BR')} A$`;
  }

  const txId = "pix_b2b_" + Math.random().toString(36).substr(2, 8);
  if (typeof writeLedger === "function") writeLedger("PIX_ORG_TREASURY_RECHARGED", "treasury", "org_camelot_dao", `Deposit: R$ ${brl},00 -> Minted ${brl} A$ | Tx: ${txId}`);
  if (typeof logSystem === "function") logSystem(`B2B TREASURY: Organization recharged treasury with R$ ${brl},00 (+${brl} A$) via PIX.`);
  alert(`💳 Recarga PIX realizada com sucesso!\n\nValor Recebido: R$ ${brl},00\nA$ Mintados na Tesouraria: +${brl} A$\nID da Transação: ${txId}`);
}

function generateInviteToken() {
  const token = "CAMELOT-INVITE-2025-" + Math.random().toString(36).substr(2, 4).toUpperCase();
  const tokenElem = document.getElementById("org-invite-token-display");
  if (tokenElem) tokenElem.textContent = token;

  state.activeInviteToken = token;
  if (typeof writeLedger === "function") writeLedger("B2B_INVITE_GENERATED", "organization", "org_camelot_dao", `Invite Token: ${token}`);
  if (typeof logSystem === "function") logSystem(`B2B ORG: New invitation token generated: ${token}`);
  alert(`➕ Novo Token de Convite B2B gerado com sucesso!\n\nToken: ${token}`);
}

function grantOrgBonus(memberName) {
  const amountStr = prompt(`Informe a quantidade de A$ da Tesouraria para premiar ${memberName}:`, "250");
  if (!amountStr) return;
  const amount = parseFloat(amountStr);
  if (isNaN(amount) || amount <= 0) {
    alert("Valor inválido.");
    return;
  }

  if (typeof writeLedger === "function") writeLedger("MEMBER_BONUS_GRANTED", "organization", memberName, `Bonus granted: +${amount} A$ from Org Treasury`);
  if (typeof logSystem === "function") logSystem(`B2B PAYOUT: ${memberName} awarded +${amount} A$ bonus from Org Treasury.`);
  alert(`🎁 Recompensa de +${amount} A$ enviada com sucesso para ${memberName}!`);
}

window.rechargeOrgTreasuryPix = rechargeOrgTreasuryPix;
window.generateInviteToken = generateInviteToken;
window.grantOrgBonus = grantOrgBonus;
