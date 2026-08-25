import { db, now } from '../utils/firebase';

export interface TreasuryAccount {
  id: string;
  entityType: 'organization' | 'platform' | 'member';
  entityId: string;
  balanceA$: number;
  totalFiatDepositedBRL: number;
  totalFiatWithdrawnBRL: number;
  updatedAt: string;
}

export interface PaymentTransaction {
  id: string;
  type: 'deposit_pix' | 'withdraw_pix' | 'service_fee_revenue';
  entityId: string;
  amountBRL: number;
  amountA$: number;
  status: 'pending' | 'completed' | 'failed';
  pixKey?: string;
  gatewayTxId: string;
  createdAt: string;
}

export class TreasuryService {
  private treasuries: Map<string, TreasuryAccount> = new Map();
  private transactions: Map<string, PaymentTransaction> = new Map();
  private platformRevenueA$: number = 0;

  constructor() {
    // Initialize Platform Master Treasury
    this.treasuries.set('platform_master', {
      id: 'platform_master',
      entityType: 'platform',
      entityId: 'cumpreai_platform',
      balanceA$: 0,
      totalFiatDepositedBRL: 0,
      totalFiatWithdrawnBRL: 0,
      updatedAt: now()
    });
  }

  /**
   * Deposit Fiat (R$) via PIX / Stripe -> Mints A$ into Organization Treasury.
   */
  public async depositFiatToOrgTreasury(data: {
    orgId: string;
    amountBRL: number;
    paymentMethod?: 'pix' | 'stripe' | 'credit_card';
  }): Promise<{ treasury: TreasuryAccount; transaction: PaymentTransaction }> {
    if (data.amountBRL <= 0) throw new Error('Valor de depósito deve ser maior que zero.');

    const gatewayTxId = 'pix_tx_' + Math.random().toString(36).substr(2, 9);
    const amountA$ = data.amountBRL; // Parity: 1 BRL = 1 A$

    let treasury = this.treasuries.get(data.orgId);
    if (!treasury) {
      treasury = {
        id: 'treasury_' + data.orgId,
        entityType: 'organization',
        entityId: data.orgId,
        balanceA$: 0,
        totalFiatDepositedBRL: 0,
        totalFiatWithdrawnBRL: 0,
        updatedAt: now()
      };
    }

    treasury.balanceA$ += amountA$;
    treasury.totalFiatDepositedBRL += data.amountBRL;
    treasury.updatedAt = now();
    this.treasuries.set(data.orgId, treasury);

    const tx: PaymentTransaction = {
      id: 'tx_' + Math.random().toString(36).substr(2, 9),
      type: 'deposit_pix',
      entityId: data.orgId,
      amountBRL: data.amountBRL,
      amountA$,
      status: 'completed',
      gatewayTxId,
      createdAt: now()
    };
    this.transactions.set(tx.id, tx);

    await db.collection('treasuries').doc(data.orgId).set(treasury, { merge: true });
    await db.collection('payment_transactions').doc(tx.id).set(tx);

    return { treasury, transaction: tx };
  }

  /**
   * Records platform service fee revenue collected from commitments.
   */
  public async recordPlatformServiceFeeRevenue(amountA$: number) {
    this.platformRevenueA$ += amountA$;

    const platformAccount = this.treasuries.get('platform_master');
    if (platformAccount) {
      platformAccount.balanceA$ += amountA$;
      platformAccount.updatedAt = now();
    }
  }

  /**
   * Process member payout (A$ -> R$) via PIX Key.
   */
  public async processMemberPixPayout(data: {
    memberId: string;
    amountA$: number;
    pixKey: string;
    memberCurrentBalanceA$: number;
  }): Promise<{ success: boolean; payoutBRL: number; remainingA$: number; transaction: PaymentTransaction }> {
    if (data.amountA$ <= 0) throw new Error('Valor de saque deve ser maior que zero.');
    if (data.amountA$ > data.memberCurrentBalanceA$) {
      throw new Error(`Saldo insuficiente. Saldo disponível: ${data.memberCurrentBalanceA$} A$, Solicitado: ${data.amountA$} A$.`);
    }

    const payoutBRL = data.amountA$; // Parity 1 A$ = 1 BRL
    const gatewayTxId = 'pix_out_' + Math.random().toString(36).substr(2, 9);
    const remainingA$ = data.memberCurrentBalanceA$ - data.amountA$;

    const tx: PaymentTransaction = {
      id: 'tx_out_' + Math.random().toString(36).substr(2, 9),
      type: 'withdraw_pix',
      entityId: data.memberId,
      amountBRL: payoutBRL,
      amountA$: data.amountA$,
      status: 'completed',
      pixKey: data.pixKey,
      gatewayTxId,
      createdAt: now()
    };

    this.transactions.set(tx.id, tx);
    await db.collection('payment_transactions').doc(tx.id).set(tx);

    return {
      success: true,
      payoutBRL,
      remainingA$,
      transaction: tx
    };
  }

  public getOrgTreasury(orgId: string): TreasuryAccount | undefined {
    return this.treasuries.get(orgId);
  }

  public getPlatformMasterBalance(): { balanceA$: number; totalRevenueBRL: number } {
    return {
      balanceA$: this.platformRevenueA$,
      totalRevenueBRL: this.platformRevenueA$
    };
  }
}
