export interface Candidate {
  id: string;
  name: string;
  noUrut: number;
  vision: string;
  mission: string;
  photoUrl: string; // URL or placeholder
  votes: number;
}

export interface TokenData {
  id: string; // The token string itself
  isUsed: boolean;
  generatedAt: number; // Timestamp
  usedAt?: number; // Timestamp
}

export interface VotingState {
  status: 'idle' | 'validating' | 'voting' | 'submitting' | 'success' | 'error';
  message?: string;
  token?: string;
}

export enum ViewState {
  HOME = 'HOME',
  USER_VOTING = 'USER_VOTING',
  ADMIN_LOGIN = 'ADMIN_LOGIN',
  ADMIN_DASHBOARD = 'ADMIN_DASHBOARD'
}
