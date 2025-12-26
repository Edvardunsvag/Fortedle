import type { LeaderboardData } from './types';
import { getApiUrl } from '@/shared/utils/apiConfig';

export interface SubmitScoreRequest {
  name: string;
  score: number;
  avatarImageUrl?: string;
}

export interface SubmitScoreResponse {
  result: LeaderboardData;
}

export const fetchLeaderboard = async (date?: string): Promise<LeaderboardData> => {
  const url = date 
    ? `${getApiUrl('/api/leaderboard')}?date=${date}` 
    : getApiUrl('/api/leaderboard');
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch leaderboard: ${response.status} ${response.statusText}`);
  }
  
  return await response.json() as LeaderboardData;
};

export const submitScore = async (
  request: SubmitScoreRequest
): Promise<LeaderboardData> => {
  const response = await fetch(getApiUrl('/api/leaderboard'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to submit score');
  }

  const result: SubmitScoreResponse = await response.json();
  return result.result;
};

