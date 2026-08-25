export interface Organization {
  id: string;
  name: string;
  adminId: string;
  serviceFeePercentage: number; // Configurable percentage (e.g. 5 = 5%)
  serviceFeeFixed: number;      // Configurable fixed fee in A$
  status: 'active' | 'suspended';
  createdAt: FirebaseFirestore.Timestamp | string;
  updatedAt: FirebaseFirestore.Timestamp | string;
}
