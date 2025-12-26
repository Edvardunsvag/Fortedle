import { AsyncStatus } from '@/shared/redux/enums';

export interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  avatarImageUrl: string | null;
  submittedAt: string;
}

export interface LeaderboardData {
  date: string;
  leaderboard: LeaderboardEntry[];
}

export interface LeaderboardState {
  data: LeaderboardData | null;
  status: AsyncStatus;
  error: string | null;
  submitStatus: AsyncStatus;
  submitError: string | null;
}

