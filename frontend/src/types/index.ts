export interface Song {
  id: string;
  title: string;
  artist: string;
  link?: string;
  averageScore?: number;
  votes: number[];
  totalVotes: number;
}

export interface SongSubmission {
  title: string;
  artist: string;
  link?: string;
}

export interface SongEdit {
  id: string;
  title: string;
  artist: string;
  link?: string;
}

export interface VoteSubmission {
  songId: string;
  points: number;
}

export interface VotingStats {
  voted: number;
  total: number;
}

export interface CurrentSongData {
  song: Song;
  songNumber: number;
  totalSongs: number;
  votingStats: VotingStats;
}

export interface SongRanking {
  rank: number;
  song: Song;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  message?: string;
}

export type Phase = 'submission' | 'presentation' | 'results';

export interface ExportData {
  format: 'csv' | 'pdf';
  data: string;
}
