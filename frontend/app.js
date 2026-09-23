// CumpreAi Simulator Core Logic

// Simulated State (Local Memory Database)
const state = {
  member: {
    id: "user_simulated_123",
    name: "Arthur Pendragon",
    email: "arthur@camelot.org",
    photoUrl: "",
    userLevel: "Bronze"
  },
  member_dashboard: {
    trustScore: 15, // Low baseline starting at Bronze level
    patrimonyTotal: 100, // 100 A$ starter bonus
    impactScore: 10,
    momentumStreak: 1, // 1 day streak
    currentJourneyId: "journey_baseline_v1",
    opportunitiesCount: 3,
    updatedAt: new Date().toISOString()
  },
  journeys: {
    "journey_baseline_v1": {
      id: "journey_baseline_v1",
      memberId: "user_simulated_123",
      title: "Consolidação da Baseline v1.0",
      status: "active"
    }
  },
  commitments: [
    {
      id: "commitment_01",
      journeyId: "journey_baseline_v1",
      memberId: "user_simulated_123",
      title: "Subir funções no emulador local",
      progress: 0,
      status: "active",
      createdAt: new Date().toISOString()
    },
    {
      id: "commitment_02",
      journeyId: "journey_baseline_v1",
      memberId: "user_simulated_123",
      title: "Limpar referências de Executions",
      progress: 100,
      status: "completed",
      completedAt: new Date().toISOString(),
      createdAt: new Date(Date.now() - 86400000).toISOString()
    }
  ],
  evidences: [],
  comms: [
    { id: "msg_01", sender: "Sistema", text: "Central de Comunicação ativada (Build 008)", timestamp: new Date().toISOString() }
  ],
  ledger: [
    {
      id: "event_init",
      actorId: "system",
      entity: "system",
      entityId: "system",
      action: "SYSTEM_INITIALIZED",
      timestamp: new Date().toISOString()
    }
  ]
};

// Simulation settings
let emulatorMode = false;
let onboardingStep = 1;
let currentActiveCommitmentId = null;
let currentBuild = 15;

// Organization & V2 Settings
state.orgServiceFeePercentage = 10; // Default 10% Org Service Fee
state.activeInviteToken = null;

// DOM Elements
const screenSplash = document.getElementById("screen-splash");
const screenOnboarding = document.getElementById("screen-onboarding");
const screenLogin = document.getElementById("screen-login");
const screenRegisterStep1 = document.getElementById("screen-register-step1");
const screenRegisterStep2 = document.getElementById("screen-register-step2");
const screenRegisterStep3 = document.getElementById("screen-register-step3");
const screenRegisterStep4 = document.getElementById("screen-register-step4");
const screenHome = document.getElementById("screen-home");
const screenCreate = document.getElementById("screen-create");
const screenSubmit = document.getElementById("screen-submit");
const screenRecognition = document.getElementById("screen-recognition");
const screenExplore = document.getElementById("screen-explore");
const screenComms = document.getElementById("screen-comms");
const screenOrgs = document.getElementById("screen-orgs");
const screenCommunities = document.getElementById("screen-communities");
const screenMarketplace = document.getElementById("screen-marketplace");

const terminal = document.getElementById("terminal");
const jsonViewer = document.getElementById("json-viewer");
const emulatorToggle = document.getElementById("emulator-toggle");

// Screen transitions helper
function showScreen(screenToShow) {
  const screens = [
    screenSplash, screenOnboarding, screenLogin, 
    screenRegisterStep1, screenRegisterStep2, screenRegisterStep3, screenRegisterStep4,
    screenHome, screenCreate, screenSubmit, screenRecognition, screenExplore,
    screenComms, screenOrgs, screenCommunities, screenMarketplace
  ];
  
  screens.forEach(screen => {
    if (screen) screen.classList.remove("active");
  });
  
  if (screenToShow) {
    screenToShow.classList.add("active");
    logSystem(`Navigation: transitioned to #${screenToShow.id}`);
  }
}

// ----------------------------------------------------
// REAL ONBOARDING FLOW WIZARD
// ----------------------------------------------------
let pendingRegistration = {};

function submitRegisterStep1() {
  const accountType = document.getElementById("reg-account-type").value;
  const name = document.getElementById("reg-name").value.trim();
  const email = document.getElementById("reg-email").value.trim();
  const pass = document.getElementById("reg-pass").value;

  if (!name || !email || !pass) {
    alert("Por favor, preencha todos os campos para continuar.");
    return;
  }

  const generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
  pendingRegistration = { accountType, name, email, pass, otp: generatedOTP };
  
  logSystem(`ONBOARDING Step 1: User info submitted (${name}, ${email}) | Generated OTP: ${generatedOTP}`);
  writeLedger("REGISTER_STEP1_COMPLETED", "user", email, `Type: ${accountType} | OTP: ${generatedOTP}`);

  alert(`📧 E-mail de confirmação de conta enviado com sucesso para: ${email}\n\nPara fins de validação no navegador, o seu Código OTP de Ativação é: ${generatedOTP}`);

  const otpInputElem = document.getElementById("reg-otp");
  if (otpInputElem) otpInputElem.value = generatedOTP;

  const otpEmailDisplay = document.getElementById("reg-otp-email-display");
  if (otpEmailDisplay) otpEmailDisplay.textContent = email;

  showScreen(screenRegisterStep2);
}

function verifyEmailOTP() {
  const otpInputElem = document.getElementById("reg-otp");
  const otpInput = otpInputElem ? otpInputElem.value.trim() : "";
  const expectedOTP = pendingRegistration.otp || "884920";

  if (otpInput !== expectedOTP && otpInput !== "884920" && otpInput.length < 4) {
    alert(`Código de verificação incorreto! Por favor informe o código enviado (${expectedOTP}).`);
    return;
  }

  logSystem(`ONBOARDING Step 2: Email verified successfully via OTP ${otpInput}`);
  writeLedger("EMAIL_VERIFIED_OTP", "user", pendingRegistration.email, `OTP Code: ${otpInput}`);
  showScreen(screenRegisterStep3);
}

function submitMissionStep3() {
  const missionTitle = document.getElementById("reg-mission-title").value.trim();
  if (!missionTitle) {
    alert("Por favor, declare sua missão de vida.");
    return;
  }

  pendingRegistration.mission = missionTitle;
  logSystem(`ONBOARDING Step 3: Mission declared: "${missionTitle}"`);
  writeLedger("MISSION_DECLARED", "user", pendingRegistration.email, `Mission: ${missionTitle}`);
  showScreen(screenRegisterStep4);
}

function completeFullOnboarding() {
  const firstCommitTitle = document.getElementById("reg-first-commit").value.trim() || "Treinar 3x por semana";

  // Create member state initialized at BRONZE tier
  state.member.name = pendingRegistration.name || "Novo Membro";
  state.member.email = pendingRegistration.email || "membro@cumpreai.com";
  state.member.userLevel = "Bronze";
  
  state.member_dashboard.trustScore = 15; // Low starting TrustScore
  state.member_dashboard.patrimonyTotal = 100; // Starter bonus
  state.member_dashboard.momentumStreak = 1;

  // Add 1st commitment
  const newCommit = {
    id: `commit_onb_${Date.now()}`,
    journeyId: "journey_baseline_v1",
    memberId: state.member.id,
    title: firstCommitTitle,
    progress: 0,
    status: "active",
    createdAt: new Date().toISOString()
  };
  state.commitments.unshift(newCommit);

  logSystem(`ONBOARDING REAL COMPLETED: Member registered at BRONZE level with 100 A$ starter bonus.`);
  writeLedger("MEMBER_ONBOARDING_REAL_COMPLETE", "member", state.member.id, `Name: ${state.member.name} | Starter A$: 100 | TrustScore: 15 (Bronze)`);

  document.getElementById("dash-username").textContent = state.member.name;
  const mod2MissionElem = document.getElementById("mod2-mission-text");
  if (mod2MissionElem) mod2MissionElem.textContent = `"${pendingRegistration.mission || "Viver com mais saúde e energia para minha família."}"`;

  updateDashboardUI();
  showScreen(screenHome);
}

// ----------------------------------------------------
// FORGOT PASSWORD MODAL
// ----------------------------------------------------
function openForgotPasswordModal() {
  const modal = document.getElementById("modal-forgot-password");
  if (modal) modal.classList.add("active");
}
function closeForgotPasswordModal() {
  const modal = document.getElementById("modal-forgot-password");
  if (modal) modal.classList.remove("active");
}
function submitForgotPassword() {
  const email = document.getElementById("forgot-email").value.trim();
  if (!email) {
    alert("Informe seu e-mail cadastrado.");
    return;
  }
  alert(`Link de redefinição de senha enviado para ${email}! Verifique sua caixa de entrada.`);
  closeForgotPasswordModal();
  writeLedger("PASSWORD_RESET_REQUESTED", "user", email, "Reset link dispatched via system email");
}

// ----------------------------------------------------
// GENESIS 7-MODULE NAVIGATION TABS
// ----------------------------------------------------
function switchGenesisModule(moduleNum) {
  // Hide all modules
  document.querySelectorAll(".genesis-module-content").forEach(mod => {
    mod.classList.remove("active");
  });
  
  // Deactivate all tab buttons
  document.querySelectorAll(".genesis-tab-btn").forEach(btn => {
    btn.classList.remove("active");
  });

  // Activate selected module & tab
  const targetMod = document.getElementById(`gen-mod-${moduleNum}`);
  if (targetMod) targetMod.classList.add("active");

  const tabBtns = document.querySelectorAll(".genesis-tab-btn");
  if (tabBtns[moduleNum - 1]) tabBtns[moduleNum - 1].classList.add("active");

  logSystem(`GENESIS MODULE: Switched to Module ${moduleNum}`);
}

// ----------------------------------------------------
// GRANDES DESAFIOS (PÓS) STAKE/COLLATERAL CALCULATOR
// ----------------------------------------------------
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
  const rewardInput = parseFloat(document.getElementById("chal-reward-val").value) || 0;
  const stakeRequired = Math.round(rewardInput * 1.2);
  const lblReward = document.getElementById("calc-reward-lbl");
  const valStake = document.getElementById("calc-stake-val");
  if (lblReward) lblReward.textContent = rewardInput;
  if (valStake) valStake.textContent = `${stakeRequired.toLocaleString('pt-BR')} A$`;
}
function submitCreateChallenge() {
  const title = document.getElementById("chal-title").value.trim();
  const rewardVal = parseFloat(document.getElementById("chal-reward-val").value) || 0;
  const stakeRequired = Math.round(rewardVal * 1.2);

  if (!title || rewardVal <= 0) {
    alert("Preencha o título e um valor válido de recompensa.");
    return;
  }

  if (state.member_dashboard.patrimonyTotal < stakeRequired) {
    alert(`Saldo insuficiente! Para lançar este desafio de ${rewardVal} A$, você precisa ter ao menos ${stakeRequired} A$ em saldo de custódia (Seu saldo atual: ${state.member_dashboard.patrimonyTotal} A$). Adquira A$ via PIX para continuar.`);
    return;
  }

  // Deduct collateral and create challenge
  state.member_dashboard.patrimonyTotal -= stakeRequired;
  updateDashboardUI();
  closeCreateChallengeModal();

  alert(`🚀 Grande Desafio "${title}" criado com sucesso! ${stakeRequired} A$ foram alocados em fundo de custódia.`);
  writeLedger("CHALLENGE_CREATED_STAKE_LOCKED", "challenge", title, `Reward: ${rewardVal} A$ | Collateral Locked: ${stakeRequired} A$`);
}

// Window global bindings for inline handlers & test evaluation
window.switchGenesisModule = switchGenesisModule;
window.submitRegisterStep1 = submitRegisterStep1;
window.verifyEmailOTP = verifyEmailOTP;
window.submitMissionStep3 = submitMissionStep3;
window.completeFullOnboarding = completeFullOnboarding;
window.openForgotPasswordModal = openForgotPasswordModal;
window.closeForgotPasswordModal = closeForgotPasswordModal;
window.submitForgotPassword = submitForgotPassword;
window.openCreateChallengeModal = openCreateChallengeModal;
window.closeCreateChallengeModal = closeCreateChallengeModal;
window.updateChallengeStakeCalc = updateChallengeStakeCalc;
window.submitCreateChallenge = submitCreateChallenge;

// Theme Toggle Management (Cyberpunk Dark vs Visual Claro Executivo)
function toggleTheme() {
  const currentTheme = document.body.classList.contains("theme-visual-claro") ? "dark" : "visual_claro";
  applyTheme(currentTheme);
}

function applyTheme(themeName) {
  const btn = document.getElementById("theme-toggle-btn");
  if (themeName === "visual_claro") {
    document.body.classList.add("theme-visual-claro");
    if (btn) {
      btn.innerHTML = "🌙 Modo Cyberpunk";
      btn.style.background = "#0f172a";
      btn.style.color = "#f8fafc";
      btn.style.borderColor = "rgba(15, 23, 42, 0.2)";
    }
    localStorage.setItem("cumpreai_theme", "visual_claro");
    logSystem("THEME CHANGED: Visual Claro Executivo (Pitch v2 Theme)");
  } else {
    document.body.classList.remove("theme-visual-claro");
    if (btn) {
      btn.innerHTML = "☀️ Visual Claro Executivo";
      btn.style.background = "rgba(255,255,255,0.08)";
      btn.style.color = "#ffffff";
      btn.style.borderColor = "rgba(255,255,255,0.15)";
    }
    localStorage.setItem("cumpreai_theme", "dark");
    logSystem("THEME CHANGED: Cyberpunk Dark Mode (Original Genesis Theme)");
  }
}

function initTheme() {
  const savedTheme = localStorage.getItem("cumpreai_theme") || "dark";
  applyTheme(savedTheme);
}

window.toggleTheme = toggleTheme;
window.applyTheme = applyTheme;

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initTheme);
} else {
  initTheme();
}

// Register Super Users Registry in state
state.superUsers = [
  "alan.pereira@lp-nexus.com",
  "alan.pereira@alp-nexus.com",
  "alan@lp-nexus.com",
  "alan@alp-nexus.com",
  "superadmin@cumpreai.com"
];

function loginAsSuperUser() {
  const emailInput = document.getElementById("login-email");
  const passInput = document.getElementById("login-pass");
  const noticeElem = document.getElementById("login-notice");

  if (emailInput) emailInput.value = "alan.pereira@lp-nexus.com";
  if (passInput) passInput.value = "superadmin123";

  if (noticeElem) {
    noticeElem.textContent = "👑 Credenciais de Super User autopreenchidas! Clique em 'Entrar na Plataforma' para confirmar ou salvar no cofre.";
    noticeElem.style.display = "block";
  }
}

function loginAsOrgManager() {
  const emailInput = document.getElementById("login-email");
  const passInput = document.getElementById("login-pass");
  const noticeElem = document.getElementById("login-notice");

  if (emailInput) emailInput.value = "arthur@camelot.org";
  if (passInput) passInput.value = "orgmanager123";

  if (noticeElem) {
    noticeElem.textContent = "🏢 Credenciais de Gestor de Organização autopreenchidas! Clique em 'Entrar na Plataforma' para confirmar.";
    noticeElem.style.display = "block";
  }
}

window.loginAsSuperUser = loginAsSuperUser;
window.loginAsOrgManager = loginAsOrgManager;

// Handle Login & Invitation Token Registration
function handleLogin() {
  const emailInput = (document.getElementById("login-email") && document.getElementById("login-email").value) ? document.getElementById("login-email").value.trim() : "alan.pereira@lp-nexus.com";
  let nameInput = (document.getElementById("login-name") && document.getElementById("login-name").value) ? document.getElementById("login-name").value : "";
  const inviteTokenInput = document.getElementById("login-invite-token") ? document.getElementById("login-invite-token").value.trim() : "";
  const rememberCheckbox = document.getElementById("remember-credentials");

  if (rememberCheckbox && rememberCheckbox.checked) {
    localStorage.setItem("saved_user_email", emailInput);
  }

  const lowerEmail = emailInput.toLowerCase();
  const isSuperAdmin = state.superUsers.includes(lowerEmail) || 
                       lowerEmail.includes("alan.pereira") || 
                       lowerEmail.includes("alan@lp-nexus") || 
                       lowerEmail.includes("alan@alp-nexus");

  // Check if logging in as Super User / Master User
  if (isSuperAdmin) {
    state.member.id = "user_super_admin_001";
    state.member.name = nameInput || "Alan Pereira";
    state.member.email = emailInput;
    state.member.userLevel = "Ouro";
    state.member.memberType = "superadmin";

    state.isPlatformSuperAdmin = true;
    state.member_dashboard.trustScore = 980; // High TrustScore for Master User
    state.member_dashboard.patrimonyTotal = 25000; // 25.000 A$ Master Treasury Pool
    state.member_dashboard.momentumStreak = 45;

    const userBadge = document.querySelector(".context-badge");
    const dashUserContext = document.getElementById("dash-user-context");
    if (userBadge) userBadge.textContent = "🔒 Super Admin (Master User)";
    if (dashUserContext) dashUserContext.textContent = "🔒 Super Admin da Plataforma";

    const badge = document.getElementById("super-admin-badge");
    const badgeP = document.getElementById("super-admin-badge-p");
    const btn = document.getElementById("btn-toggle-admin");
    const btnP = document.getElementById("btn-toggle-admin-p");

    if (badge) { badge.textContent = "🔓 Adm do App (Editável)"; badge.style.background = "#10b981"; }
    if (badgeP) { badgeP.textContent = "🔓 Adm do App (Editável)"; badgeP.style.background = "#10b981"; }
    if (btn) btn.textContent = "Modo: Adm do App (Editável)";
    if (btnP) btnP.textContent = "Modo: Adm do App (Editável)";

    writeLedger("SUPER_ADMIN_AUTHENTICATED", "superadmin", state.member.id, `Super User: ${emailInput} | Privileges UNLOCKED`);
    logSystem(`AUTH: Master User Super Admin authenticated: ${emailInput} (Alan Pereira)`);
  } else if (inviteTokenInput || lowerEmail.includes("camelot") || lowerEmail.includes("orgmanager")) {
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

    writeLedger("ORG_MANAGER_AUTHENTICATED", "organization", state.member.id, `Org Manager: ${emailInput} | Org: Camelot DAO`);
    logSystem(`AUTH: Organization Manager authenticated: ${emailInput} (Camelot DAO)`);
  } else {
    state.member.name = nameInput || emailInput.split("@")[0];
    state.member.email = emailInput;
    state.member.memberType = "individual";
    state.isPlatformSuperAdmin = false;
    const userBadge = document.querySelector(".context-badge");
    if (userBadge) userBadge.textContent = "Pessoa Física";
    writeLedger("MEMBER_BOOTSTRAPPED", "member", state.member.id, `Name: ${state.member.name}`);
    logSystem(`AUTH: User logged in as Independent Member: ${state.member.name}`);
  }

  document.getElementById("dash-username").textContent = state.member.name;
  showScreen(screenHome);
  updateDashboardUI();
}

window.loginAsSuperUser = loginAsSuperUser;

// 15 Build Stage Activator
function activateBuild(buildNum) {
  currentBuild = buildNum;
  
  // Highlight pill button
  document.querySelectorAll(".build-pill").forEach((pill, idx) => {
    if (idx + 1 === buildNum) {
      pill.classList.add("active");
    } else {
      pill.classList.remove("active");
    }
  });
  
  const badge = document.getElementById("active-build-badge");
  const buildNames = {
    1: "Build 001 - Foundation",
    2: "Build 002 - Auth",
    3: "Build 003 - Onboarding",
    4: "Build 004 - Home",
    5: "Build 005 - Commitments",
    6: "Build 006 - Evidence",
    7: "Build 007 - Recognition",
    8: "Build 008 - Comms Center",
    9: "Build 009 - Organizations",
    10: "Build 010 - Communities",
    11: "Build 011 - Marketplace",
    12: "Build 012 - Opportunities",
    13: "Build 013 - System Integration",
    14: "Build 014 - Security & Performance",
    15: "Build 015 - Alpha Release"
  };
  
  if (badge) badge.textContent = buildNames[buildNum] || `Build ${buildNum}`;
  
  writeLedger("BUILD_STAGE_ACTIVATED", "build", `build_00${buildNum}`, `Switching to ${buildNames[buildNum]}`);
  logSystem(`BUILD ACTIVATED: ${buildNames[buildNum]} loaded into Smartphone Frame`);

  // Navigate to corresponding screen based on build
  switch (buildNum) {
    case 1: showScreen(screenSplash); break;
    case 2: showScreen(screenLogin); break;
    case 3: showScreen(screenOnboarding); break;
    case 4: showScreen(screenHome); updateDashboardUI(); break;
    case 5: showScreen(screenCreate); break;
    case 6: showScreen(screenSubmit); break;
    case 7: showScreen(screenRecognition); break;
    case 8: showScreen(screenComms); break;
    case 9: showScreen(screenOrgs); break;
    case 10: showScreen(screenCommunities); break;
    case 11: 
      showScreen(screenMarketplace); 
      const balEl = document.getElementById("market-patrimony-balance");
      if (balEl) balEl.textContent = `${state.member_dashboard.patrimonyTotal} A$`;
      break;
    case 12: showScreen(screenExplore); break;
    case 13: 
      showScreen(screenHome); 
      selectTab("ledger"); 
      logSystem("Build 013 (System Integration): Auditing event ledger consistency...");
      break;
    case 14: 
      showScreen(screenHome); 
      logSystem("Build 014 (Security & Performance): Verifying Firestore security rules...");
      break;
    case 15: 
      showScreen(screenHome); 
      updateDashboardUI(); 
      logSystem("Build 015 (Alpha Release): Baseline v1.0 100% active.");
      break;
  }
}

// Logging helper
function logEvent(action, entity, entityId, details = "") {
  const logDiv = document.createElement("div");
  logDiv.className = "log-entry";
  
  const timeSpan = document.createElement("span");
  timeSpan.className = "log-time";
  timeSpan.textContent = new Date().toLocaleTimeString();
  
  const actionSpan = document.createElement("span");
  actionSpan.className = "log-action";
  actionSpan.textContent = `[${action}]`;
  
  const detailSpan = document.createElement("span");
  detailSpan.className = "log-details";
  detailSpan.textContent = ` ${entity} (${entityId}) ${details}`;
  
  logDiv.appendChild(timeSpan);
  logDiv.appendChild(actionSpan);
  logDiv.appendChild(detailSpan);
  
  if (terminal) {
    terminal.appendChild(logDiv);
    terminal.scrollTop = terminal.scrollHeight;
  }
}

function logSystem(message) {
  const logDiv = document.createElement("div");
  logDiv.className = "log-entry";
  
  const timeSpan = document.createElement("span");
  timeSpan.className = "log-time";
  timeSpan.textContent = new Date().toLocaleTimeString();
  
  const sysSpan = document.createElement("span");
  sysSpan.className = "log-system";
  sysSpan.textContent = `[SYS] ${message}`;
  
  logDiv.appendChild(timeSpan);
  logDiv.appendChild(sysSpan);
  
  if (terminal) {
    terminal.appendChild(logDiv);
    terminal.scrollTop = terminal.scrollHeight;
  }
}

// JSON Database State Viewer
let activeTab = "commitments";
function updateJsonViewer() {
  let dataToDisplay = {};
  if (activeTab === "commitments") {
    dataToDisplay = state.commitments;
  } else if (activeTab === "evidences") {
    dataToDisplay = state.evidences;
  } else if (activeTab === "dashboard") {
    dataToDisplay = state.member_dashboard;
  } else if (activeTab === "comms") {
    dataToDisplay = state.comms;
  } else if (activeTab === "ledger") {
    dataToDisplay = state.ledger;
  }
  
  if (jsonViewer) {
    jsonViewer.textContent = JSON.stringify(dataToDisplay, null, 2);
  }
}

function selectTab(tabName) {
  activeTab = tabName;
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.classList.remove("active");
    if (btn.textContent.toLowerCase().includes(tabName)) {
      btn.classList.add("active");
    }
  });
  updateJsonViewer();
}

// Onboarding slider navigation
function nextOnboarding() {
  onboardingStep++;
  if (onboardingStep === 2) {
    document.getElementById("onb-icon").textContent = "🤝";
    document.getElementById("onb-title").textContent = "Firmar Compromissos";
    document.getElementById("onb-desc").textContent = "Defina suas metas, prazos e jornadas. O progresso é registrado diretamente no ledger descentralizado.";
    document.getElementById("dot-1").classList.remove("active");
    document.getElementById("dot-2").classList.add("active");
  } else if (onboardingStep === 3) {
    document.getElementById("onb-icon").textContent = "🏅";
    document.getElementById("onb-title").textContent = "Reconhecimento & Impacto";
    document.getElementById("onb-desc").textContent = "Envie evidências (fotos, vídeos ou links) para validar suas conquistas e aumentar sua pontuação de confiança.";
    document.getElementById("dot-2").classList.remove("active");
    document.getElementById("dot-3").classList.add("active");
    document.getElementById("btn-onboarding-next").textContent = "Começar Agora";
  } else {
    showScreen(screenLogin);
  }
}



// Update Home UI
function updateDashboardUI() {
  const dashTrust = document.getElementById("dash-trust-score");
  const dashPatrimony = document.getElementById("dash-patrimony");
  const dashImpact = document.getElementById("dash-impact");
  const dashOpps = document.getElementById("dash-opps");

  if (dashTrust) dashTrust.textContent = state.member_dashboard.trustScore;
  if (dashPatrimony) dashPatrimony.textContent = `${state.member_dashboard.patrimonyTotal} A$`;
  if (dashImpact) dashImpact.textContent = state.member_dashboard.impactScore;
  if (dashOpps) dashOpps.textContent = state.member_dashboard.opportunitiesCount;

  // Genesis v1.0 Header elements
  const genPatrimony = document.getElementById("gen-kpi-patrimony");
  const genTrust = document.getElementById("gen-kpi-trust");
  const genLevel = document.getElementById("gen-kpi-level");
  const genMomentum = document.getElementById("gen-kpi-momentum");
  const mod4Val = document.getElementById("mod4-patrimony-val");
  const mod7CommitCount = document.getElementById("mod7-commit-count");
  const mod7StreakCurr = document.getElementById("mod7-streak-curr");
  const mod7Name = document.getElementById("mod7-name");
  const mod7Tier = document.getElementById("mod7-tier");
  const dashUserContext = document.getElementById("dash-user-context");

  const currentLevel = state.member.userLevel || (state.member_dashboard.trustScore >= 90 ? "Prata" : "Bronze");

  if (genPatrimony) genPatrimony.textContent = `${state.member_dashboard.patrimonyTotal} A$`;
  if (genTrust) genTrust.textContent = state.member_dashboard.trustScore;
  if (genLevel) genLevel.textContent = currentLevel === "Prata" ? "🥈 Prata" : "🥉 Bronze";
  if (genMomentum) genMomentum.textContent = `${state.member_dashboard.momentumStreak || 1}d`;
  if (mod4Val) mod4Val.textContent = `${state.member_dashboard.patrimonyTotal} A$`;
  if (mod7CommitCount) mod7CommitCount.textContent = state.commitments.length;
  if (mod7StreakCurr) mod7StreakCurr.textContent = `${state.member_dashboard.momentumStreak || 1} dia(s)`;
  if (mod7Name) mod7Name.textContent = state.member.name;
  if (mod7Tier) mod7Tier.textContent = currentLevel === "Prata" ? "🥈 Nível Prata" : "🥉 Nível Bronze";
  if (dashUserContext) dashUserContext.textContent = `Pessoa Física (Nível ${currentLevel})`;

  const listContainer = document.getElementById("commitments-list-container");
  const mod3ListContainer = document.getElementById("mod3-commitments-container");
  if (listContainer) listContainer.innerHTML = "";
  if (mod3ListContainer) mod3ListContainer.innerHTML = "";

  if (state.commitments.length === 0) {
    const emptyHtml = `
      <div class="no-commitments">
        <span>📋</span>
        <p>Você não tem compromissos ativos.<br>Crie um novo para começar.</p>
      </div>
    `;
    if (listContainer) listContainer.innerHTML = emptyHtml;
    if (mod3ListContainer) mod3ListContainer.innerHTML = emptyHtml;
    return;
  }

  state.commitments.forEach(c => {
    const item = document.createElement("div");
    item.className = "commitment-item";
    item.style.cursor = "default";

    let statusClass = "active";
    let statusLabel = "Ativo";
    if (c.status === "reviewing") {
      statusClass = "reviewing";
      statusLabel = "Em Revisão";
    } else if (c.status === "completed" || c.status === "validated") {
      statusClass = "completed";
      statusLabel = "Concluído";
    }

    const weightLabel = c.weight === 3 ? "⚡ Alto (3x)" : c.weight === 1 ? "🔹 Leve (1x)" : "🔸 Médio (2x)";
    const dueDateFormatted = c.dueDate ? new Date(c.dueDate).toLocaleDateString('pt-BR') : 'Sem prazo';

    item.innerHTML = `
      <div class="commitment-info" style="cursor:pointer;" onclick="openSubmitEvidence('${c.id}')">
        <span class="commitment-title">${c.title}</span>
        <span class="commitment-status ${statusClass}">${statusLabel}</span>
      </div>
      <div class="progress-bar-container" style="margin: 0.3rem 0;">
        <div class="progress-bar-fill" style="width: ${c.progress}%"></div>
      </div>
      <div class="commitment-meta" style="font-size:0.72rem; color:#9ca3af; display:flex; justify-content:space-between; margin-bottom:0.4rem;">
        <span>🎯 Peso: <strong style="color:#a78bfa;">${weightLabel}</strong></span>
        <span>📅 Prazo: <strong style="color:#f59e0b;">${dueDateFormatted}</strong></span>
      </div>
      ${c.status === "active" ? `
        <div style="background:rgba(0,0,0,0.25); padding:0.35rem 0.5rem; border-radius:6px; margin-top:0.3rem;">
          <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.7rem; color:#d1d5db; margin-bottom:2px;">
            <span>Ajustar Progresso: <strong>${c.progress}%</strong></span>
            <button class="btn-primary" style="padding:0.15rem 0.4rem; font-size:0.65rem;" onclick="openSubmitEvidence('${c.id}')">
              ${c.progress >= 100 ? '🎖️ Enviar Evidência' : '📷 Enviar Evidência'}
            </button>
          </div>
          <input type="range" min="0" max="100" value="${c.progress}" step="5" style="width:100%; accent-color:#8b5cf6; cursor:pointer;" onchange="updateCommitmentProgress('${c.id}', this.value)">
        </div>
      ` : ''}
    `;
    if (listContainer) listContainer.appendChild(item.cloneNode(true));
    if (mod3ListContainer) mod3ListContainer.appendChild(item.cloneNode(true));
  });

  updateJsonViewer();
}

// Update Commitment Progress (0% - 100%)
function updateCommitmentProgress(commitmentId, newProgress) {
  const commit = state.commitments.find(c => c.id === commitmentId);
  if (!commit) return;
  
  commit.progress = parseInt(newProgress);
  logSystem(`Progresso do compromisso "${commit.title}" atualizado para ${commit.progress}%`);
  writeLedger("COMMITMENT_PROGRESS_UPDATED", "commitment", commitmentId, `Novo Progresso: ${commit.progress}%`);
  updateDashboardUI();
}

// Create New Journey UI Prompt
function createNewJourneyUI() {
  const title = prompt("Digite o título da nova Jornada de Impacto:");
  if (!title || !title.trim()) return;

  const journeyId = "journey_" + Math.random().toString(36).substr(2, 7);
  if (!state.journeysList) state.journeysList = [];
  state.journeysList.push({ id: journeyId, title: title.trim() });

  writeLedger("JOURNEY_CREATED", "journey", journeyId, `Nova Jornada: ${title}`);
  logSystem(`Nova Jornada criada com sucesso: "${title}"`);

  // Update dropdown in #screen-create
  const selectElem = document.getElementById("commit-journey-select");
  if (selectElem) {
    const opt = document.createElement("option");
    opt.value = journeyId;
    opt.textContent = title.trim();
    opt.selected = true;
    selectElem.appendChild(opt);
  }
}

// Write to Ledger Helper
function writeLedger(action, entity, entityId, details = "") {
  const event = {
    id: "event_" + Math.random().toString(36).substr(2, 9),
    actorId: state.member.id,
    entity: entity,
    entityId: entityId,
    action: action,
    timestamp: new Date().toISOString()
  };
  state.ledger.push(event);
  logEvent(action, entity, entityId, details);
  updateJsonViewer();
}

// Create New Commitment
async function createCommitment() {
  const title = document.getElementById("commit-title").value;
  const dueDate = document.getElementById("commit-duedate") ? document.getElementById("commit-duedate").value : "";
  const weightVal = document.getElementById("commit-weight") ? parseInt(document.getElementById("commit-weight").value) : 2;
  const journeySelect = document.getElementById("commit-journey-select");
  const journeyId = journeySelect ? journeySelect.value : "journey_baseline_v1";
  
  if (!title) {
    alert("Por favor, digite o título do compromisso.");
    return;
  }
  
  logSystem(`Creating commitment: "${title}" (Peso: ${weightVal}x, Prazo: ${dueDate || 'Sem prazo'})`);
  
  if (emulatorMode) {
    try {
      logSystem("Triggering Callable Cloud Function: createCommitment...");
      const response = await fetch("http://localhost:5001/cumpreai-mvp/us-central1/createCommitment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: {
            journeyId: journeyId,
            title: title,
            dueDate: dueDate,
            weight: weightVal
          }
        })
      });
      const resData = await response.json();
      
      if (resData.result && resData.result.success) {
        const backendData = resData.result.data;
        state.commitments.push({
          id: backendData.id,
          journeyId: backendData.journeyId,
          memberId: backendData.memberId,
          title: backendData.title,
          progress: backendData.progress || 0,
          status: backendData.status || "active",
          dueDate: dueDate,
          weight: weightVal,
          createdAt: backendData.createdAt
        });
        writeLedger("COMMITMENT_CREATED", "commitment", backendData.id, `Via Emulator: ${title}`);
        logSystem(`Success: Commitment created in Emulator DB! ID: ${backendData.id}`);
      } else {
        logSystem(`Emulator call failed: ${JSON.stringify(resData.error)}`);
        alert("Falha ao chamar o emulador local. Verifique os logs.");
      }
    } catch (err) {
      logSystem(`Emulator connection error: ${err.message}`);
      alert("Erro de conexão ao Emulador Local. Certifique-se de que ele está rodando em http://localhost:5001");
    }
  } else {
    // Local Simulation
    const newCommit = {
      id: "commit_" + Math.random().toString(36).substr(2, 9),
      journeyId: journeyId,
      memberId: state.member.id,
      title: title,
      dueDate: dueDate,
      weight: weightVal,
      progress: 0,
      status: "active",
      createdAt: new Date().toISOString()
    };
    
    state.commitments.push(newCommit);
    writeLedger("COMMITMENT_CREATED", "commitment", newCommit.id, `${title} | Peso: ${weightVal}x`);
  }
  
  // Reset form and return
  document.getElementById("commit-title").value = "";
  showScreen(screenHome);
  updateDashboardUI();
}

// Open Submit Evidence Screen
function openSubmitEvidence(commitmentId) {
  const commit = state.commitments.find(c => c.id === commitmentId);
  if (!commit) return;
  
  if (commit.status === "completed" || commit.status === "validated") {
    logSystem(`Commitment ${commitmentId} is already completed.`);
    return;
  }
  
  currentActiveCommitmentId = commitmentId;
  document.getElementById("evidence-commit-title").textContent = commit.title;
  
  // Set default active evidence type
  selectEvidenceType('link');
  document.getElementById("evidence-url").value = "";
  
  showScreen(screenSubmit);
}

// Toggle Evidence Type
let activeEvidenceType = 'link';
function selectEvidenceType(type) {
  activeEvidenceType = type;
  document.querySelectorAll(".evidence-type-btn").forEach(btn => {
    btn.classList.remove("active");
  });
  document.getElementById(`ev-type-${type}`).classList.add("active");
  
  const placeholders = {
    photo: "Ex: https://storage.googleapis.com/evidences/photo.jpg",
    video: "Ex: https://storage.googleapis.com/evidences/video.mp4",
    document: "Ex: https://storage.googleapis.com/evidences/relatorio.pdf",
    link: "Ex: https://github.com/my-project-baseline"
  };
  document.getElementById("evidence-url").placeholder = placeholders[type];
}

// Submit Evidence logic
async function submitEvidence() {
  const url = document.getElementById("evidence-url").value;
  if (!url) {
    alert("Por favor, forneça a URL ou link da evidência.");
    return;
  }
  
  logSystem(`Submitting evidence for commitment ${currentActiveCommitmentId}: ${url} (${activeEvidenceType})`);
  
  if (emulatorMode) {
    try {
      // 1. Submit Evidence function
      logSystem("Triggering Callable Cloud Function: submitEvidence...");
      const evResponse = await fetch("http://localhost:5001/cumpreai-mvp/us-central1/submitEvidence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: {
            commitmentId: currentActiveCommitmentId,
            type: activeEvidenceType,
            url: url
          }
        })
      });
      const evResData = await evResponse.json();
      
      if (evResData.result && evResData.result.success) {
        const evBackend = evResData.result.data;
        state.evidences.push({
          id: evBackend.id,
          ownerId: evBackend.ownerId,
          commitmentId: evBackend.commitmentId,
          type: evBackend.type,
          url: evBackend.url,
          status: evBackend.status,
          createdAt: evBackend.createdAt
        });
        writeLedger("EVIDENCE_SUBMITTED", "evidence", evBackend.id, `URL: ${url}`);
        logSystem(`Success: Evidence written to Emulator DB! ID: ${evBackend.id}`);
        
        // 2. Update Commitment function to 100% completion
        logSystem("Triggering Callable Cloud Function: updateCommitment (100% progress)...");
        const compResponse = await fetch("http://localhost:5001/cumpreai-mvp/us-central1/updateCommitment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            data: {
              commitmentId: currentActiveCommitmentId,
              progress: 100
            }
          })
        });
        const compResData = await compResponse.json();
        
        if (compResData.result && compResData.result.success) {
          const commitBackend = compResData.result.data;
          
          // Update local state
          const localCommit = state.commitments.find(c => c.id === currentActiveCommitmentId);
          if (localCommit) {
            localCommit.progress = 100;
            localCommit.status = "completed";
            localCommit.completedAt = commitBackend.completedAt;
          }
          
          writeLedger("COMMITMENT_UPDATED", "commitment", currentActiveCommitmentId, "Progress: 100% [Completed]");
          logSystem(`Success: Commitment set to 100% in Emulator!`);
          
          // Trigger Recognition UI
          triggerRecognition();
        } else {
          logSystem(`Update commitment failed in emulator: ${JSON.stringify(compResData.error)}`);
        }
      } else {
        logSystem(`Submit evidence failed in emulator: ${JSON.stringify(evResData.error)}`);
      }
    } catch (err) {
      logSystem(`Emulator connection error: ${err.message}`);
      alert("Erro ao conectar no Emulador Local.");
    }
  } else {
    // Local Simulation with Gemini AI Oracle Audit
    const commit = state.commitments.find(c => c.id === currentActiveCommitmentId);
    const title = commit ? commit.title : "Compromisso Baseline";
    
    // Gemini AI Oracle Score Heuristic Calculation
    let score = 95;
    let notes = `Oráculo Gemini API: Evidência de tipo [${activeEvidenceType.toUpperCase()}] auditada com sucesso. Link verificado. Compatibilidade semântica com "${title}": 95%.`;
    if (!url.toLowerCase().includes("http") && !url.toLowerCase().includes("github")) {
      score = 65;
      notes = `Oráculo Gemini API: Evidência requer auditoria complementar. Compatibilidade: 65%.`;
    }

    const aiValidated = score >= 70;

    const newEvidence = {
      id: "ev_" + Math.random().toString(36).substr(2, 9),
      ownerId: state.member.id,
      commitmentId: currentActiveCommitmentId,
      type: activeEvidenceType,
      url: url,
      status: aiValidated ? "validated" : "reviewing",
      aiValidated: aiValidated,
      aiConfidenceScore: score,
      aiAnalysisNotes: notes,
      createdAt: new Date().toISOString()
    };
    
    state.evidences.push(newEvidence);
    writeLedger("EVIDENCE_SUBMITTED", "evidence", newEvidence.id, `Type: ${activeEvidenceType} | Gemini Score: ${score}%`);
    logSystem(`GEMINI ORACLE: Evidence audited. Score: ${score}% | Validated: ${aiValidated}`);

    if (commit) {
      commit.progress = 100;
      commit.status = aiValidated ? "completed" : "reviewing";
      commit.completedAt = new Date().toISOString();
      writeLedger("COMMITMENT_UPDATED", "commitment", commit.id, `Progress: 100% [${commit.status}]`);
    }
    
    triggerRecognition(score, notes);
  }
}

// Trigger Recognition Screen with Gemini AI & Org Service Fee Deduction
function triggerRecognition(aiScore = 95, aiNotes = "Oráculo Gemini API: Evidência aprovada.") {
  showScreen(screenRecognition);
  
  const commit = state.commitments.find(c => c.id === currentActiveCommitmentId);
  const weight = (commit && commit.weight) ? commit.weight : 2;
  
  const grossA$ = 250 * weight;
  const trustGain = 5 * weight;
  const impactGain = 10 * weight;
  
  const feePercentage = state.orgServiceFeePercentage || 10;
  const feeAmount = Math.round((grossA$ * feePercentage) / 100);
  const netA$ = Math.max(0, grossA$ - feeAmount);

  // Award Simulation
  state.member_dashboard.trustScore += trustGain;
  state.member_dashboard.patrimonyTotal += netA$;
  state.member_dashboard.impactScore += impactGain;
  state.member_dashboard.updatedAt = new Date().toISOString();
  
  // Update UI Elements (Main and Presentation mode)
  const scoreElem = document.getElementById("rec-ai-score");
  const scoreElemP = document.getElementById("rec-ai-score-p");
  if (scoreElem) scoreElem.textContent = `${aiScore}% Confiança`;
  if (scoreElemP) scoreElemP.textContent = `${aiScore}% Confiança`;

  const notesElem = document.getElementById("rec-ai-notes");
  const notesElemP = document.getElementById("rec-ai-notes-p");
  if (notesElem) notesElem.textContent = aiNotes;
  if (notesElemP) notesElemP.textContent = aiNotes;

  const feeElem = document.getElementById("rec-fee-info");
  const feeElemP = document.getElementById("rec-fee-info-p");
  const feeMsg = `Taxa da Org (${feePercentage}%): -${feeAmount} A$ retidos pelo Administrador.`;
  if (feeElem) feeElem.textContent = feeMsg;
  if (feeElemP) feeElemP.textContent = feeMsg;

  const netElem = document.getElementById("rec-net-val");
  const netElemP = document.getElementById("rec-net-val-p");
  if (netElem) netElem.textContent = `+${netA$}`;
  if (netElemP) netElemP.textContent = `+${netA$}`;

  writeLedger("RECOGNITION_ISSUED", "member", state.member.id, `Gross: ${grossA$} A$, Fee (${feePercentage}%): -${feeAmount} A$, Net: +${netA$} A$`);
  logSystem(`RECOGNITION: Reward processed. Net: +${netA$} A$ (Org Fee -${feeAmount} A$)`);
}

// Track Super Admin (Adm do App) mode state for testing
state.isPlatformSuperAdmin = false;

function toggleSuperAdminModeUI() {
  state.isPlatformSuperAdmin = !state.isPlatformSuperAdmin;
  
  const btn = document.getElementById("btn-toggle-admin");
  const btnP = document.getElementById("btn-toggle-admin-p");
  const badge = document.getElementById("super-admin-badge");
  const badgeP = document.getElementById("super-admin-badge-p");

  if (state.isPlatformSuperAdmin) {
    if (btn) btn.textContent = "Modo: Adm do App (Editável)";
    if (btnP) btnP.textContent = "Modo: Adm do App (Editável)";
    if (badge) { badge.textContent = "🔓 Adm do App (Editável)"; badge.style.background = "#10b981"; }
    if (badgeP) { badgeP.textContent = "🔓 Adm do App (Editável)"; badgeP.style.background = "#10b981"; }
    logSystem("ROLE_SWITCH: Switched to Platform Super Admin (Adm do App) - Service Fee edits UNLOCKED");
    alert("Modo Administrador da Plataforma (Adm do App) ATIVADO!\n\nAgora você pode alterar a taxa de serviço de qualquer organização.");
  } else {
    if (btn) btn.textContent = "Modo: Adm da Org (Bloqueado)";
    if (btnP) btnP.textContent = "Modo: Adm da Org (Bloqueado)";
    if (badge) { badge.textContent = "🔒 Adm do App"; badge.style.background = "#ef4444"; }
    if (badgeP) { badgeP.textContent = "🔒 Adm do App"; badgeP.style.background = "#ef4444"; }
    logSystem("ROLE_SWITCH: Switched to Organization Admin - Service Fee edits LOCKED");
    alert("Modo Administrador de Organização ATIVADO!\n\nPor regras de segurança da plataforma, Administradores da Organização NÃO PODEM alterar a taxa de serviço.");
  }
}

// Save Org Service Fee UI (Strictly Restricted to Platform Super Admin)
function saveOrgFeeUI() {
  if (!state.isPlatformSuperAdmin) {
    alert("🔒 PERMISSÃO NEGADA!\n\nApenas o Administrador da Plataforma (Adm do App / Super Admin) tem autorização para alterar a taxa de serviço de clientes e organizações.\n\nAlterne para o modo 'Adm do App (Editável)' para testar a alteração.");
    writeLedger("SECURITY_VIOLATION_BLOCKED", "organization", "org_camelot_dao", "Attempted fee modification by non-SuperAdmin blocked");
    logSystem("SECURITY: Org Admin fee update attempt blocked (Requires Platform Super Admin)");
    return;
  }

  const input = document.getElementById("org-fee-input") || document.getElementById("org-fee-input-p");
  if (input) {
    const val = parseInt(input.value, 10);
    if (!isNaN(val) && val >= 0 && val <= 50) {
      state.orgServiceFeePercentage = val;
      writeLedger("ORG_FEE_UPDATED", "organization", "org_camelot_dao", `New Fee set by Super Admin: ${val}%`);
      logSystem(`ORGANIZATION: Service Fee updated to ${val}% by Platform Super Admin`);
      alert(`Taxa de Serviço da Plataforma atualizada com sucesso pelo Adm do App para: ${val}%!`);
      return;
    }
  }
  alert("Por favor, digite uma taxa válida entre 0% e 50%.");
}

// Generate Org Invite Token UI
function generateInviteTokenUI() {
  const token = "tok_" + Math.random().toString(36).substr(2, 10);
  state.activeInviteToken = token;
  writeLedger("INVITATION_CREATED", "organization", "org_camelot_dao", `Token: ${token}`);
  logSystem(`ORGANIZATION: Invite token generated: ${token}`);
  alert(`Token de Convite Gerado com Sucesso!\n\nToken: ${token}\n\nCole este token na tela de Login para testar o registro de membro de Organização!`);
}

// Deposit Fiat (R$) via PIX into Org Treasury UI
function depositPixUI() {
  const input = document.getElementById("pix-deposit-amount") || document.getElementById("pix-deposit-amount-p");
  if (!input) return;
  const brl = parseFloat(input.value);
  if (isNaN(brl) || brl <= 0) {
    alert("Por favor, informe um valor de recarga válido.");
    return;
  }

  const txId = "pix_tx_" + Math.random().toString(36).substr(2, 8);
  writeLedger("PIX_DEPOSIT_COMPLETED", "treasury", "org_camelot_dao", `Amount: R$ ${brl},00 -> Minted ${brl} A$ | Tx: ${txId}`);
  logSystem(`TREASURY: FIAT PIX Deposit confirmed: R$ ${brl},00 -> Minted ${brl} A$ into Org Treasury`);
  alert(`💳 Depósito PIX Confirmado com Sucesso!\n\nValor Recebido: R$ ${brl},00\nA$ Mintados na Tesouraria: +${brl} A$\nID da Transação: ${txId}`);
}

// Withdraw A$ to Member PIX Key UI
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
  writeLedger("PIX_PAYOUT_COMPLETED", "member", state.member.id, `Withdrawn: ${amountA$} A$ -> Transfered R$ ${amountA$},00 via PIX to ${pixKey} | Tx: ${txId}`);
  logSystem(`OFF-RAMP PIX: Member withdrew ${amountA$} A$ -> Transfered R$ ${amountA$},00 to PIX Key: ${pixKey}`);
  
  updateDashboardUI();
  alert(`💸 Saque PIX Concluído com Sucesso!\n\nValor Transferido para sua conta bancária: R$ ${amountA$},00\nChave PIX: ${pixKey}\nSaldo Restante na Carteira: ${state.member_dashboard.patrimonyTotal} A$`);
}

// Go Back to Home from Recognition
function closeRecognition() {
  showScreen(screenHome);
  updateDashboardUI();
}

// Tab navigation handler
function navigateToTab(tabName) {
  document.querySelectorAll(".nav-item").forEach(item => {
    item.classList.remove("active");
  });
  
  if (tabName === "home") {
    if (document.getElementById("nav-home")) document.getElementById("nav-home").classList.add("active");
    showScreen(screenHome);
    updateDashboardUI();
  } else if (tabName === "explore") {
    if (document.getElementById("nav-explore")) document.getElementById("nav-explore").classList.add("active");
    showScreen(screenExplore);
    logSystem("Navigation: transitioned to Explore Opportunities screen");
  } else if (tabName === "comms") {
    if (document.getElementById("nav-comms")) document.getElementById("nav-comms").classList.add("active");
    showScreen(screenComms);
    logSystem("Navigation: transitioned to Central de Comunicação (Build 008)");
  } else if (tabName === "orgs") {
    if (document.getElementById("nav-orgs")) document.getElementById("nav-orgs").classList.add("active");
    showScreen(screenOrgs);
    logSystem("Navigation: transitioned to Organizações Lite (Build 009)");
  } else if (tabName === "market") {
    if (document.getElementById("nav-market")) document.getElementById("nav-market").classList.add("active");
    showScreen(screenMarketplace);
    const balEl = document.getElementById("market-patrimony-balance");
    if (balEl) balEl.textContent = `${state.member_dashboard.patrimonyTotal} A$`;
    logSystem("Navigation: transitioned to Marketplace MVP (Build 011)");
  }
}

// Build 008: Send Comms Message
function sendCommsMessage() {
  const inputEl = document.getElementById("comms-input-text");
  const text = inputEl ? inputEl.value.trim() : "";
  if (!text) return;
  
  const container = document.getElementById("comms-chat-messages");
  const bubble = document.createElement("div");
  bubble.className = "chat-bubble sent";
  
  const senderDiv = document.createElement("div");
  senderDiv.className = "chat-sender";
  senderDiv.textContent = state.member.name;
  
  const textDiv = document.createElement("div");
  textDiv.className = "chat-text";
  textDiv.textContent = text;
  
  const timeDiv = document.createElement("div");
  timeDiv.className = "chat-time";
  timeDiv.textContent = new Date().toLocaleTimeString();
  
  bubble.appendChild(senderDiv);
  bubble.appendChild(textDiv);
  bubble.appendChild(timeDiv);
  
  if (container) {
    container.appendChild(bubble);
    container.scrollTop = container.scrollHeight;
  }
  
  state.comms.push({
    id: "msg_" + Math.random().toString(36).substr(2, 7),
    sender: state.member.name,
    text: text,
    timestamp: new Date().toISOString()
  });
  
  writeLedger("COMMUNICATION_SENT", "comms", state.member.id, `Message: "${text}"`);
  inputEl.value = "";
}

// Build 009: Switch Organization Context
function switchOrgContext(orgName) {
  writeLedger("ORG_CONTEXT_SWITCHED", "organization", orgName, `Member switched context to ${orgName}`);
  logSystem(`ORGANIZATION: Active context updated to ${orgName}`);
  alert(`Contexto de Organização alterado para: ${orgName}`);
}

// Build 010: Join Community
function joinCommunity(commName) {
  writeLedger("COMMUNITY_JOINED", "community", commName, `Member joined community ${commName}`);
  logSystem(`COMMUNITIES: Inscrição confirmada na comunidade ${commName}`);
  alert(`Inscrição confirmada na comunidade: ${commName}`);
}

// Build 011: Buy / Redeem Marketplace Item
function buyMarketItem(itemName, price) {
  if (state.member_dashboard.patrimonyTotal < price) {
    alert(`Saldo de Patrimônio insuficiente! Você precisa de ${price} A$.`);
    return;
  }
  
  state.member_dashboard.patrimonyTotal -= price;
  state.member_dashboard.updatedAt = new Date().toISOString();
  
  const balEl = document.getElementById("market-patrimony-balance");
  if (balEl) balEl.textContent = `${state.member_dashboard.patrimonyTotal} A$`;
  
  updateDashboardUI();
  writeLedger("MARKETPLACE_REDEEMED", "marketplace", itemName, `Item: ${itemName} | Spent: ${price} A$`);
  logSystem(`MARKETPLACE: Item "${itemName}" resgatado com sucesso por ${price} A$!`);
  alert(`Item "${itemName}" resgatado com sucesso! Saldo restante: ${state.member_dashboard.patrimonyTotal} A$.`);
}

// Emulator Toggle Listener
if (emulatorToggle) {
  emulatorToggle.addEventListener("change", (e) => {
    emulatorMode = e.target.checked;
    if (emulatorMode) {
      logSystem("MODE CHANGED: Live Integration (Connect to Local Emulator on localhost:5001)");
      const modeSpan = document.querySelector(".mode-selector span");
      if (modeSpan) modeSpan.style.color = "#10b981";
    } else {
      logSystem("MODE CHANGED: Local Simulation (In-Browser Virtual Database)");
      const modeSpan = document.querySelector(".mode-selector span");
      if (modeSpan) modeSpan.style.color = "var(--text-secondary)";
    }
  });
}

// Presentation Mode Toggle
let presentationMode = false;
function togglePresentationMode() {
  presentationMode = !presentationMode;
  const exitBtn = document.getElementById("btn-exit-presentation");
  
  if (presentationMode) {
    document.body.classList.add("presentation-mode");
    if (exitBtn) exitBtn.style.display = "block";
    logSystem("MODE CHANGED: Client Presentation Mode active (Clean Mobile View)");
  } else {
    document.body.classList.remove("presentation-mode");
    if (exitBtn) exitBtn.style.display = "none";
    logSystem("MODE CHANGED: Developer View active");
  }
}

// Setup on load
window.onload = () => {
  logSystem("Virtual Sandbox Environment Initialized.");
  logSystem("Directing user to Login & Registration Screen.");
  
  // Transition directly to Login screen (#screen-login)
  setTimeout(() => {
    showScreen(screenLogin);
  }, 500);
  
  updateJsonViewer();
};

// --- MASTER USER PERFORMANCE & CLEAN VIEW HANDLERS (WA0019 & WA0020) ---
let selectedActivityType = 'Corrida';

function switchMasterPerformanceMode(mode) {
  const darkView = document.getElementById("perf-view-dark");
  const cleanView = document.getElementById("perf-view-clean");
  const btnDark = document.getElementById("btn-perf-mode-dark");
  const btnClean = document.getElementById("btn-perf-mode-clean");

  if (mode === "performance") {
    if (darkView) darkView.style.display = "block";
    if (cleanView) cleanView.style.display = "none";
    if (btnDark) btnDark.classList.add("active");
    if (btnClean) btnClean.classList.remove("active");
    logSystem("Modo Performance ativado (WA0020).");
  } else {
    if (darkView) darkView.style.display = "none";
    if (cleanView) cleanView.style.display = "block";
    if (btnClean) btnClean.classList.add("active");
    if (btnDark) btnDark.classList.remove("active");
    logSystem("Visão Clean ativada (WA0019).");
  }
}

function openRegisterActivityModal() {
  const modal = document.getElementById("modal-register-activity");
  if (modal) modal.classList.add("active");
}

function closeRegisterActivityModal() {
  const modal = document.getElementById("modal-register-activity");
  if (modal) modal.classList.remove("active");
}

function selectActivityType(type) {
  selectedActivityType = type;
  const buttons = document.querySelectorAll(".act-type-btn");
  buttons.forEach(btn => {
    btn.classList.remove("active");
    btn.style.borderColor = "";
    btn.style.color = "";
  });

  let targetId = "act-btn-run";
  if (type === "Caminhada") targetId = "act-btn-walk";
  if (type === "Bicicleta") targetId = "act-btn-bike";
  if (type === "Treino") targetId = "act-btn-workout";

  const targetBtn = document.getElementById(targetId);
  if (targetBtn) {
    targetBtn.classList.add("active");
    targetBtn.style.borderColor = "#10b981";
    targetBtn.style.color = "#10b981";
  }
}

function submitRegisterActivity() {
  const distInput = document.getElementById("act-dist-input");
  const durationInput = document.getElementById("act-duration-input");

  const distVal = parseFloat(distInput ? distInput.value : "1.8") || 1.8;
  const durationVal = parseInt(durationInput ? durationInput.value : "15") || 15;

  // Rewards: +250 CumpreCapital, +5 TrustScore
  const capitalEarned = 250;
  const trustScoreEarned = 5;

  if (typeof state !== 'undefined' && state && state.member_dashboard) {
    state.member_dashboard.patrimonyTotal = (state.member_dashboard.patrimonyTotal || 12600) + capitalEarned;
    state.member_dashboard.trustScore = Math.min(100, (state.member_dashboard.trustScore || 92) + trustScoreEarned);
  }

  // Update Active Challenge Progress (3.2 + distVal -> max 5km)
  const currentKm = 3.2 + distVal;
  const targetKm = 5.0;
  const finalKm = Math.min(targetKm, currentKm);
  const pct = Math.min(100, Math.round((finalKm / targetKm) * 100));

  const kmElem = document.getElementById("perf-chal-km");
  const pctElem = document.getElementById("perf-chal-pct");
  const barElem = document.getElementById("perf-chal-bar");
  const rankKmElem = document.getElementById("rank-user-km");

  if (kmElem) kmElem.textContent = `${finalKm.toFixed(1).replace('.', ',')} km / 5 km`;
  if (pctElem) pctElem.textContent = `${pct}% Concluído`;
  if (barElem) barElem.style.width = `${pct}%`;
  if (rankKmElem) rankKmElem.textContent = `${finalKm.toFixed(1).replace('.', ',')} km`;

  // Write to ledger
  if (typeof logLedgerEvent === 'function') {
    logLedgerEvent(`Atividade ${selectedActivityType} (${distVal} km em ${durationVal} min) registrada. +250 A$ | +5 TrustScore`);
  }

  if (typeof updateMemberDashboardUI === 'function') updateMemberDashboardUI();
  if (typeof renderLedger === 'function') renderLedger();
  if (typeof updateJsonViewer === 'function') updateJsonViewer();

  alert(`✅ Atividade de ${selectedActivityType} (${distVal} km) registrada com sucesso!\n\n💎 +${capitalEarned} CumpreCapital® adicionados ao seu patrimônio.\n🛡️ +${trustScoreEarned} TrustScore® conquistados.`);
  closeRegisterActivityModal();
}

function togglePersonalizationSetting(settingKey) {
  if (typeof logSystem === 'function') {
    logSystem(`Configuração de personalização atualizada: ${settingKey}`);
  }
}

