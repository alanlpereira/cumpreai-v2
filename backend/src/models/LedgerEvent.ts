export interface LedgerEvent { id: string; actorId: string; entity: string; entityId: string; action: string; metadata?: Record<string, unknown>; timestamp: FirebaseFirestore.Timestamp; }
