import * as fs from 'fs';
import * as path from 'path';
import { Room } from '../models/Room';
import { SongModel } from '../models/Song';

const SESSIONS_DIR = path.join(__dirname, '../../sessions');
const MAX_AGE_DAYS = 7;

interface PersistedSong {
  id: string;
  title: string;
  artist: string;
  link?: string;
  votes: number[];
  totalVotes: number;
  averageScore?: number;
  submitterClientId?: string;
}

interface PersistedSession {
  roomCode: string;
  password: string | null;
  phase: 'submission' | 'presentation' | 'results';
  songs: PersistedSong[];
  currentSongIndex: number;
  presentationOrder: string[];
  createdAt: string;
  savedAt: string;
}

function ensureDir(): void {
  if (!fs.existsSync(SESSIONS_DIR)) {
    fs.mkdirSync(SESSIONS_DIR, { recursive: true });
  }
}

function filePath(roomCode: string): string {
  return path.join(SESSIONS_DIR, `${roomCode}.json`);
}

export function save(room: Room): void {
  ensureDir();
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

  const data: PersistedSession = {
    roomCode: room.roomCode,
    password: (room as any).password,
    phase: room.session.phase,
    songs,
    currentSongIndex: room.session.currentSongIndex,
    presentationOrder: room.session.presentationOrder,
    createdAt: room.createdAt.toISOString(),
    savedAt: new Date().toISOString(),
  };

  fs.writeFile(filePath(room.roomCode), JSON.stringify(data, null, 2), err => {
    if (err) console.error(`[SessionPersistence] Failed to save ${room.roomCode}:`, err);
  });
}

export function loadAll(): Room[] {
  ensureDir();
  const rooms: Room[] = [];
  const maxAgeMs = MAX_AGE_DAYS * 24 * 60 * 60 * 1000;

  let files: string[];
  try {
    files = fs.readdirSync(SESSIONS_DIR).filter(f => f.endsWith('.json'));
  } catch {
    return rooms;
  }

  for (const file of files) {
    try {
      const raw = fs.readFileSync(path.join(SESSIONS_DIR, file), 'utf-8');
      const data: PersistedSession = JSON.parse(raw);

      // Skip sessions older than MAX_AGE_DAYS
      if (Date.now() - new Date(data.savedAt).getTime() > maxAgeMs) {
        fs.unlink(path.join(SESSIONS_DIR, file), () => {});
        continue;
      }

      const room = new Room(data.roomCode);

      // Restore password via private field access
      (room as any).password = data.password;

      // Restore songs
      for (const s of data.songs) {
        const song = new SongModel(s.title, s.artist, s.link, s.submitterClientId);
        song.id = s.id; // restore original ID
        song.votes = s.votes;
        song.totalVotes = s.totalVotes;
        song.averageScore = s.averageScore;
        room.session.songs.set(song.id, song);
      }

      // Restore presentation state
      room.session.phase = data.phase;
      room.session.currentSongIndex = data.currentSongIndex;
      room.session.presentationOrder = data.presentationOrder;

      // Restore createdAt
      (room as any).createdAt = new Date(data.createdAt);

      rooms.push(room);
      console.log(`[SessionPersistence] Restored room ${data.roomCode} (phase: ${data.phase}, songs: ${data.songs.length})`);
    } catch (err) {
      console.error(`[SessionPersistence] Failed to load ${file}:`, err);
    }
  }

  return rooms;
}

export function remove(roomCode: string): void {
  const fp = filePath(roomCode);
  if (fs.existsSync(fp)) {
    fs.unlink(fp, err => {
      if (err) console.error(`[SessionPersistence] Failed to delete ${roomCode}:`, err);
    });
  }
}
