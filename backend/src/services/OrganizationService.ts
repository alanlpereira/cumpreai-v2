import { Organization } from '../models/Organization';
import { Invitation } from '../models/Invitation';

export class OrganizationService {
  private orgs: Map<string, Organization> = new Map();
  private invitations: Map<string, Invitation> = new Map();

  public async createOrganization(data: {
    name: string;
    adminId: string;
    serviceFeePercentage?: number;
    serviceFeeFixed?: number;
  }): Promise<Organization> {
    const id = 'org_' + Math.random().toString(36).substr(2, 9);
    const org: Organization = {
      id,
      name: data.name,
      adminId: data.adminId,
      serviceFeePercentage: data.serviceFeePercentage ?? 5, // Default 5% service fee
      serviceFeeFixed: data.serviceFeeFixed ?? 0,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.orgs.set(id, org);
    return org;
  }

  /**
   * Updates organization service fee.
   * STRICT SECURITY RULE: Only the Platform Super Admin (Adm do App) can modify service fees!
   */
  public async updateServiceFee(data: {
    orgId: string;
    callerRole: 'super_admin' | 'organization_admin' | 'person' | 'member';
    serviceFeePercentage: number;
    serviceFeeFixed?: number;
  }): Promise<Organization> {
    const org = this.orgs.get(data.orgId);
    if (!org) throw new Error('Organização não encontrada');

    // CONSTITUTIONAL RULE: Org Admins CANNOT change service fees. Only Platform Super Admin (Adm do App).
    if (data.callerRole !== 'super_admin') {
      throw new Error('Permissão negada: Apenas o Administrador da Plataforma (Adm do App) tem permissão para alterar taxas de serviço de organizações.');
    }

    org.serviceFeePercentage = data.serviceFeePercentage;
    if (data.serviceFeeFixed !== undefined) org.serviceFeeFixed = data.serviceFeeFixed;
    org.updatedAt = new Date().toISOString();

    this.orgs.set(org.id, org);
    return org;
  }

  public async createInvitation(data: {
    orgId: string;
    invitedBy: string;
    email: string;
    role?: 'organization_admin' | 'member' | 'auditor';
  }): Promise<Invitation> {
    const org = this.orgs.get(data.orgId);
    const orgName = org ? org.name : 'Organização CumpreAI';

    const id = 'inv_' + Math.random().toString(36).substr(2, 9);
    const token = 'tok_' + Math.random().toString(36).substr(2, 12);

    const invite: Invitation = {
      id,
      orgId: data.orgId,
      orgName,
      email: data.email,
      invitedBy: data.invitedBy,
      token,
      role: data.role ?? 'member',
      status: 'pending',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 86400000).toISOString() // 7 days validity
    };

    this.invitations.set(token, invite);
    return invite;
  }

  public async getInvitationByToken(token: string): Promise<Invitation | undefined> {
    return this.invitations.get(token);
  }

  public async getOrganization(id: string): Promise<Organization | undefined> {
    return this.orgs.get(id);
  }
}
