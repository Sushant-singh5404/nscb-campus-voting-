export type PostCategory = 'executive' | 'activity' | 'representative';

export interface ElectionPost {
  id: string;
  title: string;
  category: PostCategory;
  categoryLabel: string;
  description: string;
  isDepartmentSpecific?: boolean;
  maxSelections: number;
}

export interface Candidate {
  id: string;
  name: string;
  rollNumber: string;
  postId: string;
  department: string;
  year: string;
  cgpa: number;
  avatarUrl: string;
  symbolName: string;
  symbolIcon: string;
  slogan: string;
  bio: string;
  agenda: string[];
  achievements: string[];
  votesCount: number;
}

export interface DepartmentInfo {
  id: string;
  name: string;
  code: string;
  totalStudents: number;
  icon: string;
  description: string;
  building: string;
}

export interface VoterProfile {
  uid?: string; // Firebase Auth UID
  studentId: string;
  name: string;
  departmentId: string;
  year: string;
  email: string;
  password?: string;
  pin?: string;
  collegeIdNumber?: string;
  isVerified: boolean;
  hasVoted: boolean;
  receiptHash?: string;
  votedAt?: string;
  registeredAt?: string;
}

export interface VaultBallot {
  ballotId: string;
  voterId?: string; // Firebase Auth UID (stored for verification)
  voterRollHash: string; // anonymized hash for privacy
  departmentId: string;
  timestamp: string;
  receiptHash: string;
  signature: string;
  selections: Record<string, string>; // postId -> candidateId
  status: 'sealed' | 'verified';
  blockNumber: number;
}

export interface VaultAuditStats {
  totalSealedBallots: number;
  registeredVotersCount: number;
  lastSealedTimestamp: string;
  vaultStatus: 'ARMED_AND_SEALING' | 'POLLS_CLOSED' | 'AUDIT_VERIFIED';
  integrityIndex: string;
}
