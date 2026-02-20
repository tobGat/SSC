import { Room } from '../models/Room';
import { SongModel } from '../models/Song';

export interface PersistedSong {
  id: string;
  title: string;
  artist: string;
  link?: string;
  votes: number[];
  totalVotes: number;
  averageScore?: number;
  submitterClientId?: string;
}

export interface PersistedSession {
  roomCode: string;
  password: string | null;
  phase: 'submission' | 'presentation' | 'results';
  songs: PersistedSong[];
  currentSongIndex: number;
  presentationOrder: string[];
  createdAt: string;
  savedAt: string;
}

export function buildPersistedData(room: Room): PersistedSession {
  const songs: PersistedSong[] = Array.from(room.session.songs.values()).map(s => ({
    id: s.id,
    title: s.title,
    artist: s.artist,
    link: s.link,
    votes: s.votes,
    totalVotes: s.totalVotes,
    averageScore: s.averageScore,
    submitterClientId: s.submitterClientId,
  }));

  return {
    roomCode: room.roomCode,
    password: (room as any).password,
    phase: room.session.phase,
    songs,
    currentSongIndex: room.session.currentSongIndex,
    presentationOrder: room.session.presentationOrder,
    createdAt: room.createdAt.toISOString(),
    savedAt: new Date().toISOString(),
  };
}

export function restoreRoomFromData(data: PersistedSession, overrideCode?: string): Room {
  const code = overrideCode || data.roomCode;
  const room = new Room(code);

  (room as any).password = data.password;

  for (const s of data.songs) {
    const song = new SongModel(s.title, s.artist, s.link, s.submitterClientId);
    song.id = s.id;
    song.votes = s.votes;
    song.totalVotes = s.totalVotes;
    song.averageScore = s.averageScore;
    room.session.songs.set(song.id, song);
  }

  room.session.phase = data.phase;
  room.session.currentSongIndex = data.currentSongIndex;
  room.session.presentationOrder = data.presentationOrder;
  (room as any).createdAt = new Date(data.createdAt);

  return room;
}
