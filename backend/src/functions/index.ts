import * as functions from 'firebase-functions';
import { CommitmentService } from '../services/CommitmentService';
import { EvidenceService } from '../services/EvidenceService';
import { DashboardService } from '../services/DashboardService';
import { LedgerService } from '../services/LedgerService';
import { OrganizationService } from '../services/OrganizationService';
import { RecognitionService } from '../services/RecognitionService';
import { db, now } from '../utils/firebase';

const commitments = new CommitmentService();
const evidences = new EvidenceService();
const dashboards = new DashboardService();
const ledger = new LedgerService();
const orgs = new OrganizationService();
const recognition = new RecognitionService(dashboards, orgs);

// 1. Create Member (Independent or via Organization Invite Token)
export const createMember = functions.https.onCall(async (data, context) => {
  const uid = context.auth?.uid || data.uid || 'user_' + Math.random().toString(36).substr(2, 7);
  let memberType: 'individual' | 'organization' = 'individual';
  let orgId = data.orgId;

  if (data.inviteToken) {
    const invite = await orgs.getInvitationByToken(data.inviteToken);
    if (invite && invite.status === 'pending') {
      memberType = 'organization';
      orgId = invite.orgId;
      invite.status = 'accepted';
    }
  }

  const memberData = {
    id: uid,
    name: data.name || 'Novo Membro',
    email: data.email || `${uid}@cumpre.ai`,
    memberType,
    orgId: orgId || null,
    status: 'active',
    createdAt: now(),
    updatedAt: now()
  };

  await db.collection('members').doc(uid).set(memberData, { merge: true });
  await dashboards.updateMemberDashboard(uid);
  await ledger.write({ actorId: uid, entity: 'member', entityId: uid, action: 'MEMBER_CREATED', metadata: { memberType, orgId } });

  return { success: true, data: memberData, errors: [], timestamp: new Date().toISOString() };
});

// 2. Create Journey
export const createJourney = functions.https.onCall(async (data, context) => {
  const uid = context.auth?.uid || data.memberId || 'simulated_user';
  const journeyId = 'journey_' + Math.random().toString(36).substr(2, 7);
  const journeyData = {
    id: journeyId,
    memberId: uid,
    title: data.title || 'Jornada Baseline',
    orgId: data.orgId || null,
    status: 'active',
    createdAt: now()
  };

  await db.collection('journeys').doc(journeyId).set(journeyData);
  await ledger.write({ actorId: uid, entity: 'journey', entityId: journeyId, action: 'JOURNEY_CREATED' });

  return { success: true, data: journeyData, errors: [], timestamp: new Date().toISOString() };
});

// 3. Create Commitment
export const createCommitment = functions.https.onCall(async (data, context) => {
  const uid = context.auth?.uid || data.memberId || 'simulated_user';
  const result = await commitments.createCommitment({ journeyId: data.journeyId, memberId: uid, title: data.title, dueDate: data.dueDate });
  await ledger.write({ actorId: uid, entity: 'commitment', entityId: result.id, action: 'COMMITMENT_CREATED' });
  await dashboards.updateMemberDashboard(uid);
  return { success: true, data: result, errors: [], timestamp: new Date().toISOString() };
});

// 4. Update Commitment Progress
export const updateCommitment = functions.https.onCall(async (data, context) => {
  const uid = context.auth?.uid || data.memberId || 'simulated_user';
  const result = await commitments.updateCommitment({ commitmentId: data.commitmentId, memberId: uid, progress: data.progress });
  await ledger.write({ actorId: uid, entity: 'commitment', entityId: data.commitmentId, action: 'COMMITMENT_UPDATED', metadata: { progress: data.progress } });
  await dashboards.updateMemberDashboard(uid);
  return { success: true, data: result, errors: [], timestamp: new Date().toISOString() };
});

// 5. Submit Evidence
export const submitEvidence = functions.https.onCall(async (data, context) => {
  const uid = context.auth?.uid || data.ownerId || 'simulated_user';
  const result = await evidences.submitEvidence({
    ownerId: uid,
    commitmentId: data.commitmentId,
    type: data.type,
    url: data.url,
    commitmentTitle: data.commitmentTitle
  });

  await ledger.write({
    actorId: uid,
    entity: 'evidence',
    entityId: result.id,
    action: 'EVIDENCE_SUBMITTED',
    metadata: { aiValidated: result.aiValidated, aiScore: result.aiConfidenceScore }
  });

  return { success: true, data: result, errors: [], timestamp: new Date().toISOString() };
});

// 6. Validate Evidence (Gemini AI Oracle Audit)
export const validateEvidence = functions.https.onCall(async (data, context) => {
  const uid = context.auth?.uid || data.validatorId || 'ai_oracle_gemini';
  const evidenceRef = db.collection('evidences').doc(data.evidenceId);
  const snap = await evidenceRef.get();

  if (!snap.exists) throw new functions.https.HttpsError('not-found', 'Evidência não encontrada');

  const evidenceData = snap.data();
  const isValid = data.status === 'validated' || (evidenceData && evidenceData.aiConfidenceScore >= 70);

  await evidenceRef.update({
    status: isValid ? 'validated' : 'rejected',
    validatedAt: now(),
    validatorId: uid
  });

  await ledger.write({
    actorId: uid,
    entity: 'evidence',
    entityId: data.evidenceId,
    action: isValid ? 'EVIDENCE_VALIDATED' : 'EVIDENCE_REJECTED'
  });

  return { success: true, data: { evidenceId: data.evidenceId, status: isValid ? 'validated' : 'rejected' }, errors: [], timestamp: new Date().toISOString() };
});

// 7. Issue Recognition (Calculates Net Rewards & Retains Org Service Fee)
export const issueRecognition = functions.https.onCall(async (data, context) => {
  const uid = context.auth?.uid || data.memberId || 'simulated_user';
  const recResult = await recognition.issueRecognition({
    memberId: uid,
    commitmentId: data.commitmentId,
    orgId: data.orgId,
    baseRewardA$: data.baseRewardA$,
    baseTrust: data.baseTrust,
    baseImpact: data.baseImpact
  });

  await ledger.write({
    actorId: uid,
    entity: 'member',
    entityId: uid,
    action: 'RECOGNITION_ISSUED',
    metadata: { ...recResult }
  });

  return { success: true, data: recResult, errors: [], timestamp: new Date().toISOString() };
});

// 8. Update Dashboard Projection
export const updateDashboard = functions.https.onCall(async (data, context) => {
  const uid = context.auth?.uid || data.memberId || 'simulated_user';
  const dash = await dashboards.updateMemberDashboard(uid, {
    trustScoreDelta: data.trustScoreDelta,
    patrimonyDelta: data.patrimonyDelta,
    impactScoreDelta: data.impactScoreDelta
  });
  return { success: true, data: dash, errors: [], timestamp: new Date().toISOString() };
});

// 9. Generate Opportunity
export const generateOpportunity = functions.https.onCall(async (data, context) => {
  const uid = context.auth?.uid || data.creatorId || 'simulated_user';
  const oppId = 'opp_' + Math.random().toString(36).substr(2, 7);
  const oppData = {
    id: oppId,
    creatorId: uid,
    title: data.title || 'Oportunidade Baseline',
    rewardPatrimony: data.rewardPatrimony || 300,
    status: 'open',
    createdAt: now()
  };

  await db.collection('opportunities').doc(oppId).set(oppData);
  await ledger.write({ actorId: uid, entity: 'opportunity', entityId: oppId, action: 'OPPORTUNITY_GENERATED' });

  return { success: true, data: oppData, errors: [], timestamp: new Date().toISOString() };
});

// 10. Write Ledger Event
export const writeLedgerEvent = functions.https.onCall(async (data, context) => {
  const uid = context.auth?.uid || data.actorId || 'simulated_user';
  const result = await ledger.write({
    actorId: uid,
    entity: data.entity || 'system',
    entityId: data.entityId || 'sys',
    action: data.action || 'CUSTOM_EVENT',
    metadata: data.metadata
  });

  return { success: true, data: result, errors: [], timestamp: new Date().toISOString() };
});

// 11. Switch Context
export const switchContext = functions.https.onCall(async (data, context) => {
  const uid = context.auth?.uid || data.memberId || 'simulated_user';
  const contextName = data.contextName || 'Pessoa Física';

  await db.collection('members').doc(uid).set({ activeContext: contextName, updatedAt: now() }, { merge: true });
  await ledger.write({ actorId: uid, entity: 'member', entityId: uid, action: 'CONTEXT_SWITCHED', metadata: { contextName } });

  return { success: true, data: { memberId: uid, activeContext: contextName }, errors: [], timestamp: new Date().toISOString() };
});

// 12. Send Communication & Organization Invites
export const sendCommunication = functions.https.onCall(async (data, context) => {
  const uid = context.auth?.uid || data.senderId || 'simulated_user';
  let inviteData = null;

  if (data.type === 'org_invitation') {
    inviteData = await orgs.createInvitation({
      orgId: data.orgId,
      invitedBy: uid,
      email: data.email,
      role: data.role
    });
  }

  const commId = 'comm_' + Math.random().toString(36).substr(2, 7);
  const commData = {
    id: commId,
    senderId: uid,
    text: data.text || 'Notificação oficial',
    inviteToken: inviteData ? inviteData.token : null,
    createdAt: now()
  };

  await db.collection('communications').doc(commId).set(commData);
  await ledger.write({ actorId: uid, entity: 'communication', entityId: commId, action: 'COMMUNICATION_SENT', metadata: { type: data.type } });

  return { success: true, data: { comm: commData, invitation: inviteData }, errors: [], timestamp: new Date().toISOString() };
});
