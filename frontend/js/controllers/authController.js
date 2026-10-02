/**
 * CumpreAi OS v2 - Auth Controller
 * Handles authentication, login validation, vault purging, and onboarding steps.
 */

function togglePasswordVisibility(inputId, btnId) {
  const input = document.getElementById(inputId);
  const btn = document.getElementById(btnId);
  if (input) {
    if (input.type === "password") {
      input.type = "text";
      if (btn) btn.textContent = "🙈";
    } else {
      input.type = "password";
      if (btn) btn.textContent = "👁️";
    }
  }
}

function loginAsSuperUser() {
  const emailInput = document.getElementById("login-email");
  const passInput = document.getElementById("login-pass");
  const noticeElem = document.getElementById("login-notice");

  if (emailInput) emailInput.value = "alan.pereira@lp-nexus.com";
  if (passInput) {
    passInput.value = "";
    passInput.focus();
  }

  if (noticeElem) {
    noticeElem.textContent = "👑 E-mail de Master User preenchido (alan.pereira@lp-nexus.com). Digite sua senha de acesso no campo acima para entrar.";
    noticeElem.style.display = "block";
    noticeElem.style.borderColor = "rgba(16, 185, 129, 0.4)";
    noticeElem.style.color = "#10b981";
    noticeElem.style.background = "rgba(16, 185, 129, 0.1)";
  }
}

function loginAsOrgManager() {
  const emailInput = document.getElementById("login-email");
  const passInput = document.getElementById("login-pass");
  const noticeElem = document.getElementById("login-notice");

  if (emailInput) emailInput.value = "arthur@camelot.org";
  if (passInput) {
    passInput.value = "";
    passInput.focus();
  }

  if (noticeElem) {
    noticeElem.textContent = "🏢 E-mail de Gestor de Organização preenchido (arthur@camelot.org). Digite sua senha de acesso no campo acima para entrar.";
    noticeElem.style.display = "block";
    noticeElem.style.borderColor = "rgba(59, 130, 246, 0.4)";
    noticeElem.style.color = "#3b82f6";
    noticeElem.style.background = "rgba(59, 130, 246, 0.1)";
  }
}

function clearVaultCredentials() {
  localStorage.removeItem("saved_user_email");
  localStorage.removeItem("saved_user_pass");

  const emailInput = document.getElementById("login-email");
  const passInput = document.getElementById("login-pass");
  const rememberCheckbox = document.getElementById("remember-credentials");

  if (emailInput) emailInput.value = "";
  if (passInput) passInput.value = "";
  if (rememberCheckbox) rememberCheckbox.checked = false;

  const noticeElem = document.getElementById("login-notice");
  if (noticeElem) {
    noticeElem.textContent = "🗑️ Credenciais do cofre limpas com sucesso. Os campos de e-mail e senha foram resetados.";
    noticeElem.style.display = "block";
    noticeElem.style.borderColor = "rgba(16, 185, 129, 0.4)";
    noticeElem.style.color = "#10b981";
    noticeElem.style.background = "rgba(16, 185, 129, 0.1)";
  }
  if (typeof logSystem === "function") logSystem("VAULT: Saved credentials purged successfully from local vault.");
}

function handleLogin() {
  const emailEl = document.getElementById("login-email");
  const passEl = document.getElementById("login-pass");
  const noticeElem = document.getElementById("login-notice");

  const emailInput = emailEl ? emailEl.value.trim() : "";
  const passInput = passEl ? passEl.value.trim() : "";
  let nameInput = (document.getElementById("login-name") && document.getElementById("login-name").value) ? document.getElementById("login-name").value : "";
  const inviteTokenInput = document.getElementById("login-invite-token") ? document.getElementById("login-invite-token").value.trim() : "";
  const rememberCheckbox = document.getElementById("remember-credentials");

  if (!emailInput || !passInput) {
    if (noticeElem) {
      noticeElem.textContent = "⚠️ Por favor, informe seu e-mail e sua senha de acesso.";
      noticeElem.style.display = "block";
      noticeElem.style.borderColor = "rgba(239, 68, 68, 0.4)";
      noticeElem.style.color = "#ef4444";
      noticeElem.style.background = "rgba(239, 68, 68, 0.1)";
    }
    return;
  }

  const lowerEmail = emailInput.toLowerCase();
  const isSuperAdmin = (state.superUsers && state.superUsers.includes(lowerEmail)) || 
                       lowerEmail.includes("alan.pereira") || 
                       lowerEmail.includes("alan@lp-nexus") || 
                       lowerEmail.includes("alan@alp-nexus") ||
                       lowerEmail.includes("welingtonsoares") ||
                       lowerEmail.includes("welington");

  // STRICT PASSWORD VALIDATION: Super Admin
  if (isSuperAdmin) {
    if (passInput !== "superadmin123" && passInput !== "welington123" && passInput !== "cumpreai2026") {
      if (noticeElem) {
        noticeElem.textContent = "❌ Senha Incorreta: A senha informada para a conta Master User (Super Admin) está incorreta. Verifique suas credenciais.";
        noticeElem.style.display = "block";
        noticeElem.style.borderColor = "rgba(239, 68, 68, 0.4)";
        noticeElem.style.color = "#ef4444";
        noticeElem.style.background = "rgba(239, 68, 68, 0.1)";
      }
      if (typeof logSystem === "function") logSystem(`AUTH REJECTED: Invalid password for Master User ${emailInput}`);
      return;
    }
  }

  // STRICT PASSWORD VALIDATION: Org Manager
  const isOrgManager = inviteTokenInput || lowerEmail.includes("camelot") || lowerEmail.includes("orgmanager");
  if (isOrgManager && !isSuperAdmin) {
    if (passInput !== "orgmanager123") {
      if (noticeElem) {
        noticeElem.textContent = "❌ Senha Incorreta: A senha informada para o Gestor de Organização está incorreta. Verifique suas credenciais.";
        noticeElem.style.display = "block";
        noticeElem.style.borderColor = "rgba(239, 68, 68, 0.4)";
        noticeElem.style.color = "#ef4444";
        noticeElem.style.background = "rgba(239, 68, 68, 0.1)";
      }
      if (typeof logSystem === "function") logSystem(`AUTH REJECTED: Invalid password for Org Manager ${emailInput}`);
      return;
    }
  }

  if (rememberCheckbox && rememberCheckbox.checked) {
    localStorage.setItem("saved_user_email", emailInput);
  } else {
    localStorage.removeItem("saved_user_email");
  }

  const logoutHeaderBtn = document.getElementById("logout-btn-header");
  if (logoutHeaderBtn) logoutHeaderBtn.style.display = "inline-flex";

  if (isSuperAdmin) {
    if (typeof applyDesktopLayout === "function") applyDesktopLayout(true);
    const superName = lowerEmail.includes("welington") ? "Welington Soares" : "Alan Pereira";
    state.member.id = lowerEmail.includes("welington") ? "user_super_admin_002" : "user_super_admin_001";
    state.member.name = nameInput || superName;
    state.member.email = emailInput;
    state.member.userLevel = "Ouro";
    state.member.memberType = "superadmin";

    state.isPlatformSuperAdmin = true;
    state.member_dashboard.trustScore = 980;
    state.member_dashboard.patrimonyTotal = 25000;
    state.member_dashboard.momentumStreak = 45;

    const userBadge = document.querySelector(".context-badge");
    const dashUserContext = document.getElementById("dash-user-context");
    if (userBadge) userBadge.textContent = "🔒 Super Admin (Master User)";
    if (dashUserContext) dashUserContext.textContent = "🔒 Super Admin da Plataforma";

    if (typeof writeLedger === "function") writeLedger("SUPER_ADMIN_AUTHENTICATED", "superadmin", state.member.id, `Super User: ${emailInput} | Privileges UNLOCKED`);
    if (typeof logSystem === "function") logSystem(`AUTH: Master User Super Admin authenticated: ${emailInput} (Alan Pereira)`);

    const usernameElem = document.getElementById("dash-username");
    if (usernameElem) usernameElem.textContent = state.member.name;
    if (typeof showScreen === "function") showScreen(document.getElementById("screen-home"));
    if (typeof switchGenesisModule === "function") switchGenesisModule(6);
    if (window.router) window.router.navigate('/gestao/master');
    if (typeof updateDashboardUI === "function") updateDashboardUI();
  } else if (isOrgManager) {
    if (typeof applyDesktopLayout === "function") applyDesktopLayout(true);
    state.member.memberType = "organization";
    state.member.orgId = "org_camelot_dao";
    state.member.name = nameInput || "Gestor Camelot DAO";
    state.member.email = emailInput;
    state.member.userLevel = "Prata";
    state.isPlatformSuperAdmin = false;
    
    state.member_dashboard.trustScore = 450;
    state.member_dashboard.patrimonyTotal = 12000;
    state.member_dashboard.momentumStreak = 18;

    const userBadge = document.querySelector(".context-badge");
    const dashUserContext = document.getElementById("dash-user-context");
    if (userBadge) userBadge.textContent = "🏢 Gestor de Organização (Camelot DAO)";
    if (dashUserContext) dashUserContext.textContent = "🏢 Gestor de Organização (Camelot DAO)";

    if (typeof writeLedger === "function") writeLedger("ORG_MANAGER_AUTHENTICATED", "organization", state.member.id, `Org Manager: ${emailInput} | Org: Camelot DAO`);
    if (typeof logSystem === "function") logSystem(`AUTH: Organization Manager authenticated: ${emailInput} (Camelot DAO)`);

    const usernameElem = document.getElementById("dash-username");
    if (usernameElem) usernameElem.textContent = state.member.name;
    if (typeof showScreen === "function") showScreen(document.getElementById("screen-home"));
    if (typeof switchGenesisModule === "function") switchGenesisModule(6);
    if (window.router) window.router.navigate('/gestao/org');
    if (typeof updateDashboardUI === "function") updateDashboardUI();
  } else {
    if (typeof applyDesktopLayout === "function") applyDesktopLayout(false);
    state.member.name = nameInput || emailInput.split("@")[0];
    state.member.email = emailInput;
    state.member.memberType = "individual";
    state.isPlatformSuperAdmin = false;
    const userBadge = document.querySelector(".context-badge");
    if (userBadge) userBadge.textContent = "Pessoa Física";
    if (typeof writeLedger === "function") writeLedger("MEMBER_BOOTSTRAPPED", "member", state.member.id, `Name: ${state.member.name}`);
    if (typeof logSystem === "function") logSystem(`AUTH: User logged in as Independent Member: ${state.member.name}`);

    const usernameElem = document.getElementById("dash-username");
    if (usernameElem) usernameElem.textContent = state.member.name;
    if (typeof showScreen === "function") showScreen(document.getElementById("screen-home"));
    if (typeof switchGenesisModule === "function") switchGenesisModule(1);
    if (window.router) window.router.navigate('/membro/entrada');
    if (typeof updateDashboardUI === "function") updateDashboardUI();
  }
}

function handleLogout() {
  state.member = {
    id: "user_guest_00",
    name: "",
    email: "",
    userLevel: "Bronze",
    memberType: "guest"
  };
  state.isPlatformSuperAdmin = false;
  if (typeof applyDesktopLayout === "function") applyDesktopLayout(false);

  const logoutHeaderBtn = document.getElementById("logout-btn-header");
  if (logoutHeaderBtn) logoutHeaderBtn.style.display = "none";

  const userBadge = document.querySelector(".context-badge");
  const dashUserContext = document.getElementById("dash-user-context");
  if (userBadge) userBadge.textContent = "🔒 Não Autenticado";
  if (dashUserContext) dashUserContext.textContent = "🔒 Não Autenticado";

  const noticeElem = document.getElementById("login-notice");
  if (noticeElem) {
    noticeElem.textContent = "🔒 Você encerrou sua sessão com segurança. Informe seus dados para entrar novamente.";
    noticeElem.style.display = "block";
    noticeElem.style.borderColor = "rgba(59, 130, 246, 0.4)";
    noticeElem.style.color = "#3b82f6";
    noticeElem.style.background = "rgba(59, 130, 246, 0.1)";
  }

  if (typeof writeLedger === "function") writeLedger("USER_LOGGED_OUT", "auth", "guest", "User logged out successfully");
  if (typeof logSystem === "function") logSystem("AUTH: User logged out successfully. Redirecting to login screen.");
  if (typeof showScreen === "function") showScreen(document.getElementById("screen-login"));
  if (window.router) window.router.navigate('/auth/login');
}

window.togglePasswordVisibility = togglePasswordVisibility;
window.loginAsSuperUser = loginAsSuperUser;
window.loginAsOrgManager = loginAsOrgManager;
window.clearVaultCredentials = clearVaultCredentials;
window.handleLogin = handleLogin;
window.handleLogout = handleLogout;
