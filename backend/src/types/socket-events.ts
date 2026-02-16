export interface Song {
  id: string;
  title: string;
  artist: string;
  link?: string;
  averageScore?: number;
  votes: number[];
  totalVotes: number;
}

export interface VotingSession {
  phase: 'submission' | 'presentation' | 'results';
  songs: Map<string, Song>;
  currentSongIndex: number;
  presentationOrder: string[];
  connectedStudents: Set<string>;
  votedStudents: Set<string>;
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

export interface ExportRequest {
  format: 'csv' | 'pdf';
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  message?: string;
}

// Socket Event Names
export const SocketEvents = {
  // Client to Server
  CREATE_ROOM: 'create-room',
  JOIN_ROOM: 'join-room',
  SUBMIT_SONG: 'submit-song',
  EDIT_SONG: 'edit-song',
  DELETE_SONG: 'delete-song',
  START_PRESENTATION: 'start-presentation',
  NEXT_SONG: 'next-song',
  SUBMIT_VOTE: 'submit-vote',
  ADMIN_LOGIN: 'admin-login',
  EXPORT_RESULTS: 'export-results',
  RESET_SESSION: 'reset-session',
  CHECK_PASSWORD_STATUS: 'check-password-status',
  SET_PASSWORD: 'set-password',

  // Server to Client
  ROOM_CREATED: 'room-created',
  ROOM_JOINED: 'room-joined',
  ROOM_ERROR: 'room-error',
  SONGS_UPDATED: 'songs-updated',
  CURRENT_SONG: 'current-song',
  VOTING_COMPLETE: 'voting-complete',
  FINAL_RESULTS: 'final-results',
  VOTE_STATS: 'vote-stats',
  AUTH_RESULT: 'auth-result',
  PHASE_CHANGED: 'phase-changed',
  PASSWORD_STATUS: 'password-status',
  ERROR: 'error',
} as const;
