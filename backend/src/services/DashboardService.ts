import { db, now } from '../utils/firebase';

export interface DashboardDeltas {
  trustScoreDelta?: number;
  patrimonyDelta?: number;
  impactScoreDelta?: number;
}

export class DashboardService {
  async updateMemberDashboard(memberId: string, deltas?: DashboardDeltas) {
    const ref = db.collection('member_dashboard').doc(memberId);
    const snap = await ref.get();
    const current = snap.exists ? snap.data() : { trustScore: 85, patrimonyTotal: 1200, impactScore: 45 };

    const newTrust = (current?.trustScore ?? 85) + (deltas?.trustScoreDelta ?? 0);
    const newPatrimony = (current?.patrimonyTotal ?? 1200) + (deltas?.patrimonyDelta ?? 0);
    const newImpact = (current?.impactScore ?? 45) + (deltas?.impactScoreDelta ?? 0);

    const updatedData = {
      memberId,
      trustScore: newTrust,
      patrimonyTotal: newPatrimony,
      impactScore: newImpact,
      updatedAt: now()
    };

    await ref.set(updatedData, { merge: true });
    return updatedData;
  }
}
