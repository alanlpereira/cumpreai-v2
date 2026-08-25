import { db, now } from '../utils/firebase';

export class CommitmentService {
  async createCommitment(input: { journeyId: string; memberId: string; title: string; dueDate?: FirebaseFirestore.Timestamp }) {
    const ref = db.collection('commitments').doc();
    const data = { id: ref.id, journeyId: input.journeyId, memberId: input.memberId, title: input.title, dueDate: input.dueDate ?? null, progress: 0, status: 'active', createdAt: now(), updatedAt: now() };
    await ref.set(data);
    return data;
  }

  async updateCommitment(input: { commitmentId: string; memberId: string; progress: number }) {
    const ref = db.collection('commitments').doc(input.commitmentId);
    const status = input.progress >= 100 ? 'completed' : 'active';
    await ref.update({ progress: input.progress, status, lastUpdate: now(), updatedAt: now(), completedAt: input.progress >= 100 ? now() : null });
    return (await ref.get()).data();
  }
}
