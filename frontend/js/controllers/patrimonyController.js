/**
 * CumpreAi OS v2 - Patrimony & Financial Controller
 * Handles collateral stake calculation, PIX minting deposits, and PIX off-ramp payouts.
 */

function openCreateChallengeModal() {
  const modal = document.getElementById("modal-create-challenge");
  if (modal) modal.classList.add("active");
  updateChallengeStakeCalc();
}

function closeCreateChallengeModal() {
  const modal = document.getElementById("modal-create-challenge");
  if (modal) modal.classList.remove("active");
}

function updateChallengeStakeCalc() {
  const input = document.getElementById("chal-reward-val");
  const rewardInput = input ? (parseFloat(input.value) || 0) : 0;
  const stakeRequired = Math.round(rewardInput * 1.2);
  const lblReward = document.getElementById("calc-reward-lbl");
  const valStake = document.getElementById("calc-stake-val");
  if (lblReward) lblReward.textContent = rewardInput;
  if (valStake) valStake.textContent = `${stakeRequired.toLocaleString('pt-BR')} A$`;
}

function submitCreateChallenge() {
  const titleInput = document.getElementById("chal-title");
  const rewardInput = document.getElementById("chal-reward-val");
  
  const title = titleInput ? titleInput.value.trim() : "";
  const rewardVal = rewardInput ? (parseFloat(rewardInput.value) || 0) : 0;
  const stakeRequired = Math.round(rewardVal * 1.2);

  if (!title || rewardVal <= 0) {
    alert("Preencha o título e um valor válido de recompensa.");
    return;
  }

  if (state.member_dashboard.patrimonyTotal < stakeRequired) {
    alert(`Saldo insuficiente! Para lançar este desafio de ${rewardVal} A$, você precisa ter ao menos ${stakeRequired} A$ em saldo de custódia (Seu saldo atual: ${state.member_dashboard.patrimonyTotal} A$). Adquira A$ via PIX para continuar.`);
    return;
  }

  state.member_dashboard.patrimonyTotal -= stakeRequired;
  if (typeof updateDashboardUI === "function") updateDashboardUI();
  closeCreateChallengeModal();

  alert(`🚀 Grande Desafio "${title}" criado com sucesso! ${stakeRequired} A$ foram alocados em fundo de custódia.`);
  if (typeof writeLedger === "function") writeLedger("CHALLENGE_CREATED_STAKE_LOCKED", "challenge", title, `Reward: ${rewardVal} A$ | Collateral Locked: ${stakeRequired} A$`);
}

function depositPixUI() {
  const input = document.getElementById("pix-deposit-amount") || document.getElementById("pix-deposit-amount-p");
  let brl = 100;
  if (input) {
    brl = parseFloat(input.value) || 100;
  } else {
    const str = prompt("Informe o valor em Reais (R$) para recarga via PIX:", "100");
    if (!str) return;
    brl = parseFloat(str) || 0;
  }

  if (isNaN(brl) || brl <= 0) {
    alert("Por favor, informe um valor de recarga válido.");
    return;
  }

  state.member_dashboard.patrimonyTotal += brl;
  if (typeof updateDashboardUI === "function") updateDashboardUI();

  const txId = "pix_tx_" + Math.random().toString(36).substr(2, 8);
  if (typeof writeLedger === "function") writeLedger("PIX_DEPOSIT_COMPLETED", "treasury", "member_wallet", `Amount: R$ ${brl},00 -> Minted ${brl} A$ | Tx: ${txId}`);
  if (typeof logSystem === "function") logSystem(`TREASURY: FIAT PIX Deposit confirmed: R$ ${brl},00 -> Minted ${brl} A$ into Member Wallet`);
  alert(`💳 Depósito PIX Confirmado com Sucesso!\n\nValor Recebido: R$ ${brl},00\nA$ Mintados na Carteira: +${brl} A$\nID da Transação: ${txId}`);
}

function withdrawPixUI() {
  const pixKey = prompt("Digite a sua Chave PIX para receber o saque em R$ (Ex: lancelot@pix.com ou CPF):");
  if (!pixKey || pixKey.trim() === "") return;

  const amountStr = prompt(`Informe a quantidade de A$ que deseja sacar para R$ (Disponível: ${state.member_dashboard.patrimonyTotal} A$):`, "100");
  if (!amountStr) return;

  const amountA$ = parseFloat(amountStr);
  if (isNaN(amountA$) || amountA$ <= 0) {
    alert("Valor de saque inválido.");
    return;
  }

  if (amountA$ > state.member_dashboard.patrimonyTotal) {
    alert(`Saldo insuficiente! Você possui ${state.member_dashboard.patrimonyTotal} A$ e tentou sacar ${amountA$} A$.`);
    return;
  }

  state.member_dashboard.patrimonyTotal -= amountA$;
  const txId = "pix_out_" + Math.random().toString(36).substr(2, 8);
  if (typeof writeLedger === "function") writeLedger("PIX_PAYOUT_COMPLETED", "member", state.member.id, `Withdrawn: ${amountA$} A$ -> Transfered R$ ${amountA$},00 via PIX to ${pixKey} | Tx: ${txId}`);
  if (typeof logSystem === "function") logSystem(`OFF-RAMP PIX: Member withdrew ${amountA$} A$ -> Transfered R$ ${amountA$},00 to PIX Key: ${pixKey}`);
  
  if (typeof updateDashboardUI === "function") updateDashboardUI();
  alert(`💸 Saque PIX Concluído com Sucesso!\n\nValor Transferido para sua conta bancária: R$ ${amountA$},00\nChave PIX: ${pixKey}\nSaldo Restante na Carteira: ${state.member_dashboard.patrimonyTotal} A$`);
}

window.openCreateChallengeModal = openCreateChallengeModal;
window.closeCreateChallengeModal = closeCreateChallengeModal;
window.updateChallengeStakeCalc = updateChallengeStakeCalc;
window.submitCreateChallenge = submitCreateChallenge;
window.depositPixUI = depositPixUI;
window.withdrawPixUI = withdrawPixUI;
