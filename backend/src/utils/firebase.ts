// Standalone / Emulator Firebase Mock Utils for CumpreAI V2
class InMemoryCollection {
  private docs: Map<string, any> = new Map();

  constructor(private name: string) {}

  doc(id?: string) {
    const docId = id || 'doc_' + Math.random().toString(36).substr(2, 9);
    return {
      id: docId,
      set: async (data: any, options?: any) => {
        const existing = this.docs.get(docId) || {};
        const merged = options?.merge ? { ...existing, ...data } : data;
        this.docs.set(docId, merged);
        return merged;
      },
      update: async (data: any) => {
        const existing = this.docs.get(docId) || {};
        const updated = { ...existing, ...data };
        this.docs.set(docId, updated);
        return updated;
      },
      get: async () => ({
        exists: this.docs.has(docId),
        data: () => this.docs.get(docId)
      })
    };
  }
}

class InMemoryDb {
  private collections: Map<string, InMemoryCollection> = new Map();

  collection(name: string) {
    if (!this.collections.has(name)) {
      this.collections.set(name, new InMemoryCollection(name));
    }
    return this.collections.get(name)!;
  }
}

export const db: any = new InMemoryDb();
export const now = () => new Date().toISOString();
