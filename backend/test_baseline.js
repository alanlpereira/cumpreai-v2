const admin = require('firebase-admin');

// Point to the local Firestore emulator
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8085';

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'cumpreai-mvp'
  });
}

const db = admin.firestore();

// Import services
const { CommitmentService } = require('./lib/services/CommitmentService');
const { EvidenceService } = require('./lib/services/EvidenceService');
const { DashboardService } = require('./lib/services/DashboardService');
const { LedgerService } = require('./lib/services/LedgerService');

const commitments = new CommitmentService();
const evidences = new EvidenceService();
const dashboards = new DashboardService();
const ledger = new LedgerService();

async function runTest() {
  console.log("=== CumpreAi Baseline v1.0 Service Test ===");
  const memberId = "test_member_123";
  const journeyId = "test_journey_456";

  // 1. Create a Commitment
  console.log("\n1. Creating commitment...");
  const commitment = await commitments.createCommitment({
    journeyId: journeyId,
    memberId: memberId,
    title: "Verify baseline software compilation"
  });
  console.log("Created Commitment:", commitment);

  // Write Ledger Event
  await ledger.write({
    actorId: memberId,
    entity: 'commitment',
    entityId: commitment.id,
    action: 'COMMITMENT_CREATED'
  });

  // Update Dashboard
  await dashboards.updateMemberDashboard(memberId);

  // 2. Update Progress
  console.log("\n2. Updating commitment progress to 50%...");
  const updatedActive = await commitments.updateCommitment({
    commitmentId: commitment.id,
    memberId: memberId,
    progress: 50
  });
  console.log("Updated Commitment (50%):", updatedActive);

  await ledger.write({
    actorId: memberId,
    entity: 'commitment',
    entityId: commitment.id,
    action: 'COMMITMENT_UPDATED',
    metadata: { progress: 50 }
  });

  // 3. Submit Evidence
  console.log("\n3. Submitting evidence...");
  const evidence = await evidences.submitEvidence({
    ownerId: memberId,
    commitmentId: commitment.id,
    type: 'link',
    url: 'https://github.com/cumpreai/mvp-evidence'
  });
  console.log("Submitted Evidence:", evidence);

  await ledger.write({
    actorId: memberId,
    entity: 'evidence',
    entityId: evidence.id,
    action: 'EVIDENCE_SUBMITTED'
  });

  // 4. Complete Commitment (100%)
  console.log("\n4. Updating commitment progress to 100% (Completion)...");
  const updatedCompleted = await commitments.updateCommitment({
    commitmentId: commitment.id,
    memberId: memberId,
    progress: 100
  });
  console.log("Completed Commitment (100%):", updatedCompleted);

  await ledger.write({
    actorId: memberId,
    entity: 'commitment',
    entityId: commitment.id,
    action: 'COMMITMENT_UPDATED',
    metadata: { progress: 100 }
  });

  await dashboards.updateMemberDashboard(memberId);

  // 5. Query Firestore database to verify data persistence
  console.log("\n=== Verifying persisted data in Firestore Emulator ===");
  
  const commitmentsSnap = await db.collection('commitments').get();
  console.log(`Commitments count: ${commitmentsSnap.size}`);
  commitmentsSnap.forEach(doc => console.log(`- [${doc.id}] ${doc.data().title} | Progress: ${doc.data().progress}% | Status: ${doc.data().status}`));

  const evidencesSnap = await db.collection('evidences').get();
  console.log(`Evidences count: ${evidencesSnap.size}`);
  evidencesSnap.forEach(doc => console.log(`- [${doc.id}] Type: ${doc.data().type} | URL: ${doc.data().url}`));

  const dashboardSnap = await db.collection('member_dashboard').get();
  console.log(`Dashboard count: ${dashboardSnap.size}`);
  dashboardSnap.forEach(doc => console.log(`- [${doc.id}] Member: ${doc.data().memberId} | UpdatedAt: ${doc.data().updatedAt.toDate()}`));

  const ledgerSnap = await db.collection('ledger').get();
  console.log(`Ledger events count: ${ledgerSnap.size}`);
  ledgerSnap.forEach(doc => console.log(`- Action: ${doc.data().action} | Entity: ${doc.data().entity} | Actor: ${doc.data().actorId}`));

  console.log("\nTest completed successfully!");
}

runTest().catch(err => {
  console.error("Test failed:", err);
});
