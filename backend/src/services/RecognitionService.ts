import { DashboardService } from './DashboardService';
import { OrganizationService } from './OrganizationService';

export interface RecognitionResult {
  memberId: string;
  grossRewardA$: number;
  serviceFeeDeductedA$: number;
  netRewardA$: number;
  trustScoreAdded: number;
  impactScoreAdded: number;
}

export class RecognitionService {
  constructor(
    private dashboards: DashboardService,
    private orgsService: OrganizationService
  ) {}

  public async issueRecognition(data: {
    memberId: string;
    commitmentId: string;
    orgId?: string;
    baseRewardA$?: number;
    baseTrust?: number;
    baseImpact?: number;
  }): Promise<RecognitionResult> {
    const grossA$ = data.baseRewardA$ ?? 250;
    const trust = data.baseTrust ?? 5;
    const impact = data.baseImpact ?? 10;

    let feePercentage = 0;
    let fixedFee = 0;

    if (data.orgId) {
      const org = await this.orgsService.getOrganization(data.orgId);
      if (org) {
        feePercentage = org.serviceFeePercentage;
        fixedFee = org.serviceFeeFixed;
      }
    }

    const percentageFeeVal = Math.round((grossA$ * feePercentage) / 100);
    const totalFee = percentageFeeVal + fixedFee;
    const netA$ = Math.max(0, grossA$ - totalFee);

    // Update dashboard via DashboardService
    await this.dashboards.updateMemberDashboard(data.memberId, {
      trustScoreDelta: trust,
      patrimonyDelta: netA$,
      impactScoreDelta: impact
    });

    return {
      memberId: data.memberId,
      grossRewardA$: grossA$,
      serviceFeeDeductedA$: totalFee,
      netRewardA$: netA$,
      trustScoreAdded: trust,
      impactScoreAdded: impact
    };
  }
}
