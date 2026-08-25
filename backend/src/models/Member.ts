export interface Member {
  id: string;
  name: string;
  email: string;
  photoUrl?: string;
  memberType: 'individual' | 'organization';
  orgId?: string;
  activeContext?: string;
  status: 'active' | 'suspended' | 'archived';
  createdAt: FirebaseFirestore.Timestamp | string;
  updatedAt: FirebaseFirestore.Timestamp | string;
}
