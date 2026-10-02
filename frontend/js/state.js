/**
 * CumpreAi OS v2 - Central State & Ledger Manager
 */

var state = window.state || {
  member: {
    id: "user_guest_00",
    name: "Visitante",
    email: "",
    photoUrl: "",
    userLevel: "Guest",
    memberType: "guest"
  },
  member_dashboard: {
    trustScore: 15,
    patrimonyTotal: 100,
    impactScore: 10,
    momentumStreak: 1,
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
      title: "Validar protótipo com 3 membros",
      progress: 50,
      status: "active",
      createdAt: new Date().toISOString()
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
  ],
  superUsers: [
    "alan.pereira@lp-nexus.com",
    "alan@lp-nexus.com",
    "alan@alp-nexus.com",
    "welingtonsoares@hotmail.com",
    "welington.soares@lp-nexus.com"
  ],
  orgServiceFeePercentage: 10,
  activeInviteToken: null,
  isPlatformSuperAdmin: false
};

window.state = state;

function logSystem(msg) {
  console.log(`[CumpreAi OS] ${msg}`);
}
window.logSystem = logSystem;

function writeLedger(action, entity, entityId, details = '') {
  const event = {
    id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    actorId: (state.member && state.member.id) ? state.member.id : 'guest',
    entity: entity,
    entityId: entityId,
    action: action,
    details: details,
    timestamp: new Date().toISOString()
  };

  state.ledger.push(event);
  if (typeof renderMasterLedgerFeed === 'function') {
    renderMasterLedgerFeed();
  }
}
window.writeLedger = writeLedger;
