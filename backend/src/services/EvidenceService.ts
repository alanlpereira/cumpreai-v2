import { db, now } from '../utils/firebase';
import { GeminiOracleService } from './GeminiOracleService';

export class EvidenceService {
  private aiOracle = new GeminiOracleService();

  async submitEvidence(input: {
    ownerId: string;
    commitmentId: string;
    type: 'photo' | 'video' | 'document' | 'link';
    url: string;
    commitmentTitle?: string;
  }) {
    const ref = db.collection('evidences').doc();

    // Trigger Gemini AI Oracle analysis
    const title = input.commitmentTitle ?? 'Compromisso Baseline';
    const aiResult = await this.aiOracle.analyzeEvidence(title, input.type, input.url);

    const data = {
      id: ref.id,
      ownerId: input.ownerId,
      commitmentId: input.commitmentId,
      type: input.type,
      url: input.url,
      status: aiResult.isValidated ? 'validated' : 'reviewing',
      aiValidated: aiResult.isValidated,
      aiConfidenceScore: aiResult.confidenceScore,
      aiAnalysisNotes: aiResult.analysisNotes,
      createdAt: now()
    };

    await ref.set(data);
    return data;
  }
}
