import { db, now } from '../utils/firebase';

export class LedgerService {
  async write(event: { actorId: string; entity: string; entityId: string; action: string; metadata?: Record<string, unknown> }) {
    const ref = db.collection('ledger').doc();
    const data = { id: ref.id, ...event, timestamp: now() };
    await ref.set(data);
    return data;
  }
}
