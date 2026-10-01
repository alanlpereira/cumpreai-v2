/**
 * CumpreAi OS v2 - Master Controller
 * Handles Platform Super Admin executive dashboard, partner organization fee controls, and live audit ledger feed.
 */

function toggleDashboardRoleView(role) {
  const masterContainer = document.getElementById("dash-master-user-container") || document.getElementById("perf-view-dark");
  const orgContainer = document.getElementById("dash-org-manager-container");
  const btnMaster = document.getElementById("btn-view-master");
  const btnOrg = document.getElementById("btn-view-org");

  if (role === "master") {
    if (masterContainer) masterContainer.style.display = "block";
    if (orgContainer) orgContainer.style.display = "none";
    if (btnMaster) btnMaster.classList.add("active");
    if (btnOrg) btnOrg.classList.remove("active");
    if (typeof logSystem === "function") logSystem("ROLE VIEW SWITCH: Displaying Master User Global Platform Dashboard");
    if (window.router) window.router.navigate('/gestao/master');
  } else {
    if (masterContainer) masterContainer.style.display = "none";
    if (orgContainer) orgContainer.style.display = "block";
    if (btnMaster) btnMaster.classList.remove("active");
    if (btnOrg) btnOrg.classList.add("active");
    if (typeof logSystem === "function") logSystem("ROLE VIEW SWITCH: Displaying B2B Organization Manager Dashboard");
    if (window.router) window.router.navigate('/gestao/org');
  }
}

function addNewOrganization() {
  const name = prompt("Nome da Nova Organização B2B:");
  if (!name || !name.trim()) return;
  const manager = prompt("E-mail do Gestor Principal:", "gestor@" + name.toLowerCase().replace(/[^a-z0-9]/g, '') + ".com");
  if (!manager) return;

  const fee = prompt("Taxa de Serviço Inicial da Plataforma (%):", "2.5");
  const feeNum = parseFloat(fee) || 2.5;

  const tbody = document.getElementById("tbl-master-orgs-body");
  if (tbody) {
    const tr = document.createElement("tr");
    tr.style.borderBottom = "1px solid rgba(255,255,255,0.05)";
    tr.innerHTML = `
      <td style="padding:0.6rem; font-weight:700; color:#fff;">🏢 ${name}</td>
      <td style="padding:0.6rem; color:#d1d5db;">${manager}</td>
      <td style="padding:0.6rem; font-weight:700; color:#10b981;">0 A$</td>
      <td style="padding:0.6rem; color:#3b82f6;">${feeNum.toFixed(1).replace('.', ',')}%</td>
      <td style="padding:0.6rem;"><span style="background:rgba(16,185,129,0.2); color:#10b981; padding:0.15rem 0.5rem; border-radius:999px; font-size:0.68rem; font-weight:700;">🟢 Ativa</span></td>
      <td style="padding:0.6rem; text-align:right;">
        <button class="btn-secondary" style="font-size:0.68rem; padding:0.2rem 0.5rem; border-color:#3b82f6; color:#3b82f6; margin-right:0.3rem;" onclick="editOrgFee('${name}')">⚙️ Alterar Taxa</button>
        <button class="btn-secondary" style="font-size:0.68rem; padding:0.2rem 0.5rem; border-color:#ef4444; color:#ef4444;" onclick="toggleOrgStatus('${name}')">🔒 Suspender</button>
      </td>
    `;
    tbody.appendChild(tr);
  }

  if (typeof writeLedger === "function") writeLedger("ORGANIZATION_CREATED", "master", name, `Manager: ${manager} | Fee: ${feeNum}%`);
  if (typeof logSystem === "function") logSystem(`MASTER EXEC: Organization "${name}" registered successfully.`);
  alert(`✅ Nova Organização B2B "${name}" cadastrada com sucesso!`);
}

function editOrgFee(orgId) {
  if (!state.isPlatformSuperAdmin && (state.member && state.member.memberType !== "superadmin")) {
    alert("🔒 PERMISSÃO NEGADA!\n\nApenas o Master User / Adm da Plataforma pode alterar taxas contratuais de organizações.");
    return;
  }
  const newFee = prompt(`Digitar nova taxa contratual da plataforma para ${orgId} (%):`, "2.0");
  if (!newFee) return;
  const feeVal = parseFloat(newFee);
  if (isNaN(feeVal) || feeVal < 0 || feeVal > 50) {
    alert("Por favor, digite uma taxa entre 0% e 50%.");
    return;
  }
  if (typeof writeLedger === "function") writeLedger("ORG_FEE_MODIFIED", "master", orgId, `New platform fee set to ${feeVal}%`);
  if (typeof logSystem === "function") logSystem(`MASTER EXEC: Platform fee for ${orgId} updated to ${feeVal}%`);
  alert(`⚙️ Taxa da organização "${orgId}" atualizada para ${feeVal}% com sucesso!`);
}

function toggleOrgStatus(orgId) {
  if (!state.isPlatformSuperAdmin && (state.member && state.member.memberType !== "superadmin")) {
    alert("🔒 PERMISSÃO NEGADA!\n\nApenas o Master User / Adm da Plataforma pode alterar o status executivo da organização.");
    return;
  }
  if (typeof writeLedger === "function") writeLedger("ORG_STATUS_TOGGLED", "master", orgId, `Org status updated`);
  if (typeof logSystem === "function") logSystem(`MASTER EXEC: Organization status toggled for ${orgId}`);
  alert(`🔒 Status da organização "${orgId}" alterado com sucesso.`);
}

function renderMasterLedgerFeed() {
  const feed = document.getElementById("master-ledger-feed");
  if (!feed) return;
  if (!state.ledger || state.ledger.length === 0) {
    feed.innerHTML = `<div style="color:#6b7280; font-style:italic;">Nenhum evento registrado no ledger ainda.</div>`;
    return;
  }
  
  feed.innerHTML = state.ledger.slice().reverse().map(ev => `
    <div style="border-bottom:1px solid rgba(255,255,255,0.05); padding:0.25rem 0;">
      <span style="color:#3b82f6;">[${new Date(ev.timestamp).toLocaleTimeString()}]</span>
      <span style="color:#a78bfa; font-weight:700;">[${ev.action}]</span>
      <span style="color:#10b981;">${ev.entity}:${ev.entityId}</span>
      <span style="color:#9ca3af;">- ${ev.actorId || ''}</span>
    </div>
  `).join('');
}

window.toggleDashboardRoleView = toggleDashboardRoleView;
window.addNewOrganization = addNewOrganization;
window.editOrgFee = editOrgFee;
window.toggleOrgStatus = toggleOrgStatus;
window.renderMasterLedgerFeed = renderMasterLedgerFeed;
