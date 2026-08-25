export interface Invitation {
  id: string;
  orgId: string;
  orgName: string;
  email: string;
  invitedBy: string;
  token: string;
  role: 'organization_admin' | 'member' | 'auditor';
  status: 'pending' | 'accepted' | 'expired';
  createdAt: FirebaseFirestore.Timestamp | string;
  expiresAt: FirebaseFirestore.Timestamp | string;
}
