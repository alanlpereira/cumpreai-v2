export interface Evidence {
  id: string;
  ownerId: string;
  commitmentId: string;
  type: 'photo' | 'video' | 'document' | 'link';
  url: string;
  status: 'sent' | 'reviewing' | 'validated' | 'rejected';
  aiValidated?: boolean;
  aiConfidenceScore?: number; // 0 to 100% score from Gemini Oracle
  aiAnalysisNotes?: string;
  createdAt: FirebaseFirestore.Timestamp | string;
}
