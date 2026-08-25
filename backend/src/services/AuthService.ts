import { OrganizationService } from './OrganizationService';
import { db, now } from '../utils/firebase';

export interface AuthUserContext {
  uid: string;
  email?: string;
  memberType: 'individual' | 'organization';
  orgId?: string;
  role: 'person' | 'organization_admin' | 'community_admin' | 'auditor' | 'super_admin';
}

export class AuthService {
  constructor(private orgsService: OrganizationService) {}

  /**
   * Verifies authentication context and resolves user multi-tenant role and organization.
   */
  public async resolveAuthContext(uid: string, email?: string): Promise<AuthUserContext> {
    const memberDoc = await db.collection('members').doc(uid).get();

    if (!memberDoc.exists) {
      return {
        uid,
        email: email || `${uid}@cumpre.ai`,
        memberType: 'individual',
        role: 'person'
      };
    }

    const data = memberDoc.data();
    return {
      uid,
      email: data.email || email,
      memberType: data.memberType || 'individual',
      orgId: data.orgId,
      role: data.orgId ? 'organization_admin' : 'person'
    };
  }

  /**
   * Registers a member using an Organization Invitation Token.
   */
  public async registerWithInviteToken(data: {
    uid: string;
    name: string;
    email: string;
    inviteToken: string;
  }) {
    const invite = await this.orgsService.getInvitationByToken(data.inviteToken);
    if (!invite || invite.status !== 'pending') {
      throw new Error('Token de convite inválido ou expirado');
    }

    const memberData = {
      id: data.uid,
      name: data.name,
      email: data.email,
      memberType: 'organization',
      orgId: invite.orgId,
      activeContext: invite.orgName,
      status: 'active',
      createdAt: now(),
      updatedAt: now()
    };

    await db.collection('members').doc(data.uid).set(memberData, { merge: true });

    // Mark invitation token as accepted
    invite.status = 'accepted';

    return {
      member: memberData,
      organizationId: invite.orgId,
      orgName: invite.orgName
    };
  }
}
